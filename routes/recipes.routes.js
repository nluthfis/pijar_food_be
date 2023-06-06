const router = require("express").Router();
const recipesController = require("../controller/recipes.controller");
const middleware = require("../middleware/jwt.middleware");

// get all data
router.get("/recipes", recipesController.getRecipes);

// get all data by id
router.get("/recipes/:id", recipesController.getRecipesById);

//get recipe by user

router.get(
  "/recipes/profile/me",
  middleware,
  recipesController.getRecipesByUserId
);

// insert data
router.post("/recipes", middleware, recipesController.insertRecipeData);

// edit data
router.patch("/recipes/:id", middleware, recipesController.editRecipesData);

// delete data
router.delete("/recipes/:id", middleware, recipesController.deleteRecipesData);

router.patch("/recipes/photo/:id", middleware, recipesController.editPhoto);

module.exports = router;
