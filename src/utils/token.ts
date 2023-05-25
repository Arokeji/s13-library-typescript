// Importamos libreria JWT
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
// Traemos la libreria dotenv para luego usar el token JWT_SECRET
dotenv.config();

export const generateToken = (id: string, user: string): string => {
  if (!user || !id) {
    throw new Error("User or Id is missing");
  }

  const payload = {
    userId: id,
    authorUser: user,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "1d" });

  return token;
};

export const verifyToken = (token: string): any => {
  if (!token) {
    throw new Error("Token is missing.");
  }

  const result = jwt.verify(token, process.env.JWT_SECRET as string);
  return result;
};
