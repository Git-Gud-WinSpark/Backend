const mongoose = require('mongoose');
const {Schema} = require('mongoose');


const p2pChatSchema = new mongoose.Schema({
    senderID: String,
    receiverID: String,
    message: String,   
    timestamp: { type: Date, default: Date.now }
});

const P2PChat = mongoose.model('P2PChat', p2pChatSchema);

module.exports = P2PChat;
