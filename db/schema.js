const { gql } = require("apollo-server");

const typeDefs = gql`
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

  type Query {
      obtenerUsuario(token: String!) : Usuario
  }

  type Mutation {
      newUser(input: UserInput): Usuario
      authUser(input: AuthInput): Token
  } 
`

module.exports = typeDefs;