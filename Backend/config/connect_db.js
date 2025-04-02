const mongoose = require("mongoose");
require("dotenv").config();
const {createAdmin} = require("../services/adminServices")
async function connect(){
    try {
        await mongoose.connect(process.env.MONGODB_CONNECT);
        console.log("Connect DB Success");
        await createAdmin();
    } catch (error) {
        console.log("Connect DB Fail")
    }
}

module.exports = connect;