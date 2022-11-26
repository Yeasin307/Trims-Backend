const express = require("express");
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const router = express.Router();
const { sign, verify } = require("jsonwebtoken");
const { Users } = require("../models");
const db = require("../models");
const { verifyToken } = require("../middlewares/Auth");

const transporter = nodemailer.createTransport({
    host: process.env.mail,
    port: 465,
    secure: true,
    auth: {
        user: process.env.user,
        pass: process.env.pass
    }
});

router.get("/", verifyToken, async (req, res) => {

    try {
        const users = await Users.findAll();

        if (!users) {
            res.status(400).json({ error: "Bad Request!" });
        }
        else {
            res.status(200).send(users);
        }
    }
    catch (error) {
        res.status(401).json({ error: error });
    }
});

router.get("/confirmation/:token", async (req, res) => {

    try {
        const token = req.params.token;

        const { id } = verify(token, process.env.JWT_SECRET);

        const user = await Users.update(
            { verified: true },
            {
                where: {
                    id: id
                }
            });

        if (user[0] > 0) {
            res.redirect('http://localhost:3000/login');
        }
        else {
            res.status(400).send('Bad Request!');
        }
    }
    catch (error) {
        res.status(500).send('Internal Server Error!');
    }
});

router.post("/create", verifyToken, async (req, res) => {

    try {
        const t = await db.sequelize.transaction();
        const { firstName, lastName, username, email, password } = req.body;

        bcrypt.hash(password, Number(process.env.saltRounds), async function (err, hash) {

            if (err) {
                await t.rollback();
                res.status(401).send("Error Occurrence!");
            }

            if (hash) {
                const user = await Users.create({ firstName, lastName, username, email, password: hash }, { transaction: t })
                    .then(async (user) => {

                        if (!user) {
                            await t.rollback();
                            res.status(400).send("Bad Request!");
                        }
                        else {
                            const token = sign(
                                { username: user.username, id: user.id },
                                process.env.JWT_SECRET,
                                {
                                    expiresIn: '1d'
                                }
                            );

                            const url = `http://localhost:5000/users/confirmation/${token}`

                            const mailOptions = {
                                from: '"Trims" <noreply@asdfashionbd.com>',
                                to: email,
                                subject: 'Confirm Email',
                                html: `Please click this link to confirm your email: <a href="${url}">${url}</a>`
                            };

                            transporter.sendMail(mailOptions, async function (error, info) {

                                if (error) {
                                    await t.rollback();
                                    res.status(500).send("Internal Server Error!");
                                }
                                if (info) {
                                    t.commit()
                                        .then(() => {
                                            res.status(200).send("Created user successfully! Please confirm your email.");
                                        });
                                }
                            });
                        }
                    })
                    .catch(async (error) => {
                        await t.rollback();
                        if (error.message === "Validation error") {
                            res.status(300).send("This username or email already exist!");
                        }
                    })
            }
        });
    }
    catch (error) {
        await t.rollback();
        res.status(401).send("Error Occurrence!");
    }
});

module.exports = router;