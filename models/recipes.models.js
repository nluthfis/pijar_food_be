const { query } = require("express");
const db = require("../connection");

const getAllRecipe = async () => {
  query = db`SELECT * FROM recipes`;
  console.log(query);
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

const getAllRecipedBySort = async (sort) => {
  try {
    const query =
      await db`SELECT *, count(*) OVER() as full_count FROM recipes ORDER BY recipes.id ${sort}`;
    return query;
  } catch (error) {
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
      "user_id"
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
      "videoLink"
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

module.exports = {
  getAllRecipe,
  getAllRecipesByKeyword,
  getAllRecipedBySort,
  getRecipesById,
  insertRecipesData,
  editRecipesData,
  deleteRecipes,
  editPhotoRecipes,
};
