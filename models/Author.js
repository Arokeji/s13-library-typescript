const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const validCountries = ["COLOMBIA", "ENGLAND", "RUSSIA", "UNITED STATES", "ARGENTINA", "CZECHOSLOVAKIA", "JAPAN", "NIGERIA"];

// Creacion del esquema del autor
const authorSchema = new Schema({
  user: {
    type: String,
    trim: true,
    unique: true,
    required: true,
    validate: {
      validator: validator.isEmail,
      message: "El usuario debe ser un email.",
    },
  },
  password: {
    type: String,
    trim: true,
    minLength: [8, "La contraseña debe contener un minimo de 8 caracteres"],
    select: false, // Indica que no se muestra en las consultas
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minLength: [3, "No se ha alcanzado el minimo de caracteres"],
    maxLength: [50, "Se ha superado el maximo de caracteres"],
  },
  country: {
    type: String,
    required: false,
    trim: true,
    uppercase: true,
    enum: validCountries,
  },
  books: {
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
    },
  },
});

// Encriptado de la contraseña antes de que guarde
// Usamos function en vez de una arrow para que pueda leer el this fuera de esta
authorSchema.pre("save", async function (next) {
  try {
    // Si la contraseña ya estaba encriptada no la encripta de nuevo
    if (this.isModified("password")) {
      const saltRounds = 10; // Dureza del ecriptado
      const hash = await bcrypt.hash(this.password, saltRounds);
      this.password = hash;
    }
  } catch (error) {
    next(error);
  }
});

// Creacion del modelo en si con un nombre y la configuracion del esquema
const Author = mongoose.model("Author", authorSchema);

module.exports = { Author };
