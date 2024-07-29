const express = require("express");
var http = require("http");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
var server = http.createServer(app);
const ChatModel = require('./model/ChatsModel');
server.listen(port, () => console.log(`Server running on port ${port}`));
const PORT = 3000;
const SignUpRouter = require('./routes/signUp');
const connectMongo = require('./controller/connection');
const SignInRouter = require('./routes/signIn');
const mongoSanitize = require('express-mongo-sanitize');
const ChatsRouter = require('./routes/chatsAPI');
const addPreferenceRouter = require('./routes/addPreference');
const progressRouter = require('./routes/progressTrack');
const P2PChatModel = require('./model/P2PChatModel');
const limiter = require('./controller/rateLimit');
var io = require("socket.io")(server, {
    cors: {
        origin: "*"
    },
})

// 2. offline messaging
// 3. file sharing

//middleware
app.use(cors());
app.use(express.json());
var clients = {};


async function storeP2CChats(userID, receiverID, communityID, message) {
    try {

        await ChatModel.create({
            senderID: userID,
            receiverID: receiverID,
            communityID: communityID,
            message: message
        });
        console.log("Chat Stored");
    }
    catch (e) {
        console.log(e.message);
    }
}

async function storeP2PChats(userID, receiverID, message, communityID) {
    try {

        await P2PChatModel.create({
            senderID: userID,
            receiverID: receiverID,
            message: message
        });
        console.log("Chat Stored");
    }
    catch (e) {
        console.log(e.message);
    }
}

// socket driver code
io.on("connection", (socket) => {
    console.log("User connected");
    console.log(socket.id, "has joined");
    //on user sign in send the user id to the socket
    socket.on("signin", (id) => {
        console.log("user id : ", id);
        clients[id] = socket;
        console.log(id, " joined")
        // console.log(Object.keys(clients).length);
    })
    //p2p message feature {issue : works only when both users are logged in}
    socket.on("messagep2c", (msg) => {
        console.log(msg);
        let targetID = msg.targetID;
        // console.log(targetID,clients[targetID]);
        // if(clients[targetID])
        //     clients[targetID].emit("messagep2p",msg);
        console.log("id:", msg.id)
        storeP2CChats(msg.id, msg.channel_id, msg.comm_id, msg.msg);
        socket.broadcast.emit("messagep2c", { message: msg.msg, id: msg.id, comm_id: msg.comm_id, channel_id: msg.channel_id });
    })

    socket.on("messagep2p", (msg) => {
        console.log(msg, "p2p message");
        let targetID = msg.targetID;
        storeP2PChats(msg.id, msg.targetID, msg.msg);
        if (clients[targetID]) {
            clients[targetID].emit("messagep2p", msg);
        }
    })

});


//Middlewares
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(mongoSanitize());

app.use('/signup', SignUpRouter);
app.use('/signin', SignInRouter);
app.use('/api', ChatsRouter);
app.use('/addPreference', addPreferenceRouter);
app.use('/progressTrack', progressRouter);

app.get('/', async (req, res) => {
    return res.send('Ok');
});

app.listen(PORT, () => {
    console.log(`Server started at PORT:${PORT}`);
})
