
const Usuario = require("../models/Usuarios");
const Producto = require("../models/Producto");
const Cliente = require("../models/Cliente");
const Pedido = require("../models/Pedido");
const bcryptjs = require("bcryptjs");
const { generateToken, validateJwt } = require("../utils/jwt");

const resolvers = {
  Query: {
    obtenerUsuario: async (_ , { token }) => {
        const userId = await validateJwt(token);
        return userId;
    },
    obtenerProductos: async () => {
        try {
            const productos = await Producto.find({});
            return productos;
        } catch (error) {
            console.log(error);
        }
    },
    obtenerProducto: async (_, { id }) => {
        try {
          const producto = await Producto.findById(id);
          if(!producto) {
              throw new Error("Producto no encontrado")
          }
          return producto;
        } catch (error) {
          console.log(error);
        }
    },
    buscarProducto: async (_, { texto }) => {
        const productos = await Producto.find({$text: { $search: texto }}).limit(10);
        return productos;
    },
    getClientes: async () => {
        try {
            const clientes = await Cliente.find();
            return clientes;
        } catch (error) {
            console.log(error);
        }
    },
    getClientesVendedor: async (_, { }, ctx) => {
        try {
            const { usuario: loggUser } = ctx;
            const clientes = await Cliente.find({ vendedor: loggUser?.id });
            return clientes;
        } catch (error) {
            console.log(error);
        }
    },
    obtenerCliente: async (_ , { id }, ctx ) => {
        const { usuario: loggUser } = ctx;
        const cliente = await Cliente.findById(id);
        if (!cliente || cliente?.vendedor.toString() != loggUser?.id.toString()) {
            throw new Error("No se encontro el cliente");
        }
        return cliente;
    },
    obtenerPedidos: async () => {
        try {
            const pedidos = await Pedido.find({});
            return pedidos;
        } catch (error) {
            console.log("ERROR");
            console.log(error);
        }
    },
    obtenerPedidoPorVendedor: async (_ , { }, ctx ) => {
        try {
            const { usuario: loggUser } = ctx; 
            const pedidos = await Pedido.find({ vendedor: loggUser?.id });
            return pedidos;
        } catch (error) {
            console.log("ERROR");
            console.log(error);
        }
    },
    obtenerPedido: async (_ , { id }, ctx ) => {
        const { usuario: loggUser } = ctx; 
        
        const pedido = await Pedido.findById(id);

        if (!pedido) {
            throw new Error("El pedido no existe");
        }

        if (pedido?.vendedor.toString() !== loggUser?.id.toString()) {
           throw new Error("Credenciales invalidas");
        }

        return pedido;
    },
    obtenerPedidoEstado: async (_ , { estado } , ctx) => {
        try {
          const { usuario:loggUser } = ctx;
          const pedidos = await Pedido.find({ vendedor: loggUser?.id, estado });
          return pedidos;
        } catch (error) {
          console.log(error);
          console.log(error);
        }

    },
    mejoresClientes: async (_ , { }, ctx) => {
        const clientes = await Pedido.aggregate([
            { $match: { estado: "COMPLETADO" } },
            { $group : { _id: "$cliente", total: { $sum: "$total" } } },
            { $lookup: { from: "clientes", localField: "_id", foreignField: "_id", as: "cliente" } },
            { $sort: { total : - 1 } },
            { $limit: 10 }
        ]);
        return clientes;
    },
    mejoresVendedores: async (_ , { }, ctx) => {
        const vendedores = await Pedido.aggregate([
            { $match: { estado: "COMPLETADO" } },
            { $group : { _id: "$vendedor", total: { $sum: "$total" } } },
            { $lookup: { from: "usuarios", localField: "_id", foreignField: "_id", as: "vendedor" } },
            { $sort: { total : - 1 } },
            { $limit: 3 }
        ]);
        return vendedores;
    },
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
            token: generateToken(userExist, "24H")
        };
    },
    newProduct: async (_, { input }) => {
        try {
            const producto = new Producto(input);
            const result = await producto.save();
            return result;
        } catch (error) {
            console.log(error);
        }
    },
    updateProducts: async (_, { input, id }) => {
        const existProduct = await Producto.findById(id);
        if (!existProduct) {
            throw new Error("Este producto no existe");
        };

        //new:true is for return the new data with the new info
        const producto = await existProduct.findOneAndUpdate({ _id: id }, input, {
            new: true,
        });
        return producto;
    },
    deleteProduct: async (_, { id }) => {
        let existProduct = Producto.findById(id);
        const tempProd = await existProduct;
        if (!tempProd) {
            throw new Error("Este producto no existe");
        };
        await existProduct.findOneAndDelete({ _id: id });
        return "Producto Eliminado";
    },
    newClient: async (_, { input }, ctx) => {
        //Validar si cliente existe
        const { usuario: loggUser } = ctx;
        const { email } = input;

        const cliente = await Cliente.findOne({ email });

        if (cliente){
            throw new Error("Este cliente ya existe");
        }
        const nuevoCliente = new Cliente(input);
        nuevoCliente.vendedor = loggUser?.id;
        
        try {
           const result = await nuevoCliente.save();
           return result;
        } catch (error) {
            console.log(error);
        }
        
    },
    updateClient: async (_ , { id, input }, ctx ) => {
        const { usuario: loggUser } = ctx;
        const cliente = await Cliente.findById(id);
        if (!cliente || cliente?.vendedor.toString() != loggUser?.id.toString()) {
            throw new Error("No se encontro el cliente");
        }
        const updatedClient = await Cliente.findOneAndUpdate({ _id: id }, input, {
            new: true,
        });
        return updatedClient;
    },
    deleteClient: async (_, { id }, ctx) => {
        const { usuario: loggUser } = ctx;
        const cliente = await Cliente.findById(id);
        if (!cliente || cliente?.vendedor.toString() != loggUser?.id.toString()) {
            throw new Error("No se encontro el cliente");
        }
        await Cliente.findOneAndDelete({ _id: id });
        return "Cliente Eliminado";
    },
    nuevoPedido: async (_, { input  }, ctx) => {
        const { cliente } = input;
        //validate if client exists
        let client = await Cliente.findById(cliente);
        if (!client) {
            throw new Error("Este cliente no existe");
        };

        //validate if the client is of the seller
        const { usuario: loggUser } = ctx;
        if (client?.vendedor.toString() !== loggUser?.id.toString()) {
            throw new Error("No tienes credenciales");
        }

        //stock is avaiable
        const pedido = input.pedido;

        for await (const articulo of pedido) {
            const { id } = articulo;
            const producto = await Producto.findById(id);
            if(articulo?.cantidad > producto?.stock) {
                throw new Error(`El producto ${ producto?.nombre } excelde la cantidad de stock`)
            } else {
                producto.stock = producto.stock - articulo.cantidad;
                await producto.save();
            }
        }

        //crear nuevo pedido
        const newPedido = new Pedido(input);

        //asignar un vendedor

        newPedido.vendedor = loggUser?.id;

        //save in the DB

        const resultado = await newPedido.save();
        return resultado;
    },
    updatepedido: async (_, { id, input }, ctx) => {
        const existPedido = await Pedido.findById(id);
        if (!existPedido) {
            throw new Error("Este pedido no existe");
        };

        const { cliente } = input;
        //validate if client exists
        let client = await Cliente.findById(cliente);
        if (!client) {
            throw new Error("Este cliente no existe");
        };

        //validate if the client is of the seller
        const { usuario: loggUser } = ctx;
        if (client?.vendedor.toString() !== loggUser?.id.toString()) {
            throw new Error("No tienes credenciales");
        }

        //stock is avaiable
        const reqpedido = input?.pedido;

        if (reqpedido) {
            for await (const articulo of reqpedido) {
                const { id } = articulo;
                const producto = await Producto.findById(id);
                if(articulo?.cantidad > producto?.stock) {
                    throw new Error(`El producto ${ producto?.nombre } excelde la cantidad de stock`)
                } else {
                    producto.stock = producto.stock - articulo.cantidad;
                    await producto.save();
                }
            }
        }

        //save in the DB
        const resultado = await Pedido.findOneAndUpdate({ _id: id }, input, {
            new: true,
        });
        return resultado;
    },
    deletePedido: async (_, { id }, ctx) => {
        const existPedido = await Pedido.findById(id);
        if (!existPedido) {
            throw new Error("Este pedido no existe");
        };

        //validate if the client is of the seller
        const { usuario: loggUser } = ctx;
        if (existPedido?.vendedor.toString() !== loggUser?.id.toString()) {
            throw new Error("No tienes credenciales");
        }

        //stock is avaiable
        await Pedido.findOneAndDelete({ _id: id });
        return "Eliminado Correctamente";
    }
  }
}

module.exports = resolvers;
