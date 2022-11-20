const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const { verifyToken } = require("../middlewares/Auth");

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

router.post("/create", verifyToken, async (req, res) => {
    try {
        const { firstName, lastName, username, email, password } = req.body;

        const user = await Users.create({ firstName, lastName, username, email, password });

        if (!user) {
            res.status(400).json({ error: "Bad Request!" });
        }
        else {
            res.status(200).send("Created User Successfully!");
        }
    }
    catch (error) {
        res.status(401).json({ error: "error" });
    }
});

module.exports = router;