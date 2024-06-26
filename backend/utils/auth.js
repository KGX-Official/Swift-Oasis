// backend/utils/auth.js
const jwt = require("jsonwebtoken");
const { jwtConfig } = require("../config");
const { User } = require("../db/models");

const { secret, expiresIn } = jwtConfig;

const setTokenCookie = (res, user) => {
  const safeUser = {
    id: user.id,
    email: user.email,
    username: user.username,
  };

  const token = jwt.sign({ data: safeUser }, secret, {
    expiresIn: parseInt(expiresIn),
  });

  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions = {
    maxAge: expiresIn * 1000, // maxAge in milliseconds
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "Lax" : "Strict",
  };

  res.cookie("token", token, cookieOptions);

  return token;
};

const restoreUser = (req, res, next) => {
  // token parsed from cookies
  const { token } = req.cookies;
  req.user = null;

  return jwt.verify(token, secret, null, async (err, jwtPayload) => {
    if (err) {
      return next();
    }

    try {
      const { id } = jwtPayload.data;
      req.user = await User.findByPk(id, {
        attributes: {
          include: ["email", "createdAt", "updatedAt"],
        },
      });
    } catch (e) {
      res.clearCookie("token");
      return next();
    }

    if (!req.user) res.clearCookie("token");

    return next();
  });
};

const requireAuthentication = function (req, res, next) {
  if (req.user) {
    return next();
  } else {
    return res.status(401).json({
      message: "Authentication required",
    });
  }
};

module.exports = { setTokenCookie, restoreUser, requireAuthentication };
