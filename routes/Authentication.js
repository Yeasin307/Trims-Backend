const express = require("express");
const bcrypt = require('bcrypt');
const router = express.Router();
const { sign } = require("jsonwebtoken");
const { Op } = require("sequelize");
const { Users } = require("../models");
const { verifyToken } = require("../middlewares/Auth");

router.post("/login", async (req, res) => {

    try {
        const { email, password } = req.body;

        const user = await Users.findOne({
            where: {
                [Op.and]: [
                    { email: `${email}` },
                    { verified: true },
                    { role_id: "admin" },
                    { active: '1' }
                ]
            }
        });

        if (!user) {
            res.status(401).json({ error: "User Doesn't Exist" });
        }
        else {
            bcrypt.compare(password, user.password, function (err, result) {

                if (err) {
                    res.status(401).json({ error: "Authentication Failed!" });
                }

                if (result) {

                    const token = sign(
                        { username: user.username, id: user.id },
                        process.env.JWT_SECRET,
                        {
                            expiresIn: '1d'
                        }
                    );

                    if (token) {

                        res.status(200).json({
                            "access_token": token,
                            "user": user
                        });
                    }
                    else {
                        res.status(500).json({ error: "Internal Server Error!" });
                    }
                }
                else {
                    res.status(401).json({ error: "Password not matched!" });
                }
            });
        }
    }
    catch (error) {
        res.status(401).json({ error: "Authentication Failed!" });
    }
});

router.post("/check-login", verifyToken, async (req, res) => {
    try {
        const { id } = req.body;

        const user = await Users.findOne({
            where: {
                id: id
            }
        });

        if (!user) {

            res.status(401).json({ error: "User Doesn't Exist" });
        }
        else {
            res.status(200).send(user);
        }
    }
    catch (error) {
        res.status(401).json({ error: "Authentication Failed!" });
    }
});

module.exports = router;