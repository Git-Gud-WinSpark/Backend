require('dotenv').config();
const jwt = require('jsonwebtoken');

async function decryptJWTToken(token)
{
    var userID;
    await jwt.verify(token, process.env.SECRET_KEY, function (err, payload) {
        if (err) {
            throw Error('Token problem');
        }
        userID = payload;
    });
    return userID;
}

module.exports = decryptJWTToken;