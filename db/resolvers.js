
const Usuario = require("../models/Usuarios");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: '.env' });

const secretToken = process.env.JWT_SECRET;

const generateToken = (user, secret, expiresIn) => {
    console.log(user);
    const { id, email, nombre, apellido } = user;
    return jwt.sign( { id, email, nombre, apellido }, secret, { expiresIn } );
}

const resolvers = {
  Query: {
    obtenerUsuario: async (_ , { token }) => {
        const userId = await jwt.verify(token, secretToken);
        return userId;
    }
  },
  Mutation: {
    newUser: async (_, { input }) => {
        const { email, password } = input;
        //check if user is register
        const userExist = await Usuario.findOne({ email });
        if (userExist) {
            throw new Error("Usuario ya registrado con el mismo email");
        }
        //hash password

        const salt = await bcryptjs.genSalt(10);
        input.password = await bcryptjs.hash(password, salt);
        console.log("input password new is", input.password);

        //Save in Db
        try {
            const usuario = new Usuario(input);
            usuario.save();
            console.log("LO guardo...");
            return usuario;
        } catch (error) {
            console.log("Error");
        }

        return "Creando...";
    },
    authUser: async (_, { input }) => {
        // if the user exists
        const { email, password } = input;
        const userExist = await Usuario.findOne({ email });
        if (!userExist) {
            throw new Error("The email is not valid");
        }

        //validate if the user password is valid
        const passwordCorrect = await bcryptjs.compare(password, userExist.password);
        if (!passwordCorrect) {
            throw new Error("The password is not valid");
        }

        return {
            token: generateToken(userExist, secretToken, "24H")
        };
    }
  }
}

module.exports = resolvers;
