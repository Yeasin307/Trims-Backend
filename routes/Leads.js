const nodemailer = require('nodemailer');
const express = require("express");
const router = express.Router();
const { Leads } = require("../models");
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
        const leads = await Leads.findAll({
            order: [
                ['leadNum', 'DESC']
            ]
        });

        if (!leads) {
            res.status(400).json({ error: "Bad Request!" });
        }
        else {
            res.status(200).send(leads);
        }
    }
    catch (error) {
        res.status(401).json({ error: "error" });
    }
});

router.post("/create", async (req, res) => {
    try {
        const { email, fullName, address, phone, subject, message } = req.body;

        const lead = await Leads.create({ email, fullName, address, phone, subject, message });

        if (!lead) {
            res.status(400).json({ error: "Bad Request!" });
        }
        else {
            const mailOptions = {
                from: '"Trims" <noreply@asdfashionbd.com>',
                to: 'info.trimtexbd@gmail.com',
                replyTo: email,
                subject: subject,
                text: message
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    res.status(400).json({ error: "Bad Request!" });
                } else {
                    res.status(200).send("Created lead successfully!");
                }
            });
        }
    }
    catch (error) {
        res.status(401).json({ error: "error" });
    }
});

router.post("/lead-details", verifyToken, async (req, res) => {
    try {
        const { id } = req.body;
        const lead = await Leads.findOne({
            where: {
                id: id
            }
        });

        if (!lead) {
            res.status(400).json({ error: "Bad Request!" });
        }
        else {
            res.status(200).send(lead);
        }
    }
    catch (error) {
        res.status(401).json({ error: "error" });
    }
});

router.put("/seen", async (req, res) => {
    try {
        const { id } = req.body;
        const updatedLead = await Leads.update({ seen: '1' },
            {
                where: {
                    id: id
                }
            });

        if (updatedLead[0] > 0) {
            res.status(200).send("Updated lead successfully!");
        }
        else {
            res.status(400).json({ error: "Bad Request!" });
        }
    }
    catch (error) {
        res.status(401).json({ error: "error" });
    }
});

module.exports = router;