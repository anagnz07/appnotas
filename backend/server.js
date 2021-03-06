require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const logger = require("npmlog");
const morgan = require("morgan");
const { register, login, logout } = require("./controllers/userControllers");
const {
  createCategory,
  editCategory,
  deleteCategory,
  getCategories,
} = require("./controllers/categoriesControllers");
const { isAuth } = require("./middlewares/isAuth");
const { categoryExists } = require("./middlewares/categoryExists");
const noteExists = require("./middlewares/noteExists");
const userExists = require("./middlewares/userExists");
const { isAdmin } = require("./middlewares/isAdmin");

const hasPrivileges = require("./middlewares/hasPrivileges");

const {
  getNotes,
  getNote,
  createNote,
  deleteNote,
  setPublic,
  updateNote,
} = require("./controllers/notesControllers");

const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerJsDocs = YAML.load("./api-docs.yaml");

// middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerJsDocs));

// routes
app.post("/register", register);
app.post("/login", login);
app.patch("/logout", isAuth, logout);
app.get("/users/:username", userExists, isAuth, hasPrivileges, getNotes);
app.post("/users/:username", userExists, isAuth, createNote);
app.get("/users/:username/:noteID", userExists, noteExists, getNote);
app.patch(
  "/users/:username/:noteID/public",
  userExists,
  noteExists,
  isAuth,
  hasPrivileges,
  setPublic
);
app.patch(
  "/users/:username/:noteID",
  userExists,
  noteExists,
  isAuth,
  hasPrivileges,
  updateNote
);
app.delete(
  "/users/:username/:noteID",
  userExists,
  isAuth,
  hasPrivileges,
  deleteNote
);
app.get("/category", getCategories);
app.post("/category", isAuth, isAdmin, createCategory);
app.patch("/category/:name", categoryExists, isAuth, isAdmin, editCategory);
app.delete("/category/:name", categoryExists, isAuth, isAdmin, deleteCategory);

//errors 404
app.use((req, res) => {
  res.status(404).send({
    status: "error",
    message: "Not found",
  });
});

//middleware errors
app.use((error, req, res, next) => {
  res.status(error.httpStatus || 500).send({
    status: "error",
    message: error.message,
  });
});

// server listening
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info("SERVER", `http://localhost:${PORT}`);
});
