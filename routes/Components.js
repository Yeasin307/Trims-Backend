const express = require("express");
const multer = require('multer');
const path = require("path");
const router = express.Router();
const { Users, Components } = require("../models");
const { verifyToken } = require("../MiddleWares/Auth");

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
        fileSize: 10000000, // 10MB
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
        const components = await Components.findAll();

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
        if (req?.body?.type === "TEXT") {
            const { name, type, text, id } = req.body;

            const component = await Components.create({ name, content: text, type, createdBy: id, updatedBy: id });

            if (!component) {
                res.status(400).json({ error: "Bad Request!" });
            }
            else {
                res.status(200).send("Component created successfully!");
            }
        }
        else if (req?.body?.type === "IMAGE") {
            const { name, type, id } = req.body;

            const imagesArray = [];
            for (const file of req?.files) {
                imagesArray.push(file?.filename);
            }
            const imagesObject = { images: imagesArray };

            const component = await Components.create({ name, content: imagesObject, type, createdBy: id, updatedBy: id });

            if (!component) {
                res.status(400).json({ error: "Bad Request!" });
            }
            else {
                res.status(200).send("Component created successfully!");
            }
        }
        else if (req?.body?.type === "FILE") {
            const { name, type, id } = req.body;

            const filesArray = [];
            for (const file of req?.files) {
                filesArray.push(file?.filename);
            }
            const filesObject = { files: filesArray };

            const component = await Components.create({ name, content: filesObject, type, createdBy: id, updatedBy: id });

            if (!component) {
                res.status(400).json({ error: "Bad Request!" });
            }
            else {
                res.status(200).send("Component created successfully!");
            }
        }
        else if (req?.body?.type === "VIDEO") {
            const { name, type, video, id } = req.body;

            const component = await Components.create({ name, content: video, type, createdBy: id, updatedBy: id });

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

router.put("/update", verifyToken, async (req, res) => {
    try {
        const { componentId, name, content, userId } = req.body;

        const componentUpdate = await Components.update(
            { name, content, updatedBy: userId },
            {
                where: {
                    id: componentId
                }
            });

        if (!componentUpdate) {
            res.status(400).json({ error: "Bad Request!" });
        }
        else {
            res.status(200).send("Updated Component Successfully!");
        }
    }
    catch (error) {
        res.status(401).json({ error: "error" });
    }
});

router.put("/update-with-image-file", verifyToken, upload.any(), async (req, res) => {
    try {
        if (req?.body?.type === "IMAGE") {
            const { componentId, name, id, previousImages } = req.body;

            const images = previousImages.split(",");

            for (const file of req?.files) {
                images.push(file?.filename);
            }
            const imagesObject = { images };

            const updatedComponent = await Components.update(
                { name, content: imagesObject, updatedBy: id },
                {
                    where: {
                        id: componentId
                    }
                });

            if (!updatedComponent) {
                res.status(400).json({ error: "Bad Request!" });
            }
            else {
                res.status(200).send("Component updated successfully!");
            }
        }
        else if (req?.body?.type === "FILE") {
            const { componentId, name, id, previousFiles } = req.body;

            const files = previousFiles.split(",");

            for (const file of req?.files) {
                files.push(file?.filename);
            }
            const filesObject = { files };

            const updatedComponent = await Components.update(
                { name, content: filesObject, updatedBy: id },
                {
                    where: {
                        id: componentId
                    }
                });

            if (!updatedComponent) {
                res.status(400).json({ error: "Bad Request!" });
            }
            else {
                res.status(200).send("Component updated successfully!");
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

router.put("/delete-image-file", verifyToken, async (req, res) => {
    try {
        const { type, componentId, content, userId } = req.body;

        if (type === "IMAGE") {
            const imagesObject = { images: content };

            const componentUpdate = await Components.update(
                { content: imagesObject, updatedBy: userId },
                {
                    where: {
                        id: componentId
                    }
                });

            if (!componentUpdate) {
                res.status(400).json({ error: "Bad Request!" });
            }
            else {
                res.status(200).send("Updated Component Successfully!");
            }
        }
        else if (type === "FILE") {
            const filesObject = { files: content };

            const componentUpdate = await Components.update(
                { content: filesObject, updatedBy: userId },
                {
                    where: {
                        id: componentId
                    }
                });

            if (!componentUpdate) {
                res.status(400).json({ error: "Bad Request!" });
            }
            else {
                res.status(200).send("Updated Component Successfully!");
            }
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

        if (!componentActivateDeactivate) {
            res.status(400).json({ error: "Bad Request!" });
        }
        else {
            res.status(200).send("Updated Component Successfully!");
        }
    }
    catch (error) {
        res.status(401).json({ error: "error" });
    }
});

module.exports = router;