const express = require('express');
const router = express.Router();
const UserModel = require('../model/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;
const SECRET_KEY = "Git-Gud";

function validateEmail(email) {
    // Regular expression pattern for email validationconst 
    pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
}

function validatePassword(password) {
    // Regular expression pattern for password validation
    const pattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return pattern.test(password);
}

router.post('/', async (req, res) => {
    try {
        if (validateEmail(req.body.email)) {
            if (validatePassword(req.body.password)) {
                var hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

                const userRecord = await UserModel.create({
                    username: req.body.username,
                    email: req.body.email,
                    password: hashedPassword,
                    timestamp: new Date()
                });

                const originalId = userRecord._id.toHexString();
                const token = await jwt.sign(originalId, SECRET_KEY);

                return res.status(200).json({
                    status: "Success",
                    message: "SignUp Successful",
                    token: token
                })
            }
            else{
                return res.status(500).json({
                    status: "failed",
                    message: `Enter stronger password`
                })
            }
        } else {
            return res.status(500).json({
                status: "failed",
                message: `${req.body.email} is not a valid email`
            })
        }
    }
    catch (e) {
        return res.status(500).json({
            status: "failed",
            message: e.message
        })
    }
});

module.exports = router;