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
                    { userID: userID },
                    { communityID: req.body.communityID },
                    { channelID: req.body.channelID }
                ]
            },
            ['liveTask.name', 'liveTask._id', 'liveTask.subtask']
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
                    { userID: userID },
                    { communityID: req.body.communityID },
                    { channelID: req.body.channelID }
                ]
            },
            ['liveTask']
        );

        // console.log(LiveTaskList[0].liveTask);
        // LiveTaskArray
        var subtaskList = [];

        LiveTaskList[0].liveTask.forEach(element => {
            if (element._id == req.body.liveTaskID) {
                element.subtask.forEach(subtask => {
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

router.post('/completeTask', async (req, res) => {
    try {
        const userID = await decryptJWTToken(req.body.token);

        const result = await ProgressModel.findOne(
            {
                userID: userID,
                communityID: req.body.communityID,
                channelID: req.body.channelID,
                'liveTask._id': req.body.liveTaskID
            }
        );
        var flag = false;

        result.liveTask.forEach(element => {
            if (element._id == req.body.liveTaskID) {
                var isLiveTaskCompleted = 0;
                for (let i = 0; i < element.subtask.length; i++) {
                    if (element.subtask[i]._id == req.body.subtaskID) {
                        element.subtask[i].status = true;
                        flag = true;
                    }
                    if (element.subtask[element.subtask.length - 1].status == true) {
                        element.status = true;
                    }
                }
            }
        });



        await result.save();
        if (flag == true) {
            return res.status(200).json({
                status: "Success"
            })
        }
        else {
            throw Error("Record not updated");
        }

    }
    catch (e) {
        return res.status(500).json({
            status: "failed",
            message: e.message
        })
    }
});

router.post('/setLiveTask', async (req, res) => {
    try {
        const userID = await decryptJWTToken(req.body.token);

        const LiveTaskList = await ProgressModel.findOneAndUpdate(
            {
                $and: [
                    { userID: userID },
                    { communityID: req.body.communityID },
                    { channelID: req.body.channelID }
                ]
            },
            {
                $push: { liveTask: req.body.liveTask }
            }
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
});


router.post('/setSubTask', async (req, res) => {
    try {
        const userID = await decryptJWTToken(req.body.token);

        const result = await ProgressModel.findOne(
            {
                $and: [
                    { userID: userID },
                    { communityID: req.body.communityID },
                    { channelID: req.body.channelID },
                    { 'liveTask._id': req.body.liveTaskID }
                ]
            }
        );

        result.liveTask.forEach(element => {
            if (element._id == req.body.liveTaskID) {
                element.subtask.push(req.body.subTask);
                console.log(element.subtask);
            }
        });
        console.log(result.live)
        await result.save();

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
});

module.exports = router;