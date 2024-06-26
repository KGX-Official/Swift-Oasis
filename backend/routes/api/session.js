const express = require("express");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

const { setTokenCookie } = require("../../utils/auth");

const { User } = require("../../db/models");
const router = express.Router();
const { validateLogin } = require("../../utils/validation");

//Sign-In
router.post("/", validateLogin, async (req, res, next) => {
  const { credential, password } = req.body;

  const user = await User.unscoped().findOne({
    where: {
      [Op.or]: {
        username: credential,
        email: credential,
      },
    },
  });

  if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const safeUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
  };

  setTokenCookie(res, safeUser);

  return res.json({
    user: safeUser,
  });
});

//Get Session User
router.get("/", (req, res, _next) => {
  const { user } = req;

  if (user) {
    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
    };

    return res.json({ user: safeUser });
  } else {
    return res.json({ user: null });
  }
});

//Sign-Out
router.delete("/", (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "Success" });
});

module.exports = router;
