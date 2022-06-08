const { ApolloServer } = require("apollo-server");
const typeDefs = require("./db/schema");
const resolvers = require("./db/resolvers");
const connectDb = require("./config/db");

//schema


//Connect to db
connectDb();

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => {
        const miContext = "Example";
        return {
            miContext
        }
    }
});


server.listen().then( ({ url }) => {
    console.log("Url is ready in", url)
} );

//Query in graphql is Read data (R in CRUD)

//Mutation is for CREATE, UPDATE , DELETE (CUD in CRUD)

//SCHEMA is the data sturcutre

//resolver: functions to ejecute (for example , delete , etc , the names of resolvers should be same of the definitions in the schema)