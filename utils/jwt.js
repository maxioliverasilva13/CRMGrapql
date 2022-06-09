const jwt = require("jsonwebtoken");
require("dotenv").config({ path: '.env' });

const secretToken = process.env.JWT_SECRET;

const generateToken = (user, expiresIn) => {
    const { id, email, nombre, apellido } = user;
    return jwt.sign( { id, email, nombre, apellido }, secretToken, { expiresIn } );
};

const validateJwt = async (token) => {
    const data = await jwt.verify(token, secretToken);
    return data;
};

module.exports = {
  generateToken,
  validateJwt
}