const express = require("express");
const cors = require("cors");
require('dotenv').config();
const multer = require('multer');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static('uploads'));

const db = require("./models");

// Routes
const authRouter = require("./routes/Authentication");
app.use("/auth", authRouter);
const usersRouter = require("./routes/Users");
app.use("/users", usersRouter);
const categoriesRouter = require("./routes/Categories");
app.use("/categories", categoriesRouter);
const productsRouter = require("./routes/Products");
app.use("/products", productsRouter);
const componentsRouter = require("./routes/Components");
app.use("/components", componentsRouter);
const leadsRouter = require("./routes/Leads");
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

db.sequelize.sync().then(() => {
    app.listen(5000, () => {
        console.log("Server running on port 5000");
    });
});
