const express = require("express");
const router = express.Router();
const axios = require("../config/api-axios");

// Get games
router.get("/games", async (req, res) => {
  try {
    // #swagger.tags = ['Game']
    // #swagger.summary = 'Get a list of games.'
    // #swagger.description = 'You can search for a game in the list by name, genre or platform. A paging system: a page number within the paginated result set'

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
      //  #swagger.parameters['ordering'] = { description: 'Search with: name, released, added, created, updated, rating, metacritic.', type: 'string' , required: false }
      url = `${url}&ordering=${req.query.ordering}`;
    }

    const response = await axios.get(url);

    res.status(200).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

// Get game/:id
router.get("/game/:id", async (req, res) => {
  try {
    // #swagger.tags = ['Game']
    // #swagger.summary = 'Get details of the game.'
    // #swagger.description = 'Displaying information relating to a game and games from the same series.'

    // #swagger.parameters['id'] = { description: 'An ID or a slug identifying this Game.', type: 'string' , required: true }
    let url = `/games/${req.params.id}?key=${process.env.API_KEY}`;

    const gameResponse = await axios.get(url); // data game

    let relatedGameUrl = `/games/${req.params.id}/game-series?key=${process.env.API_KEY}`;

    const relatedGameResponse = await axios.get(relatedGameUrl); //list of games that are part of the same series.

    res.status(200).json({
      game: {
        id: gameResponse.data.id,
        name: gameResponse.data.name,
        genres: gameResponse.data.genres,
        platforms: gameResponse.data.platforms,
        background_image: gameResponse.data.background_image,
        description_raw: gameResponse.data.description_raw,
        rating: gameResponse.data.rating,
        developers: gameResponse.data.developers,
        publishers: gameResponse.data.publishers,
        released: gameResponse.data.released,
      },
      relatedGames: relatedGameResponse.data.results,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
