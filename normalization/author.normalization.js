const { mongoose } = require("mongoose");
const { connect } = require("../db.js");
const { Author } = require("../models/Author.js");

const authorNormalization = async () => {
  try {
    await connect();
    console.log("Conexion de la normalizacion de autores correcta.");
    const authors = await Author.find().select("+password");
    console.log(`Existen ${authors.length} autores en la base de datos.`);

    for (let i = 0; i < authors.length; i++) {
      const author = authors[i];
      console.log(author.country);
      author.country = author.country.toUpperCase();
      await author.save();

      console.log(`Modificado ${author.name}`);
    }
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
};

authorNormalization();
