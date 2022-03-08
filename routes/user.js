const express = require("express");
const router = express.Router();
const axios = require("../config/api-axios");

const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const cloudinary = require("cloudinary").v2;

// import User model
const User = require("../models/User");

// import middleware
const isAuthenticated = require("../middleware/isAuthenticated");

// user => SignUp
router.post("/signup", async (req, res) => {
  try {
    const { email, username, password } = req.fields;

    const user = await User.findOne({ email: email });

    if (user !== null) {
      // email exists <=> account already exists
      res.status(409).json({
        message: "This email already has an account",
      });
    } else {
      // email does not exists <=> create an account
      if (email && username && password) {
        // #swagger.parameters['Email'] = { description: 'Insert User email', type: 'string' , required: true }
        // #swagger.parameters['Username'] = { description: 'User name', type: 'string' , required: true }
        // #swagger.parameters['Password'] = { description: 'Password', type: 'string' , required: true }
        // #swagger.parameters['Avatar'] = { description: 'User Avatar', type: 'string' , required: false }
        const salt = uid2(16); // generate a Salt

        const hash = SHA256(password + salt).toString(encBase64); // generate an HASH

        const token = uid2(16); // generate a token

        const newUser = new User({
          email,
          username,
          token,
          hash,
          salt,
        });

        // User Avatar
        if (req.files.avatar !== undefined) {
          cloudAvatar = await cloudinary.uploader.upload(
            req.files.avatar.path,
            {
              folder: `gamepad/avatarUsers/${newUser._id}`,
              public_id: "avatar",
            }
          );

          newUser.avatar = cloudAvatar.secure_url;
        }

        await newUser.save(); // save newUser on DataBase

        res.status(200).json({
          _id: newUser._id,
          email: newUser.email,
          username: newUser.username,
          token: newUser.token,
        });
      } else {
        res.status(400).json({
          message: "Missing parameters",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: error.message,
    });
  }
});

// user => LogIn
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.fields.email,
    });

    // #swagger.parameters['Email'] = { description: 'Insert User email', type: 'string' , required: true }
    // #swagger.parameters['Password'] = { description: 'Password', type: 'string' , required: true }

    if (user === null) {
      // email exist <=> no user
      res.status(400).json({
        message: "No account registered with this email !",
      });
    } else {
      // email exist <=> user exists in BDD
      const newHash = SHA256(req.fields.password + user.salt).toString(
        encBase64 // generate an HASH
      );

      // check password
      if (user.hash === newHash) {
        // Authorized access <=> we can connect
        res.status(200).json({
          id: user.id,
          token: user.token,
          username: user.username,
          avatar: user.avatar,
        });
      } else {
        // Unauthorized <=> the password entered is incorrect
        res.status(401).json({
          message: "Unauthorized ✋",
        });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.json({ message: error.message });
  }
});

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

// User's collection
router.get("/user/:idUser/favorites", isAuthenticated, async (req, res) => {
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
