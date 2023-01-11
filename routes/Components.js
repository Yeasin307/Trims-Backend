const express = require("express");
const multer = require('multer');
const path = require("path");
const router = express.Router();
const { Users, Components } = require("../models");
const { verifyToken } = require("../middlewares/Auth");

const COMPONENTS_UPLOADS = "./uploads/components";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, COMPONENTS_UPLOADS);
    },
    filename: (req, file, cb) => {
        const fileExt = path.extname(file.originalname);

        const fileName = file.originalname
            .replace(fileExt, "")
            .toLowerCase()
            .split(" ")
            .join("-") + "-" + Date.now();

        cb(null, fileName + fileExt);
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 20000000, // 20MB
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === "images") {
            if (
                file.mimetype === "image/png" ||
                file.mimetype === "image/gif" ||
                file.mimetype === "image/jpg" ||
                file.mimetype === "image/jpeg"
            ) {
                cb(null, true);
            } else {
                cb(new Error("Only .jpg, .jpeg, .png or .gif format allowed!"));
            }
        } else if (file.fieldname === "files") {
            if (
                file.mimetype === "application/pdf" ||
                file.mimetype === "application/msword" ||
                file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ) {
                cb(null, true);
            } else {
                cb(new Error("Only .pdf, .doc or .docx format allowed!"));
            }
        } else {
            cb(new Error("There was an unknown error!"));
        }
    }
});

router.get("/", verifyToken, async (req, res) => {

    try {
        const components = await Components.findAll({
            order: [
                ['position', 'ASC']
            ]
        });

        if (!components) {
            res.status(400).json({ error: "Bad Request!" });
        }
        else {
            res.status(200).send(components);
        }
    }
    catch (error) {
        res.status(401).json({ error: error });
    }
});

router.get("/slider", async (req, res) => {

    try {
        const slider = await Components.findAll({
            attributes: ['id', 'image', 'title', 'subtitle'],
            where: {
                active: "1",
                deleted: "0",
                type: 'HOME_SLIDER'
            },
            order: [
                ['position', 'ASC']
            ]
        });

        if (!slider) {
            res.status(400).json({ error: "Bad Request!" });
        }
        else {
            res.status(200).send(slider);
        }
    }
    catch (error) {
        res.status(401).json({ error: error });
    }
});

router.get("/about", async (req, res) => {

    try {
        const about = await Components.findOne({
            attributes: ['id', 'image', 'title', 'subtitle', 'description'],
            where: {
                active: "1",
                deleted: "0",
                type: 'ABOUT_US'
            }
        });

        if (!about) {
            res.status(400).json({ error: "Bad Request!" });
        }
        else {
            res.status(200).send(about);
        }
    }
    catch (error) {
        res.status(401).json({ error: error });
    }
});

router.get("/vision", async (req, res) => {

    try {
        const vision = await Components.findOne({
            attributes: ['id', 'title', 'description'],
            where: {
                active: "1",
                deleted: "0",
                type: 'VISION'
            }
        });

        if (!vision) {
            res.status(400).json({ error: "Bad Request!" });
        }
        else {
            res.status(200).send(vision);
        }
    }
    catch (error) {
        res.status(401).json({ error: error });
    }
});

router.get("/mission", async (req, res) => {

    try {
        const mission = await Components.findOne({
            attributes: ['id', 'title', 'description'],
            where: {
                active: "1",
                deleted: "0",
                type: 'MISSION'
            }
        });

        if (!mission) {
            res.status(400).json({ error: "Bad Request!" });
        }
        else {
            res.status(200).send(mission);
        }
    }
    catch (error) {
        res.status(401).json({ error: error });
    }
});

router.get("/goal", async (req, res) => {

    try {
        const goal = await Components.findOne({
            attributes: ['id', 'title', 'description'],
            where: {
                active: "1",
                deleted: "0",
                type: 'GOAL'
            }
        });

        if (!goal) {
            res.status(400).json({ error: "Bad Request!" });
        }
        else {
            res.status(200).send(goal);
        }
    }
    catch (error) {
        res.status(401).json({ error: error });
    }
});

router.get("/client", async (req, res) => {

    try {
        const client = await Components.findOne({
            attributes: ['id', 'image', 'title', 'description'],
            where: {
                active: "1",
                deleted: "0",
                type: 'CLIENT'
            }
        });

        if (!client) {
            res.status(400).json({ error: "Bad Request!" });
        }
        else {
            res.status(200).send(client);
        }
    }
    catch (error) {
        res.status(401).json({ error: error });
    }
});

router.get("/gallery", async (req, res) => {

    try {
        const gallery = await Components.findAll({
            attributes: ['id', 'image', 'title'],
            where: {
                active: "1",
                deleted: "0",
                type: 'GALLERY'
            },
            order: [
                ['position', 'ASC']
            ]
        });

        if (!gallery) {
            res.status(400).json({ error: "Bad Request!" });
        }
        else {
            res.status(200).send(gallery);
        }
    }
    catch (error) {
        res.status(401).json({ error: error });
    }
});

router.get("/management", async (req, res) => {

    try {
        const management = await Components.findAll({
            attributes: ['id', 'image', 'title', 'subtitle'],
            where: {
                active: "1",
                deleted: "0",
                type: 'MANAGEMENT'
            },
            order: [
                ['position', 'ASC']
            ]
        });

        if (!management) {
            res.status(400).json({ error: "Bad Request!" });
        }
        else {
            res.status(200).send(management);
        }
    }
    catch (error) {
        res.status(401).json({ error: error });
    }
});

router.get("/message", async (req, res) => {

    try {
        const message = await Components.findOne({
            attributes: ['id', 'image', 'title', 'description'],
            where: {
                active: "1",
                deleted: "0",
                type: 'CEO_MESSAGE'
            }
        });

        if (!message) {
            res.status(400).json({ error: "Bad Request!" });
        }
        else {
            res.status(200).send(message);
        }
    }
    catch (error) {
        res.status(401).json({ error: error });
    }
});

router.get("/profile", async (req, res) => {

    try {
        const profile = await Components.findOne({
            attributes: ['id', 'file', 'video'],
            where: {
                active: "1",
                deleted: "0",
                type: 'COMPANY_PROFILE'
            }
        });

        if (!profile) {
            res.status(400).json({ error: "Bad Request!" });
        }
        else {
            res.status(200).send(profile);
        }
    }
    catch (error) {
        res.status(401).json({ error: error });
    }
});

router.get("/viewcomponent/:id", verifyToken, async (req, res) => {
    try {
        const id = req.params.id;

        const component = await Components.findOne({
            where: {
                id: id
            },
            include: [
                {
                    as: 'createdByUser',
                    model: Users
                },
                {
                    as: 'updatedByUser',
                    model: Users
                }
            ]
        });

        if (!component) {
            res.status(400).send("Bad Request!");
        }
        else {
            res.status(200).send(component);
        }
    }
    catch (error) {
        res.status(401).json({ error: "error" });
    }
});

router.post("/create", verifyToken, upload.any(), async (req, res) => {
    try {
        let { type, id, title, subtitle, description, position, video } = req.body;

        if (req?.body?.type === "HOME_SLIDER" || req?.body?.type === "GALLERY" || req?.body?.type === "MANAGEMENT") {
            if (position === undefined) {
                position = 99999;
            }
        }

        if (req?.body?.type === "VISION" || req?.body?.type === "MISSION" || req?.body?.type === "GOAL") {

            const component = await Components.create({ type, title, subtitle, description, position, video, createdBy: id, updatedBy: id });

            if (!component) {
                res.status(400).json({ error: "Bad Request!" });
            }
            else {
                res.status(200).send("Component created successfully!");
            }
        }
        else if (req?.body?.type === "HOME_SLIDER" || req?.body?.type === "ABOUT_US" || req?.body?.type === "GALLERY" || req?.body?.type === "MANAGEMENT" || req?.body?.type === "CEO_MESSAGE") {

            const component = await Components.create({ type, title, subtitle, description, position, video, image: req?.files[0]?.filename, createdBy: id, updatedBy: id });

            if (!component) {
                res.status(400).json({ error: "Bad Request!" });
            }
            else {
                res.status(200).send("Component created successfully!");
            }
        }
        else if (req?.body?.type === "CLIENT") {

            const imagesArray = [];
            for (const file of req?.files) {
                imagesArray.push(file?.filename);
            }

            const component = await Components.create({ type, title, subtitle, description, position, video, image: imagesArray, createdBy: id, updatedBy: id });

            if (!component) {
                res.status(400).json({ error: "Bad Request!" });
            }
            else {
                res.status(200).send("Component created successfully!");
            }
        }
        else if (req?.body?.type === "COMPANY_PROFILE") {

            const component = await Components.create({ type, title, subtitle, description, position, video, file: req?.files[0]?.filename, createdBy: id, updatedBy: id });

            if (!component) {
                res.status(400).json({ error: "Bad Request!" });
            }
            else {
                res.status(200).send("Component created successfully!");
            }
        }
        else {
            res.status(400).json({ error: "Bad Request!" });
        }
    }
    catch (error) {
        res.status(401).json({ error: "error" });
    }
});

router.put("/update", verifyToken, upload.any(), async (req, res) => {
    try {
        const { type, componentId, title, subtitle, description, position, previousImages, video, userId } = req.body;

        let imageFile = type === 'CLIENT' ? [] : null;

        if (previousImages) {
            const previousImagesArray = previousImages?.split(",");
            imageFile = [...previousImagesArray];
        }

        if (req?.files?.length && req?.files?.length > 0) {
            if (type === 'CLIENT') {
                for (const file of req?.files) {
                    imageFile.push(file?.filename);
                }
            }
            else {
                imageFile = req?.files[0]?.filename;
            }
        }

        const data = imageFile === null ? { title, subtitle, description, position, video, updatedBy: userId } : type === 'COMPANY_PROFILE' ? { video, file: imageFile, updatedBy: userId } : { title, subtitle, description, position, image: imageFile, video, updatedBy: userId }

        const componentUpdate = await Components.update(
            data,
            {
                where: {
                    id: componentId
                }
            });

        if (componentUpdate[0] > 0) {
            res.status(200).send("Updated Component Successfully!");
        }
        else {
            res.status(400).json({ error: "Bad Request!" });
        }
    }
    catch (error) {
        res.status(401).json({ error: "error" });
    }
});

router.put("/delete-image", verifyToken, async (req, res) => {
    try {
        const { componentId, image, userId } = req.body;

        const componentUpdate = await Components.update(
            { image, updatedBy: userId },
            {
                where: {
                    id: componentId
                }
            });

        if (componentUpdate[0] > 0) {
            res.status(200).send("Updated Component Successfully!");
        }
        else {
            res.status(400).json({ error: "Bad Request!" });
        }
    }
    catch (error) {
        res.status(401).json({ error: "error" });
    }
});

router.put("/activate-deactivate", verifyToken, async (req, res) => {
    try {
        const { componentId, userId, activateDeactivate } = req.body;

        const componentActivateDeactivate = await Components.update(
            { active: activateDeactivate, updatedBy: userId },
            {
                where: {
                    id: componentId
                }
            });

        if (componentActivateDeactivate[0] > 0) {
            res.status(200).send("Updated Component Successfully!");
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