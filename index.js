const express = require("express");
const app = express();
const cors = require("cors");
require('dotenv').config();

app.use(express.json());
app.use(cors());

const db = require("./models");

// Routes
const authRouter = require("./routes/Authentication");
app.use("/auth", authRouter);
const usersRouter = require("./routes/Users");
app.use("/users", usersRouter);

db.sequelize.sync().then(() => {
    app.listen(5000, () => {
        console.log("Server running on port 5000");
    });
});