const mongoose = require("mongoose");
const { connect } = require("../db.js");
const { Author } = require("../models/Author.js");
// const { faker } = require("@faker-js/faker");

const authorSeed = async () => {
  try {
    // Conexion
    await connect();
    console.log("Conexion desde el seed satisfactoria");

    // Borrado de datos
    await Author.collection.drop();
    console.log("Limpieza de la coleccion Author realizada");

    const authorList = [
      { user: "gabri@gmail.com", password: "12345678", name: "Gabriel García Márquez", country: "Colombia" },
      { user: "jane@gmail.com", password: "12345678", name: "Jane Austen", country: "England" },
      { user: "leo@gmail.com", password: "12345678", name: "Leo Tolstoy", country: "Russia" },
      { user: "virginia@gmail.com", password: "12345678", name: "Virginia Woolf", country: "England" },
      { user: "ernest@gmail.com", password: "12345678", name: "Ernest Hemingway", country: "United States" },
      { user: "jorge@gmail.com", password: "12345678", name: "Jorge Luis Borges", country: "Argentina" },
      { user: "franz@gmail.com", password: "12345678", name: "Franz Kafka", country: "Czechoslovakia" },
      { user: "toni@gmail.com", password: "12345678", name: "Toni Morrison", country: "United States" },
      { user: "haruki@gmail.com", password: "12345678", name: "Haruki Murakami", country: "Japan" },
      { user: "chinua@gmail.com", password: "12345678", name: "Chinua Achebe", country: "Nigeria" },
    ];

    // GENERACION DE AUTORES ALEATORIOS
    // for (let i = 0; i < 5; i++) {
    //   let newAuthor = {};
    //   try {
    //     newAuthor = {
    //       name: faker.lorem.words(2),
    //       country: faker.address.country()
    //     };
    //   } catch (error) {
    //     console.error(error);
    //     console.log(error);
    //   }
    //   authorList.push(newAuthor);
    // }

    // Insercion de books
    const documents = authorList.map((author) => new Author(author));
    // Encriptado de contraseñas de los usuarios del seed
    for (let i = 0; i < documents.length; i++) {
      const document = documents[i];
      await document.save();
    }
    // await Author.insertMany(documents); No ponemos este porque el hash de encriptado lo hace mediante Save
    console.log("Datos insertados correctamente");
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
};

authorSeed();
