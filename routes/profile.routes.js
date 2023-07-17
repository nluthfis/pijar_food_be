const router = require("express").Router();
const profileController = require("../controller/profile.controller");
const middleware = require("../middleware/jwt.middleware");

router.get("/profile", middleware, profileController.getProfile);

router.get("/profile", middleware, profileController.getProfileById);

router.post("/profile/register", profileController.insertUsers);

router.patch("/profile", middleware, profileController.editUsers);
//edit photo
router.patch("/profile/photo", middleware, profileController.editPhoto);

router.delete("/profile", middleware, profileController.deleteUsers);

module.exports = router;
