const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const { Categories } = require("../models");
const { verifyToken } = require("../MiddleWares/AuthMiddleware");

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

router.post("/category-details", verifyToken, async (req, res) => {
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

router.post("/create", async (req, res) => {
    try {
        let { values, id } = req.body;
        let { name, description, parentId } = values;

        if (parentId == '') {
            parentId = null
        }

        const category = await Categories.create({ name, description, parentId, createdBy: id, updatedBy: id });

        if (!category) {
            res.status(400).json({ error: "Bad Request!" });
        }
        else {
            res.status(200).send("Created Category Successfully!");
        }
    }
    catch (error) {
        res.status(401).json({ error: "error" });
    }
});

router.put("/update", async (req, res) => {
    try {
        let { values, categoryId, userId } = req.body;
        let { name, description, parentId } = values;

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

router.put("/activate-deactivate", async (req, res) => {
    try {
        let { id, activateDeactivate } = req.body;

        const categoryUpdate = await Categories.update(
            { active: activateDeactivate },
            {
                where: {
                    id: id
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

module.exports = router;