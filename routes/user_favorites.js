const express = require("express");
const router = express.Router();
const axios = require("../config/api-axios");

// import User model
const User = require("../models/User");

// import middleware
const isAuthenticated = require("../middleware/isAuthenticated");

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

// User's favorites
router.get("/user/:idUser/favorites", isAuthenticated, async (req, res) => {
  // #swagger.tags = ['Favorites']
  // #swagger.summary = "Get a list of user's favorites games."

  const favorites = [];

  await asyncForEach(req.user.favorites, async (gameId) => {
    const response = await axios.get(
      `/games/${gameId}?key=${process.env.API_KEY}`
    );

    favorites.push({
      id: response.data.id,
      name: response.data.name,
      background_image: response.data.background_image,
    });
  });

  try {
    res.status(200).json({
      id: req.user._id,
      email: req.user.email,
      username: req.user.username,
      avatar: req.user.avatar,
      favorites: favorites,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

const addFavoriteGames = (user, game) => {
  if (user.favorites === undefined) {
    user.favorites = [];
  }

  // check if game already exists in favorites
  const index = user.favorites.indexOf(Number(game.id));

  // game does not exists in favorites <=> add it
  if (index < 0) {
    return user.favorites.push(game.id);
  }
};

// Add User's fav to collection
router.post("/user/:idUser/favorites", isAuthenticated, async (req, res) => {
  try {
    // #swagger.tags = ['Favorites']
    // #swagger.summary = 'Add a favorite game for the specified user.'

    // #swagger.parameters['UserId'] = { description: 'Insert user ID.', type: 'string' , required: true }
    const user = await User.findById(req.user._id); // Checking if user ID is already in my bd

    // #swagger.parameters['GameId'] = { description: 'Insert game ID.', type: 'string' , required: true }
    const response = await axios.get(
      `/games/${req.fields.id}?key=${process.env.API_KEY}`
    );

    addFavoriteGames(user, response.data);
    await user.save();

    res.status(200).json(req.user);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: error.message,
    });
  }
});

const deleteFavoriteGames = (user, gameId) => {
  if (user.favorites === undefined) {
    user.favorites = [];
  }

  const index = user.favorites.indexOf(Number(gameId));

  if (index > -1) {
    user.favorites.splice(index, 1); // 2nd parameter means remove one item only
  }
};

// Delete User's fav from collection
router.delete(
  "/user/:idUser/favorite/:id",
  isAuthenticated,
  async (req, res) => {
    try {
      // #swagger.tags = ['Favorites']
      // #swagger.summary = 'Delete a favorite game for the specified user.'

      // #swagger.parameters['UserId'] = { description: 'Insert user ID.', type: 'string' , required: true }
      const user = await User.findById(req.user._id); // Checking if user ID is already in my bd

      // #swagger.parameters['gameId'] = { description: 'Insert the ID of the game.', type: 'string' , required: true }
      const gameId = req.params.id;

      deleteFavoriteGames(user, gameId);

      user.markModified("favorites");

      await user.save();
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  }
);

module.exports = router;
