const db = require("../connection");
const model = require("../models/profile.models");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

async function loginUser(req, res) {
  try {
    const {
      body: { email, password },
    } = req;

    if (!(email && password)) {
      res.status(400).json({
        status: false,
        message: "Bad input",
      });
      return;
    }

    const checkEmail = await model.getProfileByEmail(email);
    if (!checkEmail?.length) {
      res.status(400).json({
        status: false,
        message: "Email not registered",
      });
      return;
    }

    // Load hash from your password DB.
    bcrypt.compare(password, checkEmail[0]?.password, function (err, result) {
      if (result) {
        const token = jwt.sign(
          { ...checkEmail[0], password: null },
          process.env.PRIVATE_KEY
        );

        res.json({
          status: true,
          message: "Get data success",
          data: checkEmail,
          token,
        });
      } else {
        res.status(400).json({
          status: false,
          message: "Wrong password",
        });
        return;
      }
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: false,
      message: "Error not found",
    });
  }
}

module.exports = {
  loginUser,
};
