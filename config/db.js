const mongoose = require("mongoose");
require("dotenv").config({path: ".env"});

const connectDb = async () => {
    try {
      await mongoose.connect(process.env.DB_MONGO)
      console.log("Db connected")
    } catch (error) {
        console.log("Has error");
        console.log(error);
        process.exit(1);
    }
}

module.exports = connectDb;