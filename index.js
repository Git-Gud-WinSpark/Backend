const express = require("express");
var http = require("http");
const cors = require("cors");
const app = express();
var server = http.createServer(app);
const ChatModel = require("./model/ChatsModel");
const SignUpRouter = require("./routes/signUp");
const connectMongo = require("./controller/connection");
const SignInRouter = require("./routes/signIn");
const mongoSanitize = require("express-mongo-sanitize");
const ChatsRouter = require("./routes/chatsAPI");
const addPreferenceRouter = require("./routes/addPreference");
const progressRouter = require("./routes/progressTrack");
const P2PChatModel = require("./model/P2PChatModel");
const limiter = require("./controller/rateLimit");
const decryptJWTToken = require("./controller/decryptToken");
const jwt = require("jsonwebtoken");

const port = process.env.HTTP_PORT || 5000;
const SECRET_KEY = process.env.SECRET;
const PORT = process.env.PORT || 3000;

var io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

//middleware
app.use(cors());
app.use(express.json());

app.use("/signup", SignUpRouter);
app.use("/signin", SignInRouter);
app.use("/api", ChatsRouter);
app.use("/addPreference", addPreferenceRouter);
app.use("/progressTrack", progressRouter);

var clients = {};
async function storeP2CChats(userID, receiverID, communityID, message) {
  try {
    const uID = await decryptJWTToken(userID);
    await ChatModel.create({
      senderID: uID,
      receiverID: receiverID,
      communityID: communityID,
      message: message,
    });
  } catch (e) {
    console.log(e.message);
  }
}

async function storeP2PChats(token, receiverID, message, communityID) {
  try {
    const userID = await decryptJWTToken(token);
    await P2PChatModel.create({
      senderID: userID,
      receiverID: receiverID,
      message: message,
    });
  } catch (e) {
    console.log(e.message);
  }
}

// socket driver code
io.on("connection", (socket) => {
  //on user sign in send the user id to the socket
  socket.on("signin", (id) => {
    clients[id] = socket;
  });
  socket.on("messagep2c", (msg) => {
    let targetID = msg.targetID;
    storeP2CChats(msg.id, msg.channel_id, msg.comm_id, msg.msg);
    socket.broadcast.emit("messagep2c", {
      message: msg.msg,
      id: msg.id,
      comm_id: msg.comm_id,
      channel_id: msg.channel_id,
      name: msg.name,
    });
  });

  socket.on("messagep2p", async (msg) => {
    let targetID = msg.targetID;
    const receiverToken = await jwt.sign(targetID, SECRET_KEY);
    storeP2PChats(msg.id, targetID, msg.msg);
    if (clients[receiverToken]) {
      clients[receiverToken].emit("messagep2p", msg);
    }
  });
});

//Middlewares
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(mongoSanitize());

app.get("/", async (req, res) => {
  return res.send("Ok");
});
server.listen(port, () => console.log(`Server running on port ${port}`));
app.listen(PORT, () => {
  console.log(`Server started at PORT:${PORT}`);
});
