const express = require("express");
const { Op, where } = require("sequelize");
const bcrypt = require("bcryptjs");

const { setTokenCookie, restoreUser } = require("../../utils/auth");

const { User } = require("../../db/models");
const router = express.Router();

router.post("/", async (req, res, next) => {
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
    const err = new Error("Login Failed");
    err.status = 401;
    err.title = "Login Failed";
    err.errors = { credential: "Invalid credentials provided" };
    return next(err);
  }

  const safeUser = {
    id: user.id,
    email: user.email,
    username: user.username,
  };

  await setTokenCookie(res, safeUser);

  return res.json({
    user: safeUser,
  });
});

router.delete("/", (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "Success" });
});

module.exports = router;