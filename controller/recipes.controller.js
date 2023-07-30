const model = require("../models/recipes.models");
const modelProfile = require("../models/profile.models");
const db = require("../connection");
const jwt = require("jsonwebtoken");
const { c } = require("tar");
const cloudinary = require("cloudinary").v2;

function getToken(req) {
  const token = req?.headers?.authorization?.slice(
    7,
    req?.headers?.authorization?.length
  );
  return token;
}

async function getRecipes(req, res) {
  try {
    let query;
    let keyword = `%${req?.query?.keyword}%`;
    let category = `%${req?.query?.category}%`;
    let popular = req?.query?.popular;
    let sort = db`DESC`;
    let isPaginate =
      req?.query?.page &&
      !isNaN(req?.query?.page) &&
      parseInt(req?.query?.page) >= 1;

    if (req?.query?.sortType?.toLowerCase() === "asc") {
      if (isPaginate) {
        sort = db`ASC LIMIT 5 OFFSET ${5 * (parseInt(req?.query?.page) - 1)}`;
      } else {
        sort = db`ASC`;
      }
    }

    if (isPaginate && !req?.query?.sortType) {
      sort = db`DESC LIMIT 5 OFFSET ${5 * (parseInt(req?.query?.page) - 1)}`;
    }

    if (req?.query?.keyword) {
      query = await model.getAllRecipesByKeyword(keyword, sort);
    } else if (req?.query?.popular === "popular") {
      query = await model.getAllRecipedByRating();
    } else if (req?.query?.category) {
      query = await model.getAllRecipesByCategory(category, sort);
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
              ? Math.ceil(parseInt(query?.[0]?.full_count) / 5)
              : 0,
          }
        : null,
      data: query?.map((item) => {
        delete item.full_count;
        return item;
      }),
    });
  } catch (error) {
    console.log(error);
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

    const { tittle, ingredients, videoLink, category, description } = req.body;

    const { photo } = req.files;

    // validasi input
    if (
      !(tittle && ingredients && videoLink && photo && category && description)
    ) {
      res.status(400).json({
        status: false,
        message: "Bad input, please complete all of fields",
      });
      return;
    }

    if (photo.size > 2000000) {
      res.status(400).send({
        status: false,
        message: "File to big, max size 2MB",
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

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLODUNARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    });

    const upload = cloudinary.uploader.upload(photo.tempFilePath, {
      folder: "img/recipes",
      public_id: new Date().toISOString(),
    });

    upload.then(async (data) => {
      const payload = {
        tittle,
        ingredients,
        videoLink,
        category,
        description,
        user_id: id,
        photo: data?.secure_url,
      };
      const query = await model.insertRecipesData(payload);
      res.json({
        status: true,
        message: "Success insert data",
        data: query,
      });
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
      body: { tittle, ingredients, videoLink, category, description },
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
      category: category ?? checkData[0].category,
      description: description ?? checkData[0].description,
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

    const user_id = req.user.id;

    const checkData = await model.getRecipesById(id);

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
async function getLiked(req, res) {
  try {
    let recipe_id = `${req?.query?.recipe_id}`; // query params
    const getLike = await model.getLiked(recipe_id);
    if (getLike.length === 0) {
      res.status(200).json({
        status: false,
        message: "No likes for this recipe",
      });
      return;
    }

    res.json({
      message: "Suceess get liked",
      data: getLike,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
}
async function addComment(req, res) {
  try {
    jwt.verify(getToken(req), process.env.PRIVATE_KEY, async (err, { id }) => {
      let recipe_id = req?.body?.recipe_id;
      let score = req?.body?.score;
      let comment = req?.body?.comment;

      const query = await model.getRecipesById(recipe_id);

      if (query.length === 0) {
        res.status(400).json({
          status: false,
          message: "Recipe not found",
        });
        return;
      }

      if (!(recipe_id && score && comment)) {
        res.status(400).json({
          status: false,
          message: "Bad input, please complete all of fields",
        });
        return;
      }

      if (score < 1 || score > 5) {
        res.status(400).json({
          status: false,
          message: "Score must be between 1 and 5",
        });
        return;
      }

      getUser = await modelProfile.getProfileById(id);

      checkComment = await model.checkComment(id, recipe_id);

      if (checkComment.length > 0) {
        res.status(400).json({
          status: false,
          message: "User already commented",
        });
        return;
      }

      const payload = {
        score,
        comment,
        comment_by: id,
        name_user: getUser[0].fullName,
        photo_user: getUser[0].photo,
        recipe_id: recipe_id,
      };

      const addComment = await model.insertComment(payload);

      res.json({
        message: "Successfully add comment",
        data: addComment,
      });
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
}
async function getComment(req, res) {
  try {
    let recipe_id = `${req?.query?.recipe_id}`;
    const query = await model.getAllComment(recipe_id);

    res.json({
      status: query?.length ? true : false,
      message: query?.length ? "Get data success" : "Data not found",
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
async function addLiked(req, res) {
  try {
    jwt.verify(getToken(req), process.env.PRIVATE_KEY, async (err, { id }) => {
      let recipe_id = `${req?.query?.recipe_id}`;
      const query = await model.getRecipesByRecipeId(recipe_id);
      console.log(id);
      if (query.length === 0) {
        res.status(400).json({
          status: false,
          message: "Recipe not found",
        });
        return;
      }

      const getLike = await model.checkLiked(id);

      let isLiked = false;

      for (let i = 0; i < getLike.length; i++) {
        if (getLike[i].recipe_id == recipe_id) {
          isLiked = true;
          break;
        }
      }

      if (isLiked) {
        res.status(400).json({
          status: false,
          message: "User already liked",
        });
        return;
      }

      const payload = {
        user_id: id,
        recipe_id: recipe_id,
      };

      await model.addLiked(payload);

      res.json({
        message: "Suceess liked",
        data: query,
      });
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
}
async function removeLiked(req, res) {
  try {
    jwt.verify(getToken(req), process.env.PRIVATE_KEY, async (err, { id }) => {
      let recipe_id = `${req?.query?.recipe_id}`;
      const query = await model.getRecipesByRecipeId(recipe_id);
      console.log(id);
      if (query.length === 0) {
        res.status(400).json({
          status: false,
          message: "Recipe not found",
        });
        return;
      }

      const getLike = await model.checkLiked(id);
      console.log(getLike);

      let isLiked = false;

      for (let i = 0; i < getLike.length; i++) {
        if (getLike[i].recipe_id == recipe_id) {
          isLiked = true;
          break;
        }
      }

      if (!isLiked) {
        res.status(400).json({
          status: false,
          message: "User have't liked yet",
        });
        return;
      }
      await model.deleteLiked(id, recipe_id);

      res.json({
        message: "Suceess unliked",
        data: query,
      });
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
}
async function getRecipeLikedById(req, res) {
  try {
    jwt.verify(getToken(req), process.env.PRIVATE_KEY, async (err, { id }) => {
      const getLike = await model.getRecipeLikedById(id);
      res.json({
        message: "Suceess get data",
        data: getLike,
      });
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Server error",
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
  addLiked,
  getComment,
  removeLiked,
  addComment,
  getLiked,
  getRecipeLikedById,
};
