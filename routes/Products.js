const express = require("express");
const multer = require('multer');
const path = require("path");
const router = express.Router();
const { Users, Categories, Products, ProductImages } = require("../models");
const db = require("../models");
const { verifyToken } = require("../middlewares/Auth");

const IMAGES_UPLOADS = "./uploads/productimages";

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

router.post("/create", verifyToken, upload.array("images", 5), async (req, res, next) => {

    try {
        const t = await db.sequelize.transaction();
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
        // unlink image if rollback also for update api
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
                },
                {
                    where: {
                        deleted: '0'
                    },
                    as: 'productDetails',
                    model: ProductImages
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

router.get("/featured", async (req, res) => {
    try {
        const products = await Products.findAll({
            attributes: ['id', 'productName'],
            where: {
                isFeatured: "1",
                active: "1",
                deleted: "0"
            },
            include: [
                {
                    attributes: ['name'],
                    as: 'categoryName',
                    model: Categories
                },
                {
                    attributes: ['image'],
                    where: {
                        deleted: '0'
                    },
                    as: 'productDetails',
                    model: ProductImages
                }
            ]
        });

        if (!products) {
            res.status(400).send("Bad Request!");
        }
        else {
            res.status(200).send(products.slice(0, 8));
        }
    }
    catch (error) {
        res.status(401).send("Unauthorized!");
    }
});

router.get("/category/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const products = await Products.findAll({
            attributes: ['id', 'productName', 'title', 'subTitle', 'description'],
            where: {
                categoryId: id,
                active: "1",
                deleted: "0"
            },
            include: [
                {
                    attributes: ['image'],
                    where: {
                        deleted: '0'
                    },
                    as: 'productDetails',
                    model: ProductImages
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
        res.status(400).send("Bad Request!");
    }
});

router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const product = await Products.findOne({
            attributes: ['id', 'productName', 'categoryId', 'title', 'subTitle', 'description', 'tags'],
            where: {
                id: id,
                active: "1",
                deleted: "0"
            },
            include: [
                {
                    attributes: ['name'],
                    as: 'categoryName',
                    model: Categories
                },
                {
                    attributes: ['image'],
                    where: {
                        deleted: '0'
                    },
                    as: 'productDetails',
                    model: ProductImages
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
        res.status(400).send("Bad Request!");
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

router.put("/select-featured", verifyToken, async (req, res) => {
    try {
        const { productId, userId, isFeatured } = req.body;

        const productSelectFeatured = await Products.update(
            { isFeatured, updatedBy: userId },
            {
                where: {
                    id: productId
                }
            });

        if (productSelectFeatured[0] > 0) {
            res.status(200).send("Updated Product Successfully!");
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
        const { productId, userId, activateDeactivate } = req.body;

        const productActivateDeactivate = await Products.update(
            { active: activateDeactivate, updatedBy: userId },
            {
                where: {
                    id: productId
                }
            });

        if (productActivateDeactivate[0] > 0) {
            res.status(200).send("Updated Product Successfully!");
        }
        else {
            res.status(400).json({ error: "Bad Request!" });
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

        if (imageDeleted[0] > 0) {
            res.status(200).send("Deleted Image Successfully!");
        }
        else {
            res.status(400).send("Bad Request!");
        }
    }
    catch (error) {
        res.status(401).json({ error: "error" });
    }
});

router.put("/update", verifyToken, upload.array("images", 4), async (req, res, next) => {

    try {
        const t = await db.sequelize.transaction();
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

        if (productUpdate[0] > 0) {

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
        else {
            await t.rollback();
            res.status(500).send("Product Not Updated...Try again!!!");
        }
    }
    catch (error) {
        await t.rollback();
        res.status(500).send("Product Not Updated...Try again!!!");
    }
});

module.exports = router;