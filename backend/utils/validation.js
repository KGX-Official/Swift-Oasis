// backend/utils/validation.js
const { validationResult, check } = require("express-validator");

// middleware for formatting errors from express-validator middleware
// (to customize, see express-validator's documentation)
const handleValidationErrors = (req, _res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    const errors = {};
    validationErrors
      .array()
      .forEach((error) => (errors[error.path] = error.msg));

    const err = Error("Bad request.");
    err.errors = errors;
    err.status = 400;
    err.title = "Bad request.";
    next(err);
  }
  next();
};

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

module.exports = {
  handleValidationErrors, spotValidation, reviewValidation, bookingValidation
};
