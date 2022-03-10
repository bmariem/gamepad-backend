const mongoose = require("mongoose");

const Vote = mongoose.model("Vote", {
  value: Number,
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review",
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = Vote;
