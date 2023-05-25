// Importamos libreria JWT
const jwt = require("jsonwebtoken");
// Traemos la libreria dotenv para luego usar el token JWT_SECRET
require("dotenv").config();

const generateToken = (id, user, next) => {
  try {
    if (!user || !id) {
      throw new Error("User or Id is missing");
    }

    const payload = {
      userId: id,
      authorUser: user,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

    return token;
  } catch (error) {
    next(error);
  }
};

const verifyToken = (token) => {
  if (!token) {
    throw new Error("Token is missing.");
  }

  const result = jwt.verify(token, process.env.JWT_SECRET);
  return result;
};

module.exports = { generateToken, verifyToken };
