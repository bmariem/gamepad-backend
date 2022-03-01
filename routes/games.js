const express = require("express");
const router = express.Router();
const axios = require("../config/api-axios");

// Get games
router.get("/games", async (req, res) => {
  try {
    let url = `/games?key=${process.env.API_KEY}`;

    if (req.query.search) {
      // #swagger.parameters['search'] = { description: 'Search a game by name', type: 'string' , required: false }
      url = `${url}&search=${req.query.search}`;
    }

    if (req.query.page) {
      //  #swagger.parameters['page'] = { description: 'A page number within the paginated result set.', type: 'int' , required: false }
      //  #swagger.parameters['page_size'] = { description: 'Number of results to return per page.', type: 'int' , required: false }
      url = `${url}&page=${req.query.page}&page_size=${req.query.page_size}`;
    }

    if (req.query.platforms) {
      //  #swagger.parameters['platforms'] = { description: 'Filter by platforms, for example: 4,5', type: 'string' , required: false }
      url = `${url}&platforms=${req.query.platforms}`;
    }

    if (req.query.genres) {
      //  #swagger.parameters['genres'] = { description: 'Filter by genres, for example: 4,51 or action,indie.', type: 'string' , required: false }
      url = `${url}&genres=${req.query.genres}`;
    }

    if (req.query.ordering) {
      //  #swagger.parameters['ordering'] = { description: 'Available fields: name, released, added, created, updated, rating, metacritic.', type: 'string' , required: false }
      url = `${url}&ordering=${req.query.ordering}`;
    }

    const response = await axios.get(url);

    res.status(200).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

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

// Get types
router.get("/genres", async (req, res) => {
  try {
    let url = `/genres?key=${process.env.API_KEY}`;

    const response = await axios.get(url);
    res.status(200).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
