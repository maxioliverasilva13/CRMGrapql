const { gql } = require("apollo-server");

const typeDefs = gql`
  # Types ----------------------
  type Usuario {
    id: ID
    nombre: String
    apellido: String
    email: String
    created_at: String 
  }

  type Token {
      token: String
  }

  type Producto {
    id: ID
    nombre: String
    stock: Int
    precio: Float
    created_at: String
  }

  type Cliente {
    id: ID
    nombre: String
    apellido: String
    empresa: String
    email: String
    telefono: String
    vendedor: ID
  }

  type Pedido {
    id: ID
    pedido: [PedidoGrupo]
    total: Float
    cliente: ID
    vendedor: ID
    estado: EstadoPedido
    created_at: String
  }

  type PedidoGrupo {
    id: ID
    cantidad: Int
  }

  type TopCliente {
    total: Float
    cliente: [Cliente]
  }

  type TopVendedor {
    total: Float
    vendedor: [Usuario]
  }

  # Input ----------------------
  input UserInput {
    nombre: String!
    apellido: String!
    email: String!
    password: String!
  }

  input AuthInput {
      email: String!
      password: String!
  }

  input ProductoInput {
      nombre: String!
      stock: Int!
      precio: Float!
  }

  input ClienteInput {
      nombre: String!
      apellido: String!
      empresa: String!
      email: String!
      telefono: String
  }

  input PedidoProductoInput {
    id: ID
    cantidad: Int
  }

  input PedidoInput {
    pedido: [PedidoProductoInput]
    total: Float!
    cliente: ID!
    estado: EstadoPedido
  }

  input PedidoUpdateInput {
    pedido: [PedidoProductoInput]
    total: Float
    cliente: ID
    estado: EstadoPedido
  }

  enum EstadoPedido {
    PENDIENTE
    COMPLETADO
    CANCELADO
  }

  # Query ----------------------
  type Query {
      # Usuario
      obtenerUsuario(token: String!) : Usuario

      # Producto
      obtenerProductos : [Producto]
      obtenerProducto(id: ID!) : Producto
      buscarProducto(texto: String) : [Producto]

      # Cliente
      getClientes : [Cliente]
      getClientesVendedor : [Cliente]
      obtenerCliente(id: ID!) : Cliente

      # Pedido
      obtenerPedidos: [Pedido]
      obtenerPedidoPorVendedor: [Pedido]
      obtenerPedido(id: ID!): Pedido
      obtenerPedidoEstado(estado: EstadoPedido!) : [Pedido]

      # Busquedas Avanzadas
      mejoresClientes: [TopCliente]
      mejoresVendedores: [TopVendedor]
  }

  # Mutation ----------------------

  type Mutation {
      # Users
      newUser(input: UserInput): Usuario
      authUser(input: AuthInput): Token

      # Products
      newProduct(input: ProductoInput) : Producto
      updateProducts(id: ID!, input: ProductoInput) : Producto
      deleteProduct(id: ID!) : String

      # Cliente
      newClient(input: ClienteInput) : Cliente
      updateClient(id: ID!, input: ClienteInput): Cliente
      deleteClient(id: ID!) : String

      # Pedido
      nuevoPedido(input: PedidoInput) : Pedido
      updatepedido(id: ID!, input: PedidoUpdateInput): Pedido
      deletePedido(id: ID!) : String
  }
`

module.exports = typeDefs;