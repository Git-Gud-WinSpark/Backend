const jwt = require('jsonwebtoken');
const SECRET_KEY = "Git-Gud";

async function decryptJWTToken(token)
{
    var userID;
    await jwt.verify(token, SECRET_KEY, function (err, payload) {
        if (err) {
            throw Error(err+' Token problem');
        }
        userID = payload;
    });
    return userID;
}

module.exports = decryptJWTToken;