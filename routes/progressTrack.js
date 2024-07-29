const express = require('express');
const router = express.Router();
const UserModel = require('../model/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;
const SECRET_KEY = "Git-Gud";
const ProgressModel = require('../model/ProgressModel');
const decryptJWTToken = require('../controller/decryptToken');


router.post('/', async (req, res) => {
    try {
        const userID = await decryptJWTToken(req.body.token);

        const Data = await ProgressModel.create({
            userID: userID,
            communityID: req.body.communityID,
            channelID: req.body.channelID,
            liveTask: req.body.liveTask
        })

        return res.status(200).json({
            status: "Success",
            message: "Progress"
        })
    }
    catch (e) {
        return res.status(500).json({
            status: "failed",
            message: e.message
        })
    }
});

router.post('/getLiveTask', async (req, res) => {
    try {
        const userID = await decryptJWTToken(req.body.token);

        const LiveTaskList = await ProgressModel.find(
            {
                $and: [
                    {userID: userID},
                    {communityID: req.body.communityID},
                    {channelID: req.body.channelID}
                ]
            }, 
            ['liveTask.name', 'liveTask._id']
        );

        return res.status(200).json({
            status: "Success",
            message: "Progress",
            LiveTasks: LiveTaskList
        })
    }
    catch (e) {
        return res.status(500).json({
            status: "failed",
            message: e.message
        })
    }
});

router.post('/getSubtask', async (req, res) => {
    try {
        const userID = await decryptJWTToken(req.body.token);

        const LiveTaskList = await ProgressModel.find(
            {
                $and: [
                    {userID: userID},
                    {communityID: req.body.communityID},
                    {channelID: req.body.channelID}
                ]
            },
            ['liveTask']
        );

        // console.log(LiveTaskList[0].liveTask);
        // LiveTaskArray
        var subtaskList = [];
        
        LiveTaskList[0].liveTask.forEach(element => {
            if(element._id == req.body.liveTaskID)
            {
                element.subtask.forEach(subtask=>{
                    subtaskList.push(subtask);
                })
            }
        });;
        return res.status(200).json({
            status: "Success",
            subTask: subtaskList
        })
        
    }
    catch (e) {
        return res.status(500).json({
            status: "failed",
            message: e.message
        })
    }
});

module.exports = router;