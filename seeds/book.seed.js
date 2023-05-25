const mongoose = require("mongoose");
const { connect } = require("../db.js");
const { Book } = require("../models/Book.js");
const { faker } = require("@faker-js/faker");

const bookSeed = async () => {
  try {
    // Conexion
    await connect();
    console.log("Conexion desde el seed satisfactoria");

    // Borrado de datos
    await Book.collection.drop();
    console.log("Limpieza de la coleccion Book realizada");

    const bookList = [
      {
        title: "Cocina facil",
        pages: 543,
      },
      {
        title: "1984",
        pages: 328,
      },
      {
        title: "To Kill a Mockingbird",
        pages: 281,
      }
    ];

    for (let i = 0; i < 50; i++) {
      let newBook = {};
      try {
        newBook = {
          title: faker.lorem.words(2),
          // author: faker.name.fullName(),
          pages: faker.datatype.number({ min: 100, max: 300 }),
          rating: Math.floor(Math.random() * 11),
          publisher: {
            name: faker.internet.userName(),
            category: faker.color.human(),
          },
        };
      } catch (error) {
        console.error(error);
        console.log(error);
      }
      bookList.push(newBook);
    }

    // Insercion de books
    const documents = bookList.map((book) => new Book(book));
    await Book.insertMany(documents);
    console.log("Datos insertados correctamente");
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
};

bookSeed();
