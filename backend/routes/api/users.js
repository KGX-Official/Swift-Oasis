const express = require("express");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

const { setTokenCookie, requireAuth } = require("../../utils/auth");
const { User } = require("../../db/models");

const router = express.Router();

router.post("/", async (req, res, _next) => {
  const { username, email, password } = req.body;

  const hashedPassword = bcrypt.hashSync(password, saltRounds);

  const user = await User.create({ username, email, hashedPassword });

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

module.exports = router;
