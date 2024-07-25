const mongoose = require('mongoose');
const {Schema} = require('mongoose');
const Community = require('./CommunityModel');

const chatSchema = new mongoose.Schema({
    senderID: String,
    receiverID: String,
    message: String,
    communityID: String,
    timestamp: { type: Date, default: Date.now }
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
