// backend/utils/validation.js
const { validationResult, check, query } = require("express-validator");
const { Op } = require("sequelize");
const { Booking } = require("../db/models");
// middleware for formatting errors from express-validator middleware
// (to customize, see express-validator's documentation)

const handleValidationErrors = (req, res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    const errors = {};
    validationErrors
      .array()
      .forEach((error) => (errors[error.path] = error.msg));

    return res.status(400).json({
      message: "Bad request.",
      errors,
    });
  }
  next();
};

const validateSignUp = [
  check("email")
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage("Please provide a valid email."),
  check("username")
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage("Please provide a username with at least 4 characters."),
  check("username").not().isEmail().withMessage("Username cannot be an email."),
  check("password")
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage("Password must be 6 characters or more."),
  handleValidationErrors,
];

const validateLogin = [
  check("credential")
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("Email or username is required"),
  check("password")
    .exists({ checkFalsy: true })
    .withMessage("Password is required"),
  handleValidationErrors,
];

const spotValidation = [
  check("address").notEmpty().withMessage("Street address is required"),
  check("city").notEmpty().withMessage("City is required"),
  check("state").notEmpty().withMessage("State is required"),
  check("country").notEmpty().withMessage("Country is required"),
  check("lat")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be within -90 and 90"),
  check("lng")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be within -180 and 180"),
  check("name")
    .notEmpty()
    .isLength({ max: 50 })
    .withMessage("Name must be less than 50 characters"),
  check("description").notEmpty().withMessage("Description is required"),
  check("price")
    .isFloat({ min: 0 })
    .withMessage("Price per day must be a positive number"),
  handleValidationErrors,
];

const reviewValidation = [
  check("review").notEmpty().withMessage("Review text is required"),
  check("stars")
    .notEmpty()
    .isInt({ min: 1, max: 5 })
    .withMessage("Stars must be an integer from 1 to 5"),
  handleValidationErrors,
];

const bookingValidation = [
  check("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .custom((value) => {
      const currentDate = new Date();
      const startDate = new Date(value);
      if (startDate <= currentDate) {
        throw new Error("startDate cannot be in the past");
      }
      return true;
    }),
  check("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .custom((value, { req }) => {
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(value);
      if (endDate <= startDate) {
        throw new Error("endDate cannot be on or before startDate");
      }
      return true;
    }),
];

const checkBookingConflict = async (req, res, next) => {
  const { spotId } = req.params;
  const { startDate, endDate } = req.body;

  const existingBooking = await Booking.findAll({
    where: {
      spotId,
      [Op.or]: [
        //Check for overlapping dates
        { startDate: { [Op.between]: [startDate, endDate] } },
        { endDate: { [Op.between]: [startDate, endDate] } },
        {
          [Op.and]: [
            { startDate: { [Op.lte]: startDate } },
            { endDate: { [Op.gte]: endDate } },
          ],
        },
      ],
    },
  });

  if (existingBooking.length > 0) {
    return res.status(403).json({
      message: "Sorry, this spot is already booked for the specified dates",
      errors: {
        startDate: "Start date conflicts with an existing booking",
        endDate: "End date conflicts with an existing booking",
      },
    });
  }

  next();
};

const queryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be greater than or equal to 1"),
  query("size")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("Size must be between 1 and 20"),
  query("minLat")
    .optional()
    .isFloat()
    .withMessage("Minimum latitude is invalid"),
  query("maxLat")
    .optional()
    .isFloat()
    .withMessage("Maximum latitude is invalid"),
  query("minLng")
    .optional()
    .isFloat()
    .withMessage("Minimum longitude is invalid"),
  query("maxLng")
    .optional()
    .isFloat()
    .withMessage("Maximum longitude is invalid"),
  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum price must be greater than or equal to 0"),
  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum price must be greater than or equal to 0"),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateSignUp,
  validateLogin,
  spotValidation,
  reviewValidation,
  bookingValidation,
  checkBookingConflict,
  queryValidation,
};
