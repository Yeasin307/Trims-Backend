const express = require("express");
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const router = express.Router();
const { sign, verify } = require("jsonwebtoken");
const { Users } = require("../models");
const db = require("../models");
const { verifyToken } = require("../middlewares/Auth");
const { where } = require("sequelize");

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
            res.redirect('https://admin.trimtex-bd.com/login');
        }
        else {
            res.status(400).send('Bad Request!');
        }
    }
    catch (error) {
        res.status(500).send('Internal Server Error!');
    }
});

router.get("/reset-password/:id/:token", async (req, res) => {

    try {
        const { id, token } = req.params;

        const user = await Users.findOne({
            where: {
                id: id
            }
        })

        if (!user) {
            res.status(401).send("User Not Found!");
        }
        else {
            const secret = process.env.JWT_SECRET + user.password;

            const payload = verify(token, secret);

            if (payload) {
                res.render('reset-password', { email: payload.email });
            }
            else {
                res.status(401).send("Invalid Link!");
            }
        }
    }
    catch (error) {
        res.status(401).send("Invalid Link!");
    }
});

router.post("/create", verifyToken, async (req, res) => {

    try {
        const t = await db.sequelize.transaction();
        const { firstName, lastName, username, email, password } = req.body;

        bcrypt.hash(password, Number(process.env.saltRounds), async function (err, hash) {

            if (err) {
                await t.rollback();
                res.status(500).send("Internal Server Error!");
            }

            if (hash) {

                Users.create({ firstName, lastName, username, email, password: hash }, { transaction: t })
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

                            const url = `https://server.trimtex-bd.com/users/confirmation/${token}`

                            const mailOptions = {
                                from: '"Trim Tex" <info@trimtex-bd.com>',
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
        res.status(500).send("Internal Server Error!");
    }
});

router.post("/resendconfirmation", verifyToken, async (req, res) => {

    try {
        const { email } = req.body;

        const user = await Users.findOne({
            where: {
                email: email
            }
        });

        if (!user) {
            res.status(400).send("This user not exist!");
        }
        else {
            const token = sign(
                { username: user.username, id: user.id },
                process.env.JWT_SECRET,
                {
                    expiresIn: '1d'
                }
            );

            const url = `https://server.trimtex-bd.com/users/confirmation/${token}`

            const mailOptions = {
                from: '"Trim Tex" <info@trimtex-bd.com>',
                to: email,
                subject: 'Confirm Email',
                html: `Please click this link to confirm your email: <a href="${url}">${url}</a>`
            };

            transporter.sendMail(mailOptions, async function (error, info) {

                if (error) {
                    res.status(500).send("Internal Server Error!");
                }
                if (info) {
                    res.status(200).send("Please confirm your email.");
                }
            });
        }
    }
    catch (error) {
        res.status(500).send("Internal Server Error!");
    }
});

router.post("/forgot-password", async (req, res) => {

    try {
        const { email } = req.body;

        const user = await Users.findOne({
            where: {
                email: email
            }
        })

        if (!user) {
            res.status(401).send("User not Found!");
        }
        else {

            const secret = process.env.JWT_SECRET + user.password;

            const payload = {
                email: user.email,
                id: user.id
            };

            const token = sign(payload, secret, { expiresIn: '30m' });

            const url = `https://server.trimtex-bd.com/users/reset-password/${user.id}/${token}`;

            const mailOptions = {
                from: '"Trim Tex" <info@trimtex-bd.com>',
                to: email,
                subject: 'Reset Password',
                html: `Please click this link to reset your password: <a href="${url}">${url}</a>`
            };

            transporter.sendMail(mailOptions, async function (error, info) {

                if (error) {
                    res.status(500).send("Internal Server Error!");
                }
                if (info) {
                    res.status(200).send('Password reset link has been successfully sent.');
                }
            });
        }
    }
    catch (error) {
        res.status(500).send("Internal Server Error!");
    }
});

router.post("/reset-password/:id/:token", async (req, res) => {

    try {
        const { id, token } = req.params;
        const { password, confirmPassword } = req.body;

        if (password === confirmPassword) {

            const user = await Users.findOne({
                where: {
                    id: id
                }
            })

            if (!user) {
                res.status(401).send("User Not Found!");
            }
            else {
                const secret = process.env.JWT_SECRET + user.password;

                const payload = verify(token, secret);

                if (payload) {

                    bcrypt.hash(password, Number(process.env.saltRounds), async function (err, hash) {

                        if (err) {
                            res.status(500).send("Internal Server Error!");
                        }

                        if (hash) {

                            const user = await Users.update(
                                { password: hash },
                                {
                                    where: {
                                        email: payload.email,
                                        id: payload.id
                                    }
                                });

                            if (user[0] > 0) {
                                res.status(200).send('Password Reset Successfully!');
                            }
                            else {
                                res.status(400).send('Bad Request!');
                            }
                        }
                    });
                }
                else {
                    res.status(401).send("Invalid Link!");
                }
            }
        }
        else {
            res.status(400).send("Password Not Matched!")
        }
    }
    catch (error) {
        res.status(500).send("Internal Server Error!");
    }
});

router.put("/update", verifyToken, async (req, res) => {

    try {
        const { firstName, lastName, username, password, newPassword, userId } = req.body;

        const user = await Users.findOne({
            where: {
                id: userId
            }
        });

        if (user) {

            bcrypt.compare(password, user.password, async function (err, result) {

                if (err) {
                    res.status(500).send("Internal Server Error!");
                }

                if (result) {

                    bcrypt.hash(newPassword, Number(process.env.saltRounds), async function (err, hash) {

                        if (err) {
                            res.status(500).send("Internal Server Error!");
                        }

                        if (hash) {

                            const updatedUser = await Users.update(
                                { username, password: hash, firstName, lastName },
                                {
                                    where: {
                                        id: userId
                                    }
                                });

                            if (updatedUser[0] > 0) {
                                res.status(200).send('Updated Profile Successfully!');
                            }
                            else {
                                res.status(400).send('Bad Request!');
                            }
                        }
                    });
                }
                else {
                    res.status(400).send("Password Not Matched!");
                }
            });
        }
        else {
            res.status(400).send('Bad Request!');
        }
    }
    catch (error) {
        res.status(500).send("Internal Server Error!");
    }
});

router.put("/activate-deactivate", verifyToken, async (req, res) => {
    try {
        const { userId, value } = req.body;

        const userActivateDeactivate = await Users.update(
            { active: value },
            {
                where: {
                    id: userId
                }
            });

        if (userActivateDeactivate[0] > 0) {
            res.status(200).send("Updated User Successfully!");
        }
        else {
            res.status(400).send('Bad Request!');
        }
    }
    catch (error) {
        res.status(500).send("Internal Server Error!");
    }
});

module.exports = router;