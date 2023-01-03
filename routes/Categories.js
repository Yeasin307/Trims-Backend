const express = require("express");
const multer = require('multer');
const sharp = require('sharp');
const path = require("path");
const router = express.Router();
const { Users, Categories, Products } = require("../models");
const { verifyToken } = require("../middlewares/Auth");
const { where } = require("sequelize");

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
            order: [
                ['position', 'ASC'],
                [{ as: 'Child', model: Categories }, 'position', 'ASC']
            ],
            include: [
                {
                    as: 'Parent',
                    model: Categories
                },
                {
                    as: 'Child',
                    model: Categories,
                    where: {
                        active: '1',
                        deleted: '0'
                    },
                    required: false
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
            attributes: ['id', 'name'],
            where: {
                active: '1',
                deleted: '0'
            },
            order: [
                ['position', 'ASC'],
                // [{ as: 'Child', model: Categories }, 'position', 'ASC']
            ],
            include: [
                {
                    as: 'Products',
                    model: Products,
                    attributes: ['id', 'productName'],
                    where: {
                        active: '1',
                        deleted: '0'
                    },
                    required: false
                },
                // {
                //     as: 'Parent',
                //     model: Categories
                // },
                // {
                //     as: 'Child',
                //     model: Categories,
                //     where: {
                //         active: '1',
                //         deleted: '0'
                //     },
                //     required: false
                // }
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

router.post("/category-details", verifyToken, async (req, res) => {
    try {
        const { id } = req.body;
        const category = await Categories.findOne({
            where: {
                id: id
            },
            order: [
                [{ as: 'Child', model: Categories }, 'position', 'ASC']
            ],
            include: [
                {
                    as: 'Parent',
                    model: Categories
                },
                {
                    as: 'Child',
                    model: Categories,
                    where: {
                        active: '1',
                        deleted: '0'
                    },
                    required: false
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

                if (err) {
                    res.status(500).send("Internal Server Error!");
                }

                if (info) {

                    try {
                        let { name, description, parentId, position, userId } = req.body;

                        if (parentId == '') {
                            parentId = null
                        }

                        if (position == '') {
                            position = 99999
                        }

                        const category = await Categories.create({ name, description, parentId, image: req.file.filename, position, createdBy: userId, updatedBy: userId });

                        if (!category) {
                            res.status(400).json({ error: "Bad Request!" });
                        }
                        else {
                            res.status(200).send("Created Category Successfully!");
                        }
                    }
                    catch (error) {
                        if (error.message === "Validation error") {
                            res.status(300).send("This category already exist!");
                        }
                    }
                }
            });
    }
    catch (error) {
        res.status(401).json({ error: "error" });
    }
});

// Here I can use upload.any()

router.put("/update-with-image", verifyToken, upload.single("image"), async (req, res) => {

    try {
        const resizeImagePath = path.join(__dirname, '../uploads/categoryicons', req.file.filename);

        sharp(req.file.path)
            .resize(60, 60)
            .toFile(resizeImagePath, async (err, info) => {

                if (err) {
                    res.status(500).send("Internal Server Error!");
                }

                if (info) {

                    try {
                        let { name, description, parentId, position, categoryId, userId } = req.body;

                        if (parentId == '') {
                            parentId = null
                        }

                        if (position == '') {
                            position = 99999
                        }

                        const categoryUpdate = await Categories.update(
                            { name, description, parentId, image: req.file.filename, position, updatedBy: userId },
                            {
                                where: {
                                    id: categoryId
                                }
                            });

                        if (categoryUpdate[0] > 0) {
                            res.status(200).send("Updated Category Successfully!");
                        }
                        else {
                            res.status(400).json({ error: "Bad Request!" });
                        }
                    }
                    catch (error) {
                        if (error.message === "Validation error") {
                            res.status(300).send("This category already exist!");
                        }
                    }
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
        let { name, description, parentId, position } = values;

        if (parentId == '') {
            parentId = null
        }

        if (position == '') {
            position = 99999
        }

        const categoryUpdate = await Categories.update(
            { name, description, parentId, position, updatedBy: userId },
            {
                where: {
                    id: categoryId
                }
            });

        if (categoryUpdate[0] > 0) {
            res.status(200).send("Updated Category Successfully!");
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
        const { categoryId, userId, activateDeactivate } = req.body;

        const categoryActivateDeactivate = await Categories.update(
            { active: activateDeactivate, updatedBy: userId },
            {
                where: {
                    id: categoryId
                }
            });

        if (categoryActivateDeactivate[0] > 0) {
            res.status(200).send("Updated Category Successfully!");
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