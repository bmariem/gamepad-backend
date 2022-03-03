const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: {
    unique: true,
    type: String,
  },
  username: {
    required: true,
    type: String,
  },
  favorites: {
    favoriteGames: [],
  },
  avatar: String,
  token: String,
  hash: String,
  salt: String,
});

module.exports = User;
