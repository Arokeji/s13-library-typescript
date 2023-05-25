const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Creacion del esquema del libro
const bookSchema = new Schema(
  {
    title: {
      // Parametros del campo
      type: String,
      required: true,
      trim: true,
      minLength: [3, "No se ha alcanzado el minimo de caracteres"],
      maxLength: [50, "Se ha superado el maximo de caracteres"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
    },
    pages: {
      type: Number,
      required: false,
      trim: true,
      min: [1, "Tiene que tener como minimo una pagina"],
      max: [15000, "Como maximo se permiten 15000 paginas"],
    },
    rating: {
      type: Number,
      required: false,
      min: [0, "La valoracion minima es 0"],
      max: [10, "La valoracion maxima es 10"],
    },
    publisher: {
      type: {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        category: {
          type: String,
          required: false,
          trim: true,
        },
      },
      required: false,
    },
    coverImage: {
      type: String,
      required: false,
    }
  },
  {
    // Deja fecha y hora
    timestamps: true,
  }
);

// Creacion del modelo en si con un nombre y la configuracion del esquema
const Book = mongoose.model("Book", bookSchema);

module.exports = { Book };
