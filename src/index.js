const express = require("express");
const http = require("http");
const path = require("path");
const socket_io = require("socket.io");
const Filter = require("bad-words");
const { generateMessage, generateLocationMessage } = require("./utils/message");

const port = process.env.PORT;

const app = express();
const server = http.createServer(app);
const io = socket_io(server);

const public_dir = path.join(__dirname, "../public");

app.use(express.static(public_dir));

io.on("connection", (socket) => {
  console.log("New Websocket Connection!");

  socket.emit("welcomeMessage", generateMessage("I am on!"));
  socket.broadcast.emit("welcomeMessage", generateMessage("A new user has joined the room!"));

  socket.on("sendChat", (chatMessage, callback) => {
    const filter = new Filter();

    if (filter.isProfane(chatMessage)) {
      return callback("Please be civil!");
    }

    io.emit("welcomeMessage", generateMessage(chatMessage));
    callback();
  });

  socket.on("shareLocation", (location, callback) => {
    io.emit(
      "shareLocationMessage",
      generateLocationMessage(`https://google.com/maps?q=${location.latitude},${location.longitude}`)
    );

    callback("Location shared!");
  });

  socket.on("disconnect", () => {
    io.emit("welcomeMessage", generateMessage("A user has left"));
  });
});

server.listen(port, () =>
  console.log("Application is running on port: " + port)
);
