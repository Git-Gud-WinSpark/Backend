const jwt = require('jsonwebtoken');
const SECRET_KEY = "Git-Gud";

async function decryptJWTToken(token)
{
    var userID;
    await jwt.verify(token, SECRET_KEY, function (err, payload) {
        if (err) {
            throw Error('Token problem');
        }
        userID = payload;
    });
    console.log(payload);
}

module.exports = decryptJWTToken;