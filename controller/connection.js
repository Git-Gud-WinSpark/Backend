const mongoose = require('mongoose');
const User = require('../model/UserModel')

async function connectMongo() {
    await mongoose.connect('mongodb://127.0.0.1:27017/Git-Gud');
}

connectMongo().then(() => {
    console.log('Connected');
    return User.init()
}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
});

module.exports = connectMongo;