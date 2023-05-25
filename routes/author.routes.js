const express = require("express");
const bcrypt = require("bcrypt");

// Token
const { generateToken } = require("../utils/token.js");

// Middleware
const { isAuth } = require("../Middleware/auth.middleware.js");

// Router de Books
const router = express.Router();

// Modelos
const { Author } = require("../models/Author.js");

// Rutas
// CRUD: Read
// Ejemplo de request con parametros http://localhost:3000/author/?page=2&limit=10
router.get("/", (req, res, next) => {
  console.log("Estamos en el middleware /author que comprueba parámetros");

  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
      req.query.page = page;
      req.query.limit = limit;
      next();
    } else {
      console.log("Parámetros no válidos:");
      console.log(JSON.stringify(req.query));
      res.status(400).json({ error: "Params page or limit are not valid" });
    }
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    // Lectura de query parameters
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const authors = await Author.find()
      .limit(limit)
      .skip((page - 1) * limit);

    // Conteo del total de elementos
    const totalElements = await Author.countDocuments();

    const response = {
      totalItems: totalElements,
      totalPages: Math.ceil(totalElements / limit),
      currentPage: page,
      data: authors,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// CRUD: Create
router.post("/", async (req, res, next) => {
  console.log("Creando autor");
  try {
    const author = new Author({
      user: req.body.user,
      password: req.body.password,
      name: req.body.name,
      country: req.body.country,
    });

    const createdAuthor = await author.save();
    return res.status(200).json(createdAuthor);
  } catch (error) {
    next(error);
  }
});

// CRUD: Read
router.get("/:id", async (req, res, next) => {
  const id = req.params.id;

  try {
    const author = await Author.findById(id);

    if (author) {
      res.json(author);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

// No CRUD. Busqueda personalizada
router.get("/name/:name", async (req, res, next) => {
  const name = req.params.name;

  try {
    const author = await Author.find({ name: new RegExp("^" + name.toLowerCase(), "i") });
    if (author) {
      res.json(author);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: Delete con el middleware isAuth
router.delete("/:id", isAuth, async (req, res, next) => {
  try {
    const id = req.params.id;

    if (req.author.id !== id && req.author.user !== "admin@gmail.com") {
      return res.status(401).json({ error: "No tienes permisos para realizar esta operacion." });
    }

    const authorDeleted = await Author.findByIdAndDelete(id);
    if (authorDeleted) {
      res.json(authorDeleted);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: Put con el middleware isAuth
router.put("/:id", isAuth, async (req, res, next) => {
  try {
    const id = req.params.id;

    if (req.author.id !== id && req.author.user !== "admin@gmail.com") {
      return res.status(401).json({ error: "No tienes permisos para realizar esta operacion." });
    }
    const authorToUpdate = await Author.findById(id);
    if (authorToUpdate) {
      Object.assign(authorToUpdate, req.body); // Le asigna todo del body a la const
      await authorToUpdate.save();
      // Eliminamos el password del objeto que devuelve
      const authorPasswordFiltered = authorToUpdate.toObject();
      delete authorPasswordFiltered.password;
      res.json(authorToUpdate);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

// Login de usuarios
router.post("/login", async (req, res, next) => {
  try {
    // Declaracion de dos const con el mismo nombre que los campos que queremos del body
    const { user, password } = req.body;

    // Comprueba si hay usuario y contraseña
    if (!user || !password) {
      res.status(400).send("Falta el usuario o la contraseña.");
      return;
    }

    // Busca el usuario, seleccionando tambien el campo password
    const authorFound = await Author.findOne({ user }).select("+password");
    if (!authorFound) {
      return res.status(401).json({ error: "Combinacion de usuario y password incorrecta" });
    }

    // Compara el password recibido con el guardado previamente encriptado
    const passwordMatches = await bcrypt.compare(password, authorFound.password);
    if (passwordMatches) {
      // Eliminamos el password del objeto que devuelve
      const authorPasswordFiltered = authorFound.toObject();
      delete authorPasswordFiltered.password;

      // Generamos token JWT
      const jwtToken = generateToken(authorFound._id, authorFound.user, next);

      console.log("Login correcto");

      return res.status(200).json({ token: jwtToken });
    } else {
      return res.status(401).json({ error: "Combinacion de usuario y password incorrecta" });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = { authorRoutes: router };
