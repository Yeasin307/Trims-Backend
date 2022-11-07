const express = require("express");
const multer = require('multer');
const sharp = require('sharp');
const path = require("path");
const router = express.Router();
const { Users, Categories } = require("../models");
const { verifyToken } = require("../middlewares/Auth");

const IMAGES_UPLOADS = "./uploads/categoryimages";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, IMAGES_UPLOADS);
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
        fileSize: 5000000, // 5MB
    },
    fileFilter: (req, file, cb) => {
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
    },
});

router.get("/", verifyToken, async (req, res) => {
    try {
        const categories = await Categories.findAll({
            include: [
                {
                    as: 'Parent',
                    model: Categories
                },
                {
                    as: 'Child',
                    model: Categories
                }
            ]
        });

        if (!categories) {
            res.status(400).json({ error: "Bad Request!" });
        }
        else {
            res.status(200).send(categories);
        }
    }
    catch (error) {
        res.status(401).json({ error: "error" });
    }
});

router.get("/active", async (req, res) => {
    try {
        const categories = await Categories.findAll({
            where: {
                active: '1',
                deleted: '0'
            },
            include: [
                {
                    as: 'Parent',
                    model: Categories
                },
                {
                    as: 'Child',
                    model: Categories
                }
            ]
        });

        if (!categories) {
            res.status(400).json({ error: "Bad Request!" });
        }
        else {
            res.status(200).send(categories);
        }
    }
    catch (error) {
        res.status(401).json({ error: "error" });
    }
});

router.post("/category-details", async (req, res) => {
    try {
        const { id } = req.body;
        const category = await Categories.findOne({
            where: {
                id: id
            },
            include: [
                {
                    as: 'Parent',
                    model: Categories
                },
                {
                    as: 'Child',
                    model: Categories
                },
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

        if (!category) {
            res.status(400).json({ error: "Bad Request!" });
        }
        else {
            res.status(200).send(category);
        }
    }
    catch (error) {
        res.status(401).json({ error: "error" });
    }
});

router.post("/create", verifyToken, upload.single("image"), async (req, res) => {
    try {
        const resizeImagePath = path.join(__dirname, '../uploads/categoryicons', req.file.filename);
        sharp(req.file.path)
            .resize(60, 60)
            .toFile(resizeImagePath, async (err, info) => {
                if (info) {
                    let { name, description, parentId, userId } = req.body;

                    if (parentId == '') {
                        parentId = null
                    }

                    const category = await Categories.create({ name, description, parentId, image: req.file.filename, createdBy: userId, updatedBy: userId });

                    if (!category) {
                        res.status(400).json({ error: "Bad Request!" });
                    }
                    else {
                        res.status(200).send("Created Category Successfully!");
                    }
                }
                else {
                    res.status(500).send(err.message);
                }
            });
    }
    catch (error) {
        res.status(401).json({ error: "error" });
    }
});

// Here I can using upload.any()

router.put("/update-with-image", verifyToken, upload.single("image"), async (req, res) => {
    try {
        const resizeImagePath = path.join(__dirname, '../uploads/categoryicons', req.file.filename);
        sharp(req.file.path)
            .resize(60, 60)
            .toFile(resizeImagePath, async (err, info) => {
                if (info) {
                    let { name, description, parentId, categoryId, userId } = req.body;

                    if (parentId == '') {
                        parentId = null
                    }

                    const categoryUpdate = await Categories.update(
                        { name, description, parentId, image: req.file.filename, updatedBy: userId },
                        {
                            where: {
                                id: categoryId
                            }
                        });

                    if (!categoryUpdate) {
                        res.status(400).json({ error: "Bad Request!" });
                    }
                    else {
                        res.status(200).send("Updated Category Successfully!");
                    }
                }
                else {
                    res.status(500).send(err.message);
                }
            });
    }
    catch (error) {
        res.status(401).json({ error: "error" });
    }
});

router.put("/update-without-image", verifyToken, async (req, res) => {
    try {
        const { values, categoryId, userId } = req.body;
        let { name, description, parentId } = values;

        if (parentId == '') {
            parentId = null
        }

        const categoryUpdate = await Categories.update(
            { name, description, parentId, updatedBy: userId },
            {
                where: {
                    id: categoryId
                }
            });

        if (!categoryUpdate) {
            res.status(400).json({ error: "Bad Request!" });
        }
        else {
            res.status(200).send("Updated Category Successfully!");
        }
    }
    catch (error) {
        res.status(401).json({ error: "error" });
    }
});

router.put("/activate-deactivate", verifyToken, async (req, res) => {
    try {
        const { categoryId, userId, activateDeactivate } = req.body;

        const categoryActivateDeactivate = await Categories.update(
            { active: activateDeactivate, updatedBy: userId },
            {
                where: {
                    id: categoryId
                }
            });

        if (!categoryActivateDeactivate) {
            res.status(400).json({ error: "Bad Request!" });
        }
        else {
            res.status(200).send("Updated Category Successfully!");
        }
    }
    catch (error) {
        res.status(401).json({ error: "error" });
    }
});

module.exports = router;