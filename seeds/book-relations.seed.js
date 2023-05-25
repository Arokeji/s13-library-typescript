const mongoose = require("mongoose");
const { connect } = require("../db.js");
const { Book } = require("../models/Book.js");
const { Author } = require("../models/Author.js");
const { randomNumber } = require("../utils.js");

const bookRelationsSeed = async () => {
  try {
    await connect();
    console.log("Conexion con el seed de relaciones realizada.");

    // Recoger libros y autores
    const books = await Book.find();
    const authors = await Author.find();

    // Comprobamos si existen datos
    if (!books.length) {
      console.log("No hay libros en la Base de Datos");
      return; // finaliza la condicion sin necesidad de else
    }
    if (!authors.length) {
      console.log("No hay autores en la Base de Datos");
      return; // finaliza la condicion sin necesidad de else
    }

    // Asigna un autor aleatorio a cada libro
    for (let i = 0; i < books.length; i++) {
      const book = books[i];
      const randomAuthor = authors[randomNumber(0, authors.length - 1)];
      book.author = randomAuthor._id;
      await book.save();
    }

    console.log("Relaciones realizadas correctamente.");
  } catch (error) {
    console.error(error);
    console.log(error)
  } finally {
    mongoose.disconnect();
  }
};

bookRelationsSeed();
