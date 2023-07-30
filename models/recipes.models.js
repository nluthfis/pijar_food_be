const { query } = require("express");
const db = require("../connection");

const getAllRecipe = async () => {
  query = db`SELECT * FROM recipes`;
};

const getAllRecipesByKeyword = async (keyword, sort) => {
  try {
    const query =
      await db`SELECT *, count(*) OVER() as full_count FROM recipes WHERE LOWER(recipes.tittle) ILIKE LOWER(${keyword}) ORDER BY recipes.id ${sort}`;
    return query;
  } catch (error) {
    return error;
  }
};

const getAllRecipesByCategory = async (category, sort) => {
  try {
    const query =
      await db`SELECT *, count(*) OVER() as full_count FROM recipes WHERE LOWER(recipes.category) ILIKE LOWER(${category}) ORDER BY recipes.id ${sort}`;
    return query;
  } catch (error) {
    return error;
  }
};

const getAllRecipedBySort = async (sort) => {
  try {
    const query =
      await db`SELECT *, count(*) OVER() as full_count FROM recipes ORDER BY recipes.created_at ${sort}`;
    return query;
  } catch (error) {
    return error;
  }
};

const getAllRecipedByRating = async () => {
  try {
    const query = await db`SELECT *
    FROM recipes
    LEFT JOIN (
      SELECT recipe_id, AVG(score) AS average_score
      FROM recipes_info
      GROUP BY recipe_id
    ) AS avg_score ON recipes.id = avg_score.recipe_id
    ORDER BY avg_score.average_score DESC NULLS LAST`;
    return query;
  } catch (error) {
    return error;
  }
};

const getAllRecipesByIdUserKeyword = async (keyword, sort, id) => {
  try {
    const query =
      await db`SELECT *, count(*) OVER() as full_count FROM recipes WHERE LOWER(recipes.tittle) ILIKE LOWER(${keyword}) AND user_id = ${id} ORDER BY recipes.id ${sort}`;
    return query;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getAllRecipedByidUserSort = async (sort, id) => {
  try {
    const query =
      await db`SELECT *, count(*) OVER() as full_count FROM recipes WHERE user_id = ${id} ORDER BY recipes.id ${sort}`;
    return query;
  } catch (error) {
    console.log(error);
    return error;
  }
};
const getRecipesById = async (id) => {
  try {
    const query = await db`SELECT * FROM recipes WHERE id = ${id}`;
    return query;
  } catch (error) {
    return error;
  }
};

const insertRecipesData = async (payload) => {
  try {
    const query = await db`INSERT INTO recipes ${db(
      payload,
      "tittle",
      "ingredients",
      "videoLink",
      "user_id",
      "photo",
      "category",
      "description"
    )} returning *`;
    return query;
  } catch (error) {
    return error;
  }
};

const editRecipesData = async (payload, id) => {
  try {
    const query = await db`UPDATE recipes set ${db(
      payload,
      "tittle",
      "ingredients",
      "videoLink",
      "category",
      "description"
    )} WHERE id = ${id} returning *`;
    return query;
  } catch (error) {
    return error;
  }
};

const deleteRecipes = async (id) => {
  try {
    const query = await db`DELETE FROM recipes WHERE id = ${id} returning *`;
    return query;
  } catch (error) {
    return error;
  }
};

const editPhotoRecipes = async (payload, id) => {
  try {
    const query = await db`UPDATE recipes set ${db(
      payload,
      "photo"
    )} WHERE id = ${id} returning *`;
    return query;
  } catch (error) {
    return error;
  }
};

const getRecipesByRecipeId = async (recipe_id) => {
  try {
    const query = await db`SELECT * FROM recipes WHERE id = ${recipe_id}`;
    return query;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getLiked = async (recipe_id) => {
  try {
    const query =
      await db`SELECT user_id FROM like_by WHERE recipe_id = ${recipe_id}`;
    return query;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getAllComment = async (recipe_id) => {
  try {
    const query =
      await db`SELECT * FROM recipes_info WHERE recipe_id = ${recipe_id}`;
    return query;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const checkComment = async (id, recipe_id) => {
  try {
    const query =
      await db`SELECT comment_by FROM recipes_info WHERE comment_by = ${id} AND recipe_id = ${recipe_id}`;
    return query;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const insertComment = async (payload) => {
  try {
    const query = await db`INSERT INTO recipes_info ${db(
      payload,
      "score",
      "comment",
      "comment_by",
      "recipe_id",
      "name_user",
      "photo_user"
    )} returning *`;
    return query;
  } catch (error) {
    return error;
  }
};
const checkLiked = async (id) => {
  try {
    const query = await db`SELECT recipe_id FROM like_by WHERE user_id = ${id}`;
    return query;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
const addLiked = async (payload) => {
  try {
    const query = await db`INSERT INTO like_by ${db(
      payload,
      "user_id",
      "recipe_id"
    )} returning *`;
    return query;
  } catch (error) {
    return error;
  }
};
const deleteLiked = async (id, recipe_id) => {
  try {
    const query =
      await db`DELETE FROM like_by WHERE user_id = ${id} AND recipe_id = ${recipe_id} returning *`;
    return query;
  } catch (error) {
    return error;
  }
};
const getRecipeLikedById = async (id) => {
  try {
    const query = await db`SELECT like_by.user_id, recipes.*
      FROM like_by
      JOIN recipes ON like_by.recipe_id = recipes.id
      JOIN users ON like_by.user_id = users.id
      WHERE users.id = ${id} `;
    return query;
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = {
  getAllRecipe,
  getAllRecipesByKeyword,
  getAllRecipedBySort,
  getAllRecipesByCategory,
  getAllRecipesByIdUserKeyword,
  getAllRecipedByidUserSort,
  getAllRecipedByRating,
  getRecipesById,
  insertRecipesData,
  editRecipesData,
  deleteRecipes,
  editPhotoRecipes,
  getLiked,
  getAllComment,
  checkComment,
  insertComment,
  getRecipesByRecipeId,
  checkLiked,
  addLiked,
  deleteLiked,
  getRecipeLikedById,
};
