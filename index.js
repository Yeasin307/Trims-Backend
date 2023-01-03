const express = require("express");
const cors = require("cors");
require('dotenv').config();
const multer = require('multer');
const db = require("./models");
const authRouter = require("./routes/Authentication");
const usersRouter = require("./routes/Users");
const categoriesRouter = require("./routes/Categories");
const productsRouter = require("./routes/Products");
const componentsRouter = require("./routes/Components");
const leadsRouter = require("./routes/Leads");

db.sequelize.sync()
    .then(() => {
        const app = express();

        app.use(cors());
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use('/static', express.static('uploads'));
        app.set('view engine', 'ejs');

        app.use("/auth", authRouter);
        app.use("/users", usersRouter);
        app.use("/categories", categoriesRouter);
        app.use("/products", productsRouter);
        app.use("/components", componentsRouter);
        app.use("/leads", leadsRouter);

        app.use((err, req, res, next) => {
            if (err) {
                if (err instanceof multer.MulterError) {
                    res.status(500).send("There was an upload error!");
                } else {
                    res.status(500).send(err.message);
                }
            } else {
                res.send("success");
            }
        });

        app.get('/', (req, res) => {
            res.send('Welcome to Trim Tex');
        })

        app.listen(5000, () => {
            console.log("Server running on port 5000");
        });
    })
    .catch((error) => {
        console.log(`error: ${error.message}`);
    });
