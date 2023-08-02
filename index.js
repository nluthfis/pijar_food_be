const express = require("express");
const app = express();
const bodyParser = require("body-parser"); // node_modules
const helmet = require("helmet");
const xssClean = require("xss-clean");
const cors = require("cors");

const fileUpload = require("express-fileupload");

app.use(helmet());

app.use(xssClean());

app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.urlencoded());
// parse application/json
app.use(bodyParser.json());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

const profileRoutes = require("./routes/profile.routes");
const recipesRoutes = require("./routes/recipes.routes");
const authUser = require("./routes/auth.routes");

app.use(profileRoutes);
app.use(recipesRoutes);
app.use(authUser);

const port = process.env.PORT || 8000;
app.get("/", function (req, res) {
  res.send("Api is running Well!");
});
app.listen(port, "0.0.0.0", function () {
  console.log("Listening on Port " + port);
});
