// Enable ENV vars <=> have access to process.env
require("dotenv").config();

const express = require("express");
const formidable = require("express-formidable");

const mongoose = require("mongoose");
const cors = require("cors");

// Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");

// create a server
const app = express();
app.use(formidable());

// Allow requests between my AMI and other external sites
app.use(cors());

// Setup Cloudinary
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_CLOUDINARY_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

// create a DB
mongoose.connect(process.env.MONGODB_URI);

// import routes
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

const gamesRoutes = require("./routes/games");
app.use(gamesRoutes);

const platformsRoutes = require("./routes/platforms");
app.use(platformsRoutes);

const typesRoutes = require("./routes/types");
app.use(typesRoutes);

const userRoutes = require("./routes/user");
app.use(userRoutes);

app.all("*", (req, res) => {
  res.status(404).json("Page not found 😔");
});

app.listen(process.env.PORT, () => {
  console.log("Server has started 🚀");
});
