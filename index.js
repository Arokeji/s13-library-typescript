const { bookRoutes } = require("./routes/book.routes.js");
const { authorRoutes } = require("./routes/author.routes.js");
const { fileUploadRouter } = require("./routes/file-upload.routes.js");

const express = require("express");
const cors = require("cors");

const corsWhiteList = ["http://localhost:3000", "http://localhost:3001", "https://s7validationcors.vercel.app"];

// const corsWhiteList = "*";

// La intencion del main es que sea una funcion async para poder hacer await en connect
// para el despliegue en Vercel
const main = async () => {
  // Conexion a la BBDD
  const { connect } = require("./db.js");
  const database = await connect();

  // Configuracion del servidor
  const PORT = 3000;
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cors({ origin: corsWhiteList }));

  // Rutas
  const router = express.Router();
  router.get("/", (req, res) => {
    res.send(`Library API en entorno ${database.connection.name}`);
  });
  router.get("*", (req, res) => {
    res.status(404).send("La pagina solicitada no existe");
  });

  // Middlewares de aplicación
  app.use((req, res, next) => {
    const date = new Date();
    console.log(`Petición de tipo ${req.method} a la url ${req.originalUrl} el ${date}`);
    next();
  });

  // Middleware que afecta solo a /book/*
  app.use("/book", (req, res, next) => {
    console.log("Se ha solicitado la url de books.");
    next();
  });

  // Uso del router
  app.use("/book", bookRoutes);
  app.use("/author", authorRoutes);
  app.use("/public", express.static("public"));
  app.use("/file-upload", fileUploadRouter);
  app.use("/", router);

  // Middleware para la gestion de errores
  app.use((err, req, res, next) => {
    console.log("*** ERROR ***");
    console.log(`Peticion fallida: ${req.method} a la url ${req.originalUrl}`);
    console.log(err);

    if (err?.name === "ValidationError") {
      res.status(400).json(err);
    } else if (err?.code === 11000) {
      console.log("Usuario duplicado");
      res.status(400).json({ error: err.errmsg });
    } else {
      res.status(500).json(err);
    }

    console.log("*** FIN DE ERROR ***");

    console.error(err);
    res.status(500).send(err.stack);
  });

  // Ejecución del servidor
  app.listen(PORT, () => {
    console.log(`Servidor funcionando en puerto ${PORT}`);
  });
};

main();
