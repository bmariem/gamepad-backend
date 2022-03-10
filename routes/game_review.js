const express = require("express");
const router = express.Router();

// import du model Game
const Review = require("../models/Review");
const Vote = require("../models/Vote");

// import du middleware isAuthenticated
const isAuthenticated = require("../middleware/isAuthenticated");

// publish a review
router.post("/game/:id/review", isAuthenticated, async (req, res) => {
  try {
    // #swagger.tags = ['Review']
    // #swagger.summary = 'Publish a new game review'

    const gameId = req.params.id;
    // #swagger.parameters['gameId'] = { description: 'Insert the ID of the game.', type: 'string' , required: true }

    const title = req.fields.title;
    // #swagger.parameters['Title'] = { description: 'Insert here the title of the review.', type: 'string' , required: true }

    const text = req.fields.text;
    // #swagger.parameters['Text'] = { description: 'Insert here the text of the review.', type: 'string' , required: true }

    if (!title || !text) {
      res.status(400).json({
        message: "Please insert a title and text for a review !",
      });
    } else {
      // Create a new review
      const newReview = await new Review({
        title: title,
        text: text,
        date: Date.now(),
        game_id: gameId,
        author: req.user,
      });

      await newReview.save();

      res.status(200).json({
        message: "A new review has been added for a game",
        newReview,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json(error.message);
  }
});

// List reviews of selected Game
router.get("/game/:id/reviews", isAuthenticated, async (req, res) => {
  try {
    // #swagger.tags = ['Review']
    // #swagger.summary = 'Get game reviews'

    const gameId = req.params.id;
    // #swagger.parameters['gameId'] = { description: 'Insert the ID of the game.', type: 'string' , required: true }

    const reviews = await Review.find({ game_id: gameId }).populate([
      "author",
      "votes",
    ]);

    res
      .status(200)
      .json({ message: "List of reviews for selected game", reviews });
  } catch (error) {
    console.log(error.message);
    res.status(400).json(error.message);
  }
});

// publish a new vote
router.post(
  "/game/:id/review/:review_id/vote",
  isAuthenticated,
  async (req, res) => {
    try {
      // #swagger.tags = ['Review']
      // #swagger.summary = 'Publish a new vote for a game review'

      const gameId = req.params.id;
      // #swagger.parameters['gameId'] = { description: 'Insert the ID of the game.', type: 'Number' , required: true }

      const review_id = req.params.review_id;
      // #swagger.parameters['review_id'] = { description: 'Insert here the id of the review.', type: 'Number' , required: true }

      const value = req.fields.value;
      // #swagger.parameters['value'] = { description: 'Insert here the vote for the review.', type: 'Number' , required: true }

      if (!gameId || !review_id || !value) {
        res.status(400).json({
          message: "Please insert a gameId, value and review_id for a review !",
        });
      } else {
        const review = await Review.findById(review_id); // find in DB the review
        const votes = await Vote.find({
          author: req.user.id,
          review: review._id,
        }); // find in DB the vote of this review

        let vote = votes.length > 0 ? votes[0] : null;

        if (!vote) {
          // Create a new vote
          console.log("A new vote will be created.");
          vote = await new Vote({
            value: value,
            review: review,
            author: req.user,
          });
          review.votes.push(vote);
        }
        vote.value = value;
        await vote.save();
        await review.save();
        await review.populate(["votes", "author"]);

        console.log("A new vote has been added/updated for this review");
        res.status(200).json(review);
      }
    } catch (error) {
      console.log(error.message);
      console.log("Error ,", error);
      res.status(400).json(error.message);
    }
  }
);

module.exports = router;
