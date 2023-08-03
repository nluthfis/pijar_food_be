const db = require("../connection");
const model = require("../models/profile.models");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;

function getToken(req) {
  const token = req?.headers?.authorization?.slice(
    7,
    req?.headers?.authorization?.length
  );
  return token;
}

async function getProfile(req, res) {
  try {
    const token = getToken(req);
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
    const id = decoded.id;

    const data = await model.getProfileById(id);

    res.send({
      status: true,
      message: "Success get data",
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
}

async function getProfileById(req, res) {
  try {
    const {
      params: { id },
    } = req;

    if (isNaN(id)) {
      res.status(400).json({
        status: false,
        message: "ID must be integer",
      });
      return;
    }

    const query = await model.getProfileById(id);

    if (!query.length) {
      res.status(404).json({
        status: false,
        message: "Data not found",
      });
      return;
    }

    res.json({
      status: true,
      message: "Get data success",
      data: query,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: "Error not found",
    });
  }
}

async function getProfileByEmail(req, res) {
  try {
    const {
      params: { id },
    } = req;

    if (isNaN(id)) {
      res.status(400).json({
        status: false,
        message: "ID must be integer",
      });
      return;
    }

    const query = await model.getProfileByEmail(email);

    if (!query.length) {
      res.status(404).json({
        status: false,
        message: "Data not found",
      });
      return;
    }

    res.json({
      status: true,
      message: "Get data success",
      data: query,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: "Error not found",
    });
  }
}

async function insertUsers(req, res) {
  try {
    const { email, password, fullName, phoneNumber } = req.body;

    // validasi input
    if (!(email && password && fullName && phoneNumber)) {
      res.status(400).json({
        status: false,
        message: "Bad input, please complete all of fields",
      });
      return;
    }
    // check if email already exists in the database
    const emailExists = await model.getProfileByEmail(email);
    if (emailExists.length > 0) {
      res.status(400).json({
        status: false,
        message: "Email already exists",
      });
      return;
    }

    const payload = {
      email,
      password,
      fullName,
      phoneNumber,
    };

    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    const query = await model.insertProfile({ ...payload, password: hash });
    res.json({
      status: true,
      message: "Success insert data",
      data: query,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
}

async function editUsers(req, res) {
  try {
    jwt.verify(
      getToken(req),
      process.env.PRIVATE_KEY,
      async function (err, { id }) {
        const {
          body: { email, password, fullName, phoneNumber },
        } = req;
        if (isNaN(id)) {
          res.status(400).json({
            status: false,
            message: "ID must be an integer",
          });

          return;
        }

        const checkData = await model.getProfileById(id);

        if (!checkData.length) {
          res.status(404).json({
            status: false,
            message: "ID not found",
          });
          return;
        }

        const payload = {
          email: email !== undefined ? email : checkData[0].email,
          password: password !== undefined ? password : checkData[0].password,
          fullName: fullName !== undefined ? fullName : checkData[0].fullName,
          phoneNumber:
            phoneNumber !== undefined ? phoneNumber : checkData[0].phoneNumber,
        };

        let query;
        if (password) {
          bcrypt.genSalt(saltRounds, async function (err, salt) {
            try {
              const hash = await bcrypt.hash(password, salt);
              query = await model.editProfile(
                { ...payload, password: hash },
                id
              );
              res.send({
                status: true,
                message: "Success edit data",
                data: query,
              });
            } catch (error) {
              res.status(500).json({
                status: false,
                message: "Internal Server Error",
              });
            }
          });
        } else {
          query = await model.editProfile(payload, id);
          res.send({
            status: true,
            message: "Success edit data",
            data: query,
          });
        }
      }
    );
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
}

async function deleteUsers(req, res) {
  try {
    jwt.verify(
      getToken(req),
      process.env.PRIVATE_KEY,
      async function (err, { id }) {
        if (isNaN(id)) {
          res.status(400).json({
            status: false,
            message: "ID must be integer",
          });
          return;
        }
        const checkData = await model.getProfileById(id);

        // validasi jika id yang kita mau edit tidak ada di database
        if (!checkData.length) {
          res.status(404).json({
            status: false,
            message: "ID not found",
          });

          return;
        }

        const query = await model.deleteProfile(id);

        res.send({
          status: true,
          message: "Success delete data",
          data: query,
        });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
}

async function editPhoto(req, res) {
  try {
    jwt.verify(getToken(req), process.env.PRIVATE_KEY, async (err, { id }) => {
      const { photo } = req?.files ?? {};
      if (!photo) {
        res.status(400).send({
          status: false,
          message: "Photo is required",
        });
      }

      let mimeType = photo.mimetype.split("/")[1];
      let allowFile = ["jpeg", "jpg", "png", "webp"];

      // cari apakah tipe data yang di upload terdapat salah satu dari list yang ada diatas
      if (!allowFile?.find((item) => item === mimeType)) {
        res.status(400).send({
          status: false,
          message: "Only accept jpeg, jpg, png, webp",
        });
      }

      // validate size image
      if (photo.size > 2000000) {
        res.status(400).send({
          status: false,
          message: "File to big, max size 2MB",
        });
      }

      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLODUNARY_KEY,
        api_secret: process.env.CLOUDINARY_SECRET,
      });

      const upload = cloudinary.uploader.upload(photo.tempFilePath, {
        public_id: new Date().toISOString(),
      });

      upload
        .then(async (data) => {
          const payload = {
            photo: data?.secure_url,
          };

          model.editPhotoUser(payload, id);

          res.status(200).send({
            status: false,
            message: "Success upload",
            data: payload,
          });
        })
        .catch((err) => {
          res.status(400).send({
            status: false,
            message: err,
          });
        });
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: false,
      message: "Error on server",
    });
  }
}

module.exports = {
  getProfile,
  getProfileById,
  getProfileByEmail,
  insertUsers,
  editUsers,
  deleteUsers,
  editPhoto,
};
