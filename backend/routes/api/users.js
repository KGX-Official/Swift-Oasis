const express = require("express");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

const { setTokenCookie } = require("../../utils/auth");
const { User } = require("../../db/models");

const router = express.Router();

const { validateSignUp } = require("../../utils/validation");

//Sign Up User
router.post("/", validateSignUp, async (req, res, _next) => {
  const { firstName, lastName, username, email, password } = req.body;

  const hashedPassword = bcrypt.hashSync(password, saltRounds);

  const existingUser = await User.unscoped().findOne({
    where: {
      [Op.or]: {
        username: username,
        email: email,
      },
    },
  });

  if (existingUser) {
    if (existingUser.email === email) {
      return res.status(500).json({
        message: "User already exists",
        errors: {
          email: "User with that email already exists",
        },
      });
    }
    if (existingUser.username === username) {
      return res.status(500).json({
        message: "User already exists",
        errors: {
          email: "User with that email already exists",
        },
      });
    }
  }

  const newUser = await User.create({
    firstName,
    lastName,
    username,
    email,
    hashedPassword,
  });

  const safeUser = {
    id: newUser.id,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    email: newUser.email,
    username: newUser.username,
  };

  setTokenCookie(res, safeUser);

  return res.status(201).json({
    user: safeUser,
  });
});

module.exports = router;
