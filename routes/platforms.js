const express = require("express");
const router = express.Router();
const axios = require("../config/api-axios");

// Get Platforms
router.get("/platforms", async (req, res) => {
  try {
    let url = `/platforms?key=${process.env.API_KEY}`;

    const response = await axios.get(url);
    res.status(200).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
