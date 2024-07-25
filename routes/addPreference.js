const express = require('express');
const UserModel = require('../model/UserModel');
const router = express.Router();
const jwt = require('jsonwebtoken');
const SECRET_KEY = "Git-Gud";

router.post('/', async (req, res) => {
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
            { $push: { preferences: { $each: req.body.preferences } } }, // Update
            { new: true } // Options: return the updated document
        );
        
        return res.status(200).json({
            status: "Success",
            message: "Preferences added"
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