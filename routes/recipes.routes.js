const router = require("express").Router();
const recipesController = require("../controller/recipes.controller");
const profileController = require("../controller/profile.controller");
const middleware = require("../middleware/jwt.middleware");

// get all data
router.get("/recipes", recipesController.getRecipes);
// get all recipes by id
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
// edit photo
router.patch("/recipes/photo/:id", middleware, recipesController.editPhoto);

router.get("/getlikes", recipesController.getLiked);

router.post("/likes", middleware, recipesController.addLiked);

router.delete("/unlikes", middleware, recipesController.removeLiked);

router.post(
  "/post_comment",
  middleware,
  recipesController.addComment,
  profileController.getProfileById
);

router.get("/comment", recipesController.getComment);

router.get("/liked/recipes", middleware, recipesController.getRecipeLikedById);

module.exports = router;
