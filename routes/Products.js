const express = require("express");
const multer = require('multer');
const path = require("path");
const router = express.Router();
const { Users, Categories, Products, ProductImages } = require("../models");
const db = require("../models");
const { verifyToken } = require("../middlewares/AuthMiddleware");

const IMAGES_UPLOADS = "./images";

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
            cb(new Error("Only .png, .gif, .jpg or .jpeg format allowed!"));
        }
    },
});

router.post("/create", verifyToken, upload.array("images", 5), async (req, res, next) => {
    const t = await db.sequelize.transaction();

    try {
        const { name, categoryId, title, subtitle, description, tags, id } = req.body;

        const product = await Products.create({
            productName: name,
            categoryId,
            title,
            subTitle: subtitle,
            description,
            tags,
            createdBy: id,
            updatedBy: id
        }, { transaction: t });

        for (const file of req.files) {
            await ProductImages.create({
                productId: product?.dataValues?.id,
                image: file.filename,
                extension: path.extname(file.originalname),
                createdBy: id,
                updatedBy: id
            }, { transaction: t });
        };

        // const productImages = await ProductImages.bulkCreate(productImagesDetails);
        // await t.commit();

        t.commit()
            .then(() => {
                res.status(200).send("Created Product Successfully!");
            })
    }
    catch (error) {
        await t.rollback();
        res.status(500).send("Product Not Created...Try again!!!");
    }
});

router.get("/", verifyToken, async (req, res) => {
    try {
        const products = await Products.findAll({
            include: [
                {
                    as: 'categoryName',
                    model: Categories
                }
            ]
        });

        if (!products) {
            res.status(400).send("Bad Request!");
        }
        else {
            res.status(200).send(products);
        }
    }
    catch (error) {
        res.status(401).send("Unauthorized!");
    }
});

router.get("/viewproduct/:id", verifyToken, async (req, res) => {

    try {
        const id = req.params.id;

        const product = await Products.findOne({
            where: {
                id: id
            },
            include: [
                {
                    as: 'categoryName',
                    model: Categories
                },
                {
                    where: {
                        deleted: '0'
                    },
                    as: 'productDetails',
                    model: ProductImages
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

        if (!product) {
            res.status(400).send("Bad Request!");
        }
        else {
            res.status(200).send(product);
        }
    }
    catch (error) {
        res.status(401).send("Unauthorized!");
    }
});

router.put("/activate-deactivate", verifyToken, async (req, res) => {
    try {
        const { productId, userId, activateDeactivate } = req.body;

        const productActivateDeactivate = await Products.update(
            { active: activateDeactivate, updatedBy: userId },
            {
                where: {
                    id: productId
                }
            });

        if (!productActivateDeactivate) {
            res.status(400).json({ error: "Bad Request!" });
        }
        else {
            res.status(200).send("Updated Product Successfully!");
        }
    }
    catch (error) {
        res.status(401).json({ error: "error" });
    }
});

router.put("/image-deleted", verifyToken, async (req, res) => {
    try {
        const { imageId, userId } = req.body;

        const imageDeleted = await ProductImages.update(
            { deleted: '1', updatedBy: userId },
            {
                where: {
                    id: imageId
                }
            });

        if (!imageDeleted) {
            res.status(400).send("Bad Request!");
        }
        else {
            res.status(200).send("Deleted Image Successfully!");
        }
    }
    catch (error) {
        res.status(401).json({ error: "error" });
    }
});

router.put("/update", verifyToken, upload.array("images", 4), async (req, res, next) => {
    const t = await db.sequelize.transaction();

    try {
        const { id, name, categoryId, title, subtitle, description, tags, userId, } = req.body;

        const productUpdate = await Products.update(
            {
                productName: name,
                categoryId,
                title,
                subTitle: subtitle,
                description,
                tags,
                updatedBy: userId
            },
            {
                where: {
                    id: id
                }
            },
            { transaction: t });

        for (const file of req.files) {
            await ProductImages.create({
                productId: id,
                image: file.filename,
                extension: path.extname(file.originalname),
                createdBy: userId,
                updatedBy: userId
            }, { transaction: t });
        };

        t.commit()
            .then(() => {
                res.status(200).send("Updated Product Successfully!");
            })
    }
    catch (error) {
        await t.rollback();
        res.status(500).send("Product Not Updated...Try again!!!");
    }
});

module.exports = router;