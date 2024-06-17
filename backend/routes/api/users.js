const express = require("express");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

const { setTokenCookie } = require("../../utils/auth");
const { User } = require("../../db/models");

const router = express.Router();

const { validateSignUp } = require("../../utils/validation");

router.post("/", validateSignUp, async (req, res, _next) => {
  const { firstName, lastName, username, email, password } = req.body;

  const hashedPassword = bcrypt.hashSync(password, saltRounds);

  const user = await User.create({
    firstName,
    lastName,
    username,
    email,
    hashedPassword,
  });

  const safeUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
  };

  await setTokenCookie(res, safeUser);

  return res.status(201).json({
    user: safeUser,
  });
});

module.exports = router;
