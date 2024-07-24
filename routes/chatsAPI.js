const express = require('express');
const router = express.Router();
const Community = require('../model/CommunityModel'); // Adjust the path as needed
const ChatModel = require('../model/ChatsModel');
const jwt = require('jsonwebtoken');
const SECRET_KEY = "Git-Gud";
const UserModel = require('../model/UserModel');


router.post('/createCommunity', async (req, res) => {
    try {
        await Community.create({
            communityName: req.body.communityName
        });

        return res.status(200).json({
            status: "Success",
            message: "Created Community"
        })
    }
    catch (e) {
        return res.status(500).json({
            status: "failed",
            message: e.message
        })
    }
});


router.post('/createChannel', async (req, res) => {
    try {
        await Community.findOneAndUpdate(
            { _id: req.body.communityID }, // Filter
            {
                $push: {
                    channels: {
                        channelName: req.body.channelName
                    }
                }
            }, // Update
            { new: true } // Options: return the updated document
        );

        return res.status(200).json({
            status: "Success",
            message: "Created Channel"
        })
    }
    catch (e) {
        return res.status(500).json({
            status: "failed",
            message: e.message
        })
    }
});

router.post('/chat', async (req, res) => {
    try {
        var userID;
        await jwt.verify(req.body.token, SECRET_KEY, function (err, payload) {
            if (err) {
                return res.status(404).json({
                    status: "failed",
                    message: err.message
                })
            }
            userID = payload;
        });

        await ChatModel.create({
            senderID: userID,
            receiverID: req.body.receiverID,
            communityID: req.body.communityID,
            message: req.body.message
        });
    }
    catch (e) {
        return res.status(500).json({
            status: "failed",
            message: e.message
        })
    }
    return res.status(200).json({
        status: "Success",
        message: "Chat Updated"
    })
});


router.post('/getChannels', async (req, res) => {
    try {
        const community = await Community.findById(req.body.communityID);
        const Channels = [];
        community.channels.forEach(element => {
            Channels.push(element.channelName);
        });
        return res.status(200).json({
            status: "Success",
            CommunityName: community.communityName,
            Channels: Channels
        })
    }
    catch (e) {
        return res.status(500).json({
            status: "failed",
            message: e.message
        })
    }
})

router.post('/getChats', async (req, res) => {
    try {
        const chats = await ChatModel.find({receiverID: req.body.receiverID});
        
        return res.status(200).json({
            status: "Success",
            chat: chats
        })
    }
    catch (e) {
        return res.status(500).json({
            status: "failed",
            message: e.message
        })
    }
})


router.post('/addCommunity', async (req, res) => {
    try {
        var userID;
        await jwt.verify(req.body.token, SECRET_KEY, function (err, payload) {
            if (err) {
                throw Error('Token problem');
            }
            userID = payload;
        });

        await UserModel.findOneAndUpdate(
            { _id: userID }, // Filter
            { $push: { comminityIDs: req.body.communityID } }, // Update
            { new: true } // Options: return the updated document
        );

        return res.status(200).json({
            status: "Success"
        })
    }
    catch (e) {
        return res.status(500).json({
            status: "failed",
            message: e.message
        })
    }
})



module.exports = router;