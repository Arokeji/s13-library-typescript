const { Author } = require("../models/Author.js");
const { verifyToken } = require("../utils/token.js");

const isAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "1No estas autorizado a realizar esta operacion" });
    }

    // Verificamos y decodificamos el token
    const decodedInfo = verifyToken(token);
    const authorFound = await Author.findOne({ user: decodedInfo.authorUser }).select("+password");
    if (!authorFound) {
      throw new Error({ error: "2No estas autorizado a realizar esta operacion" });
    }

    if (!authorFound) {
      return res.status(401).json({ error: "3No estas autorizado a realizar esta operacion" });
    } else {
      console.log("Usuario encontrado por el middleware");
    }

    req.author = authorFound;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { isAuth };
