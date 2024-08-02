const express = require('express');
const router = express.Router();
const Community = require('../model/CommunityModel'); // Adjust the path as needed
const ChatModel = require('../model/ChatsModel');
const jwt = require('jsonwebtoken');
const SECRET_KEY = "Git-Gud";
const UserModel = require('../model/UserModel');
const P2PChatModel = require('../model/P2PChatModel');
const decryptJWTToken = require('../controller/decryptToken');

router.post('/createCommunity', async (req, res) => {
    var communityID;
    try {
        const newCommunity = new Community({
            communityName: req.body.communityName,
            profilePicture: req.body.profilePicture,
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

        return res.status(200).json({
            status: "Success",
            message: "Community created and added in user collection",
            communityID: communityID
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
        const length = Channel.channels.length;

        return res.status(200).json({
            status: "Success",
            message: "Created Channel",
            channelID: Channel.channels[length - 1]._id
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
        const chats = await ChatModel.find({ receiverID: req.body.receiverID }); // receiverID is channel id
       const newChats=await ChatModel.aggregate([{
        $match:{
            receiverID: req.body.receiverID,
        }
    }, 
    {
        $addFields: {
          senderID: { $toObjectId: "$senderID" }
        }
      },
     {
        $lookup: {
          from: "users",
          localField: "senderID",
          foreignField: "_id",
          as: "joinedData"
        }
      },
       ]);
       const encryptedChats = newChats.map((chat) => {
        const senderID = chat.senderID.toString();
        console.log(senderID);
        const token = jwt.sign(senderID,SECRET_KEY);
        return { ...chat, senderID: token };
      });
    //    console.log(newChats,"---------");
        // const senderName= await UserModel.find({_id});
        return res.status(200).json({
            status: "Success",
            chat: encryptedChats
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
            Channels: Channels,
            profilePicture: community.profilePicture
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
        const allCommunities = await Community.find({}, ['_id', 'communityName', 'tag', 'profilePicture']);
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
            message: "Chat saved",
            token: req.body.token
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
            {
                $group: {
                    _id: [
                        "$senderID",
                        "$receiverID"]
                },
            }
        ]);
        // console.log(allConversations);
        const conversationsDuplicates = [];

        allConversations.map(element => {
            if (element._id[0] !== userID) {
                conversationsDuplicates.push(element._id[0]);
            }
            else {
                if (!conversationsDuplicates.includes(element._id[1].toString())) {
                    conversationsDuplicates.push(element._id[1]);
                }
            }
        })

        const ReceiverNames = [];

        const conversations = [...new Set(conversationsDuplicates)];

        const promises = conversations.map(async (element) => {
            const name = await UserModel.findById(element, ['username', 'profilePicture']);
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
        }).sort({ timestamp: 1 });

        const promises = chats.map(async(chat) => {
            const token = await jwt.sign(chat.senderID, SECRET_KEY);
            chat.senderID = token;
        });

        await Promise.all(promises);

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
        const User = await UserModel.findById(await decryptJWTToken(req.body.userID));

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

router.post('/getUser', async (req, res) => {
    try {
        const User = await UserModel.find({
            username: { $regex: req.body.userName, $options: 'i' }
        });

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