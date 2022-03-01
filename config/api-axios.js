const axios = require("axios");

const instance = axios.create({
  baseURL: "https://api.rawg.io/api", // RAWG API
});

module.exports = instance;
