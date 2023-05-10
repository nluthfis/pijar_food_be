const express = require("express");
//const { pool } = require("./dbConfig");
const app = express();
const bodyParser = require("body-parser"); // node_modules
const db = require("./connection"); // directory kita
const multer = require("multer");
const path = require("path");
let ejs = require("ejs");
const sql = require("./connection");

//img
app.use(express.static(path.join(__dirname, "images")));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// view engine setup

app.set("view engine", "ejs");

//session

/////////////middleware multer upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./avatar");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });
const upload2 = multer({ storage: storage2 });

///routes

app.use(express.static(__dirname + "/public"));
app.use("/uploads", express.static("uploads"));
app.use("/avatar", express.static("avatar"));
app.use("/regisUser", express.static("regisUser"));
app.use("/detailRecipes", express.static("images"));


app.get("/detailRecipes", (req, res) => {
  res.render("pages/detailRecipes", {
    articles: posts,
  });
});

// get all data
app.get("/recipes", async function (req, res) {
  try {
    const query = await db`SELECT * FROM recipes`;
    res.json({
      status: true,
      message: "Get data success",
      data: query,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
});
// get all data by id
app.get("/recipes/:id", async function (req, res) {
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

    const query = await db`SELECT * FROM recipes WHERE id = ${id}`;

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
});

// insert data
app.post("/recipes", upload.single("img"), async function (req, res) {
  try {
    const { tittle, ingredients, videoLink, imgPath} = req.body;

    // validasi input
    if (!(tittle && ingredients && videoLink )) {
      res.status(400).json({
        status: false,
        message: "Bad input, please complete all of fields",
      });
      return;
    }

    const payload = {
      tittle,
      ingrtittleedients,
      videoLink,
      imgPath: req.file.path,
    };

    const query = await db`INSERT INTO recipes ${db(
      payload,
      "tittle",
      "ingredients",
      "videoLink",
      "imgPath"
    )} returning *`;
    
    // res.json({
    //   status: true,
    //   message: "Success insert data",
    //   data: query,
    res.render("pages/createRecipes", {
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
});

// edit data
app.patch("/recipes/:id", async function (req, res) {
  try {
    const {
      params: { id },
      body: { tittle, ingredients, videoLink, imgPath},
    } = req;

    if (isNaN(id)) {
      res.status(400).json({
        status: false,
        message: "ID must be integer",
      });

      return;
    }

    const checkData = await db`SELECT * FROM recipes WHERE id = ${id}`;

    if (!checkData.length) {
      res.status(404).json({
        status: false,
        message: "ID not found",
      });

      return;
    }

    const payload = {
      tittle: tittle ?? checkData[0].tittle,
      ingredients: ingredients ?? checkData[0].ingredients,
      videoLink: videoLink ?? checkData[0].videoLink,
      imgPath: imgPath ?? checkData[0].imgPath,
    };

    const query = await db`UPDATE recipes set ${db(
      payload,
      "tittle",
      "ingredients",
      "videoLink"
    )} WHERE id = ${id} returning *`;

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

// delete data
app.delete("/recipes/:id", async function (req, res) {
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

    const checkData = await db`SELECT * FROM recipes WHERE id = ${id}`;

    // validasi jika id yang kita mau edit tidak ada di database
    if (!checkData.length) {
      res.status(404).json({
        status: false,
        message: "ID not found",
      });

      return;
    }

    const query = await db`DELETE FROM recipes WHERE id = ${id} returning *`;

    res.send({
      status: true,
      message: "Success delete data",
      data: query,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
});
///////

app.get("/views/recipes/:id", async (req, res) => {
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

    const query = await db`SELECT * FROM recipes WHERE id = ${id}`;

    if (!query.length) {
      res.status(404).json({
        status: false,
        message: "Data not found",
      });
      return;
    }
    const recipes = query;
    res.render("pages/detailRecipes", { recipes });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
});

//login & register
// app.post('/register', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     await db.none('INSERT INTO users(email, password) VALUES($1, $2)', [email, password]);
//     res.redirect("pages/login");
//   } catch (error) {
//     res.status(500).send('Error registering user');
//   }
// });

// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await db.one('SELECT * FROM users WHERE username = $1 AND password = $2', [email, password]);
//     req.session.user = user;
//     res.redirect("pages/home");
//   } catch (error) {
//     res.status(401).send('Invalid credentials');
//   }
// });

//users
// get all data
app.get("/profile", async function (req, res) {
  try {
    const query = await db`SELECT * FROM users`;
    console.log(query);
    res.json({
      status: true,
      message: "Get data success",
      data: query,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
});
// get all data by id
app.get("/profile/:id", async function (req, res) {
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

    const query = await db`SELECT * FROM users WHERE id = ${id}`;

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
});

app.get("/views/profile/:id", async (req, res) => {
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

    const query = await db`SELECT * FROM users WHERE id = ${id}`;

    if (!query.length) {
      res.status(404).json({
        status: false,
        message: "Data not found",
      });
      return;
    }
    const users = query;
    res.render("pages/profile", { users });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
});

app.post("/register",
  upload2.single("profilePicture"),
  async function (req, res) {
    try {
      const { fullName, email, password, phoneNumber, profilePicture } =
        req.body;

      // validasi input
      // if (!(fullName && email && password && phoneNumber && profilePicture )) {
      //   res.status(400).json({
      //     status: false,
      //     message: "Bad input, please complete all of fields",
      //   });

      //   return;
      // }

      const payload = {
        fullName,
        email,
        password,
        phoneNumber,
        profilePicture: req.file.path,
      };

      const query = await db`INSERT INTO users ${db(
        payload,
        "fullName",
        "email",
        "password",
        "phoneNumber",
        "profilePicture"
      )} returning *`;

      res.render("pages/register", {
        status: true,
        message: "Success insert data",
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "Server error",
      });
    }
  }
);

//render page

app.get(["/views/home", "/"], async (req, res) => {
  const query = await db`SELECT * FROM recipes`;
  res.render("pages/home", {
    recipes: query,
  });
});

app.get("/views/recipes", async (req, res) => {
  res.render("pages/createRecipes", {
    status: null,
  });
});

app.get(["/views/profile"], async (req, res) => {
  const query = await db`SELECT * FROM users`;
  res.render("pages/profile", {
    users: query,
  });
});

app.get("/users/register", (req, res) => {
  res.render("pages/register");
});

app.get("/users/login", (req, res) => {
  res.render("pages/login");
});

app.listen(3000, () => {
  console.log("App running in port 3000");
});



