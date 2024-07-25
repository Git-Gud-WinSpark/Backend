const { MongoNetworkError } = require('mongodb');
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date
        },
        profilePicture: {
            type: String
        },
        preferences: {
            type: [String]
        },
        comminityIDs:{
            type: [String]
        }
    }
)

const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;