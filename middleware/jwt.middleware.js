const jwt = require("jsonwebtoken");

const checkToken = (req, res, next) => {
  if (!req?.headers?.authorization) {
    res.status(401).json({
      status: false,
      message: "Empty Token",
    });
  }
  const token = req?.headers?.authorization?.slice(
    7,
    req?.headers?.authorization?.length
  );

  jwt.verify(token, process.env.PRIVATE_KEY, function (err, decoded) {
    if (err) {
      res.status(401).json({
        status: false,
        message: "invalid token",
      });
    } else {
      req.user = decoded;
      next();
    }
  });
};

module.exports = checkToken;
