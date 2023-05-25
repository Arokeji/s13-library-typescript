import cors from "cors";
import express from "express";
import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { connect } from "./db";

import { bookRoutes } from "./routes/book.routes";
import { authorRoutes } from "./routes/author.routes";
// const { fileUploadRouter } = require("./routes/file-upload.routes.js");

const corsWhiteList = ["http://localhost:3000", "http://localhost:3001", "https://s7validationcors.vercel.app"];

// const corsWhiteList = "*";

// La intencion del main es que sea una funcion async para poder hacer await en connect
// para el despliegue en Vercel
const main = async (): Promise<void> => {
  // Conexion a la BBDD
  const database = await connect();

  // Configuracion del servidor
  const PORT = 3000;
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cors({ origin: corsWhiteList }));

  // Rutas
  const router = express.Router();
  router.get("/", (req: Request, res: Response) => {
    res.send(`Library API Typescript en entorno ${database?.connection?.name as string}`);
  });
  router.get("*", (req: Request, res: Response) => {
    res.status(404).send("La pagina solicitada no existe");
  });

  // Middlewares de aplicación
  app.use((req: Request, res: Response, next: NextFunction) => {
    const date = new Date();
    console.log(`Petición de tipo ${req.method} a la url ${req.originalUrl} el ${date.toString()}`);
    next();
  });

  // Uso del router
  app.use("/book", bookRoutes);
  app.use("/author", authorRoutes);
  app.use("/public", express.static("public"));
  // app.use("/file-upload", fileUploadRouter);
  app.use("/", router);

  // Middleware para la gestion de errores
  app.use((err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {
    console.log("*** ERROR ***");
    console.log(`Peticion fallida: ${req.method} a la url ${req.originalUrl}`);
    console.log(err);

    // Es un apaño para que el error pueda acceder a sus propiedades
    const errorAsAny: any = err as unknown as any;

    if (err?.name === "ValidationError") {
      res.status(400).json(err);
    } else if (errorAsAny?.code === 11000) {
      console.log("Usuario duplicado");
      res.status(400).json({ error: errorAsAny.errmsg });
    } else {
      res.status(500).json(err);
    }

    console.log("*** FIN DE ERROR ***");

    console.error(err);
    res.status(500).send(errorAsAny.stack);
  });

  // Ejecución del servidor
  app.listen(PORT, () => {
    console.log(`Servidor funcionando en puerto ${PORT}`);
  });
};

void main();
