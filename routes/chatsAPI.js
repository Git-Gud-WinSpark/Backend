const express = require('express');
const router = express.Router();
const Community = require('../model/CommunityModel'); // Adjust the path as needed
const ChatModel = require('../model/ChatsModel');
const jwt = require('jsonwebtoken');
const SECRET_KEY = "Git-Gud";
const UserModel = require('../model/UserModel');
const P2PChatModel = require('../model/P2PChatModel');

router.post('/createCommunity', async (req, res) => {
    var communityID;
    try {
        const newCommunity = new Community({
            communityName: req.body.communityName,
            tag: req.body.tags
        });

        await newCommunity.save();  // Await the promise to ensure it resolves before sending a response
        communityID = newCommunity._id;
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
        communityID = communityID.toHexString();
        await UserModel.findOneAndUpdate(
            { _id: userID }, // Filter
            { $push: { communityIDs: communityID } }, // Update
            { new: true } // Options: return the updated document
        );
        const allCommunities = await Community.find({}, ['_id', 'communityName', 'tag']);
        
        return res.status(200).json({
            status: "Success",
            message: "Community created and added in user collection",
            communityID: communityID,
            ListofAllCommunities: allCommunities
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
        const Channel = await Community.findOneAndUpdate(
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
            message: "Created Channel",
            channelID: Channel._id
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
            { $push: { communityIDs: req.body.communityID } }, // Update
            { new: true } // Options: return the updated document
        );

        const community = await Community.findById(req.body.communityID);
        const Channels = [];
        community.channels.forEach(element => {
            Channels.push(element);
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
        const promises = userData.communityIDs.map(async (commID) => {
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


router.post('/p2pChat', async (req, res) => {
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

        await P2PChatModel.create({
            senderID: userID,
            receiverID: req.body.receiverID,
            message: req.body.message
        });

        return res.status(200).json({
            status: "Success",
            message: "Chat saved"
        })
    }
    catch (e) {
        return res.status(500).json({
            status: "failed",
            message: e.message
        })
    }
});

router.post('/listP2PConversations', async (req, res) => {
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

        const allConversations = await P2PChatModel.aggregate([
            {
                $match: {
                    $or: [
                        { receiverID: userID },
                        { senderID: userID }
                    ]
                }
            },
            { $group: { _id: "$senderID" } },
        ]);

        const conversations = [];

        allConversations.forEach(element => {
            if (element._id != userID) {
                conversations.push(element);
            }
        })
        const ReceiverNames = [];
        const promises = conversations.map(async (element) => {
            const name = await UserModel.findById(element._id, ['username', 'profilePicture']);
            ReceiverNames.push(name);
        })

        await Promise.all(promises);

        return res.status(200).json({
            status: "Success",
            message: "Chat saved",
            conversation: ReceiverNames
        })
    }
    catch (e) {
        return res.status(500).json({
            status: "failed",
            message: e.message
        })
    }
});

router.post('/getP2PChats', async (req, res) => {

    var userID;
    try {
        const payload = await jwt.verify(req.body.token, SECRET_KEY);
        userID = payload;
    } catch (err) {
        return res.status(404).json({
            status: "failed",
            message: err.message
        });
    }

    try {
        const chats = await P2PChatModel.find({
            $or: [
                { $and: [{ senderID: userID }, { receiverID: req.body.receiverID }] },
                { $and: [{ senderID: req.body.receiverID }, { receiverID: userID }] }
            ]
        }).sort({ timestamp: 1 });;

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


router.post('/fetchUser', async (req, res) => {
    try {        
        const User = await UserModel.findById(req.body.userID);

        return res.status(200).json({
            status: "Success",
            UserDetails: User
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