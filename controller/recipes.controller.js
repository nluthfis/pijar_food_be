const model = require("../models/recipes.models");
const db = require("../connection");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;

function getToken(req) {
  const token = req?.headers?.authorization?.slice(
    7,
    req?.headers?.authorization?.length
  );
  console.log(token);
  return token;
}

async function getRecipes(req, res) {
  try {
    let query;
    let keyword = `%${req?.query?.keyword}%`;
    let sort = db`DESC`;
    let isPaginate =
      req?.query?.page &&
      !isNaN(req?.query?.page) &&
      parseInt(req?.query?.page) >= 1;

    if (req?.query?.sortType?.toLowerCase() === "asc") {
      if (isPaginate) {
        sort = db`ASC LIMIT 3 OFFSET ${3 * (parseInt(req?.query?.page) - 1)}`;
      } else {
        sort = db`ASC`;
      }
    }

    if (isPaginate && !req?.query?.sortType) {
      sort = db`DESC LIMIT 3 OFFSET ${3 * (parseInt(req?.query?.page) - 1)}`;
    }

    if (req?.query?.keyword) {
      query = await model.getAllRecipesByKeyword(keyword, sort);
    } else {
      query = await model.getAllRecipedBySort(sort);
    }

    res.json({
      status: query?.length ? true : false,
      message: query?.length ? "Get data success" : "Data not found",
      total: query?.length ?? 0,
      pages: isPaginate
        ? {
            current: parseInt(req?.query?.page),
            total: query?.[0]?.full_count
              ? Math.ceil(parseInt(query?.[0]?.full_count) / 3)
              : 0,
          }
        : null,
      data: query?.map((item) => {
        delete item.full_count;
        return item;
      }),
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
}
async function getRecipesById(req, res) {
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

    const query = await model.getRecipesById(id);

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

async function getRecipesByUserId(req, res) {
  try {
    jwt.verify(getToken(req), process.env.PRIVATE_KEY, async (err, { id }) => {
      let query;
      let keyword = `%${req?.query?.keyword}%`;
      let sort = db`DESC`;
      let isPaginate =
        req?.query?.page &&
        !isNaN(req?.query?.page) &&
        parseInt(req?.query?.page) >= 1;

      if (req?.query?.sortType?.toLowerCase() === "asc") {
        if (isPaginate) {
          sort = db`ASC LIMIT 3 OFFSET ${3 * (parseInt(req?.query?.page) - 1)}`;
        } else {
          sort = db`ASC`;
        }
      }

      if (isPaginate && !req?.query?.sortType) {
        sort = db`DESC LIMIT 3 OFFSET ${3 * (parseInt(req?.query?.page) - 1)}`;
      }

      if (req?.query?.keyword) {
        query =
          await db`SELECT *, count(*) OVER() AS full_count FROM recipes WHERE LOWER(recipes.tittle) LIKE LOWER(${keyword}) AND user_id = ${id} ORDER BY id ${sort}`;
      } else {
        query =
          await db`SELECT *, count(*) OVER() AS full_count FROM recipes WHERE user_id = ${id} ORDER BY id ${sort}`;
      }

      res.json({
        status: query?.length ? true : false,
        message: query?.length ? "Get data success" : "Data not found",
        total: query?.length ?? 0,
        pages: isPaginate
          ? {
              current: parseInt(req?.query?.page),
              total: query?.[0]?.full_count
                ? Math.ceil(parseInt(query?.[0]?.full_count) / 3)
                : 0,
            }
          : null,
        data: query?.map((item) => {
          delete item.full_count;
          return item;
        }),
      });
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
}

async function insertRecipeData(req, res) {
  try {
    const { id } = req.user;

    const { tittle, ingredients, videoLink } = req.body;

    // validasi input
    if (!(tittle && ingredients && videoLink)) {
      res.status(400).json({
        status: false,
        message: "Bad input, please complete all of fields",
      });
      return;
    }

    const payload = {
      tittle,
      ingredients,
      videoLink,
      user_id: id,
    };

    const query = await model.insertRecipesData(payload);

    res.json({
      status: true,
      message: "Success insert data",
      data: query,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
}
async function editRecipesData(req, res) {
  try {
    const user_id = req.user.id;
    const {
      params: { id },
      body: { tittle, ingredients, videoLink },
    } = req;

    if (isNaN(id)) {
      res.status(400).json({
        status: false,
        message: "ID must be integer",
      });

      return;
    }

    const checkData = await model.getRecipesById(id);

    if (!checkData.length) {
      res.status(404).json({
        status: false,
        message: "ID not found",
      });

      return;
    }

    if (checkData[0].user_id != user_id) {
      res.status(400).json({
        status: false,
        message: "ID berbeda",
      });

      return;
    }

    const payload = {
      tittle: tittle ?? checkData[0].tittle,
      ingredients: ingredients ?? checkData[0].ingredients,
      videoLink: videoLink ?? checkData[0].videoLink,
    };

    const query = await model.editRecipesData(payload, id);

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
}
async function deleteRecipesData(req, res) {
  try {
    const user_id = req.user.id;

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

    const checkData = await model.getRecipesById(id);

    // validasi jika id yang kita mau edit tidak ada di database
    if (!checkData.length) {
      res.status(404).json({
        status: false,
        message: "ID not found",
      });

      return;
    }
    if (checkData[0].user_id != user_id) {
      res.status(400).json({
        status: false,
        message: "ID berbeda",
      });

      return;
    }

    const query = await model.deleteRecipes(id);

    res.send({
      status: true,
      message: "Success delete data",
      data: query,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
}
async function editPhoto(req, res) {
  try {
    const { id } = req.params;
    console.log(id);

    const user_id = req.user.id;
    console.log(user_id);

    const checkData = await model.getRecipesById(id);
    console.log(checkData);
    if (checkData[0].user_id != user_id) {
      res.status(400).json({
        status: false,
        message: "ID berbedaaaa",
      });

      return;
    }

    const { photo } = req?.files ?? {};

    if (!photo) {
      res.status(400).send({
        status: false,
        message: "Photo is required",
      });
    }

    let mimeType = photo.mimetype.split("/")[1];
    let allowFile = ["jpeg", "jpg", "png", "webp"];

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

    upload.then(async (data) => {
      const payload = {
        photo: data?.secure_url,
      };

      model.editPhotoRecipes(payload, id);

      res.status(500).send({
        status: true,
        message: "Success upload",
        data: payload,
      });
    });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: "Error on server",
    });
  }
}

module.exports = {
  getRecipes,
  getRecipesById,
  getRecipesByUserId,
  insertRecipeData,
  editRecipesData,
  deleteRecipesData,
  editPhoto,
};
