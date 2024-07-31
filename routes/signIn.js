const express = require('express');
const router = express.Router();
const UserModel = require('../model/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;
const SECRET_KEY = "Git-Gud";
const LOCK_TIME = 5 * 60 * 1000;

function validateEmail(email) {
    // Regular expression pattern for email validationconst 
    pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
}

router.post('/', async (req, res) => {
    try {
        if (validateEmail(req.body.email)) {
            const foundRecord = await UserModel.findOne({ 'email': req.body.email });

            if (!foundRecord) {
                return res.status(404).json({
                    status: "Failed",
                    message: "User does not exist"
                })
            }
            else {
                var result = await bcrypt.compare(req.body.password, foundRecord.password);
                const preferences = foundRecord.preferences;
                const originalId = foundRecord._id.toHexString();
                const oldfailAttemptCount = foundRecord.failAttemptCount;

                // if (oldfailAttemptCount >= 3) {
                //     user.lockUntil = Date.now() + LOCK_TIME;
                //     foundRecord.failAttemptCount = 0;
                //     return res.status(404).json({
                //         status: "Failed",
                //         message: "Your account is locked for 5 minutes"
                //     })
                // }

                if (result) {
                    const token = await jwt.sign(originalId, SECRET_KEY);
                    await UserModel.findOneAndUpdate(
                        { _id: originalId }, // Filter
                        { $set: { failAttemptCount: 0 } }, // Update
                        { new: true } // Options: return the updated document
                    );
                    return res.status(200).json({
                        status: "Success",
                        message: "SignIp Successful",
                        token: token,
                        preferences: preferences
                    })
                }
                else {
                    await UserModel.findOneAndUpdate(
                        { _id: originalId }, // Filter
                        { $set: { failAttemptCount: oldfailAttemptCount + 1 } }, // Update
                        { new: true } // Options: return the updated document
                    );

                    return res.status(404).json({
                        status: "Failed",
                        message: "Invalid Password"
                    })
                }
            }
        }
        else {
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