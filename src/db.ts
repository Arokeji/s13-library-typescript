import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
console.log("::: Conectando a la BBDD :::");

const DB_CONNECTION = process.env.DB_CONNECTION as string;
const DB_NAME = process.env.DB_NAME as string;

// Configuracion de la conexion
const config = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  dbName: DB_NAME,
};

export const connect = async (): Promise<typeof mongoose | null> => {
  try {
    const database: typeof mongoose = await mongoose.connect(DB_CONNECTION, config);
    const name = database.connection.name;
    const host = database.connection.host;
    console.log(`Conectado a ${name} en ${host}`);

    return database;
  } catch (error) {
    console.error(error);
    console.log("No se ha podido conectar. Se reintentará de nuevo en 5 segundos.");
    setTimeout(connect, 5000);

    return null;
  }
};

module.exports = { connect };
