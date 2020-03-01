//how to create schema

//first we need to module name called mongoose
const mongoose = require("mongoose");
const Schema = mongoose.Schema; //it is a property not a method //it helps to create schema its a variable //structure //instance

const ProfileSchema = new Schema({
  photo: {
    type: [""]
  },
  firstname: {
    type: String, // Mongodb datatypes
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phonenumber: {
    type: Number, //Mongodb datatypes
    required: true
  },
  location: {
    type: String,
    required: true
  },
  date: {
    type: Date, //Mongodb datatypes
    default: Date.now
  }
});

//for mamking it available outside use exports
module.exports = mongoose.model("profile", ProfileSchema); //model of the database
