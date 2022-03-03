const express = require("express");
const router = express.Router();

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

        console.log(newUser);

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

module.exports = router;
