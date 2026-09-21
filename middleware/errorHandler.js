// const errorHandler = (err, req, res, next) => {
//   console.error(err.stack);

//   const statusCode = err.statusCode || 500;
//   res.status(statusCode).json({
//     success: false,
//     message: err.message || "Internal Server Error",
//   });
// };

// const notFound = (req, res, next) => {
//   res.status(404).json({
//     success: false,
//     message: `Route not found - ${req.originalUrl}`,
//   });
// };

// module.exports = { errorHandler, notFound };


const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // MongoDB duplicate key error (E11000) - was previously falling through
  // to a raw 500 with Mongo's internal message exposed to the client.
  // This is what caused the confusing error when re-signing up with a
  // phone number that another (often incomplete/abandoned) account still held.
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || "value";
    const value = err.keyValue ? err.keyValue[field] : undefined;
    return res.status(409).json({
      success: false,
      message: value
        ? `This ${field} (${value}) is already in use.`
        : `This ${field} is already in use.`,
    });
  }

  // Mongoose validation error - also previously raw
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    return res.status(422).json({ success: false, message });
  }

  // Malformed ObjectId in a param (e.g. GET /api/x/not-a-valid-id)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}.`,
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found - ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFound };