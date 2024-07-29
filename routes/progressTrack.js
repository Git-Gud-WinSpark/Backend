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
        console.log(req.body);

        // await ProgressModel.create({
        //     userID: 
        // });

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

module.exports = router;