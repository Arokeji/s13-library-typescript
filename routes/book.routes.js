const express = require("express");
const multer = require("multer");
const fs = require("fs");

// Configuracion de Multer para subida de archivos
const upload = multer({ dest: "public" });

// Router de Books
const router = express.Router();

// Modelos
const { Book } = require("../models/Book.js");
const { Author } = require("../models/Author.js");

// Rutas
// CRUD: Read
// Ejemplo de request con parametros http://localhost:3000/book/?page=2&limit=10
router.get("/", (req, res, next) => {
  console.log("Estamos en el middleware /book que comprueba parámetros");

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

router.get("/", async (req, res) => {
  try {
    // Lectura de query parameters
    const { page, limit } = req.query;
    const books = await Book.find()
      .limit(limit)
      .skip((page - 1) * limit)
      .populate("author");

    // Conteo del total de elementos
    const totalElements = await Book.countDocuments();

    const response = {
      totalItems: totalElements,
      totalPages: Math.ceil(totalElements / limit),
      currentPage: page,
      data: books,
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

// CRUD: Create
router.post("/", async (req, res, next) => {
  try {
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      pages: req.body.pages,
      rating: req.body.rating,
      publisher: {
        name: req.body.publisher.name,
        category: req.body.publisher.category,
      },
    });

    const createdBook = await book.save();
    return res.status(200).json(createdBook);
  } catch (error) {
    next(error);
  }
});

// CRUD: Read
router.get("/:id", async (req, res, next) => {
  const id = req.params.id;

  try {
    const book = await Book.findById(id).populate("author");

    if (book) {
      const author = await Author.findById(book.author); // en vez de { author: id }
      const tempBook = book.toObject();
      tempBook.author = author;
      res.json(tempBook);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

// No CRUD. Busqueda personalizada
router.get("/title/:title", async (req, res, next) => {
  const title = req.params.title;

  try {
    const book = await Book.find({ title: new RegExp("^" + title.toLowerCase(), "i") }).populate("author");
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: Delete
router.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const bookDeleted = await Book.findByIdAndDelete(id);
    if (bookDeleted) {
      res.json(bookDeleted);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: Put
router.put("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const bookUpdated = await Book.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (bookUpdated) {
      res.json(bookUpdated);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

router.post("/cover-upload", upload.single("cover"), async (req, res, next) => {
  try {
    // Renombrado de la imagen
    const originalName = req.file.originalname;
    const path = req.file.path;
    const newPath = `${path}_${originalName}`;
    // Asigna a la propiedad path el valor de newPath
    fs.renameSync(path, newPath);

    // Busqueda del libro por ID
    const bookId = req.body.bookId;
    const book = await Book.findById(bookId);

    if (book) {
      book.coverImage = newPath;
      await book.save();
      res.json(book);
      console.log("✅ Cover uploaded and added succesfully.");
    } else {
      // Borra la imagen si no existe el libro
      fs.unlinkSync(newPath);
      res.status(404).send("Book not found. Please specify another Id.");
    }
  } catch (error) {
    next(error);
  }
});

module.exports = { bookRoutes: router };
