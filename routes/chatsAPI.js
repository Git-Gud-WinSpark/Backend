const express = require('express');
const router = express.Router();
const Community = require('../model/CommunityModel'); // Adjust the path as needed
const ChatModel = require('../model/ChatsModel');
const jwt = require('jsonwebtoken');
const SECRET_KEY = "Git-Gud";
const UserModel = require('../model/UserModel');


router.post('/createCommunity', async (req, res) => {
    var comminityID;
    try {
        const newCommunity = new Community({ 
            communityName: req.body.communityName,
            tag: req.body.tags 
        });
        
        await newCommunity.save();  // Await the promise to ensure it resolves before sending a response
        comminityID = newCommunity._id;
    } catch (err) {
        // Check for duplicate key error (MongoDB error code for duplicate keys is 11000)
        if (err.code === 11000) {
            return res.status(400).json({
                status: "failed",
                message: "Duplicate community name"
            });
        }
    }

    try {
        var userID;
        await jwt.verify(req.body.token, SECRET_KEY, function (err, payload) {
            if (err) {
                throw Error('Token problem');
            }
            userID = payload;
        });
        comminityID = comminityID.toHexString();
        await UserModel.findOneAndUpdate(
            { _id: userID }, // Filter
            { $push: { comminityIDs: comminityID } }, // Update
            { new: true } // Options: return the updated document
        );
        return res.status(200).json({
            status: "Success",
            message: "Community created and added in user collection",
            communityID: comminityID
        })
    }
    catch (err) {
        return res.status(500).json({
            status: "failed",
            message: err.message
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
        const chats = await ChatModel.find({ receiverID: req.body.receiverID });

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


router.get('/listAllCommunity', async (req, res) => {
    try {
        const allCommunities = await Community.find({}, ['_id', 'communityName', 'tag']);
        return res.status(200).json({
            status: "Success",
            ListofAllCommunities: allCommunities
        })
    }
    catch (e) {
        return res.status(500).json({
            status: "failed",
            message: e.message
        })
    }
})

router.post('/listUserCommunity', async (req, res) => {
    try {
        var userID;
        await jwt.verify(req.body.token, SECRET_KEY, function (err, payload) {
            if (err) {
                throw Error('Token problem');
            }
            userID = payload;
        });
        const userData = await UserModel.findById(userID);
        const userCommunities = [];
        const promises = userData.comminityIDs.map(async (commID) => {
            const comm = await Community.findById(commID);
            userCommunities.push(comm);
        });
        await Promise.all(promises);

        return res.status(200).json({
            status: "Success",
            CommunitiesJoinedByUser: userCommunities
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