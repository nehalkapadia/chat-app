const express = require("express");
const http = require("http");
const path = require("path");
const socket_io = require("socket.io"); // socket library
const Filter = require("bad-words");
const { generateMessage, generateLocationMessage } = require("./utils/message");
const {
  addUser,
  removeUser,
  getUsersInRoom,
  getUser,
} = require("./utils/users");

const port = process.env.PORT;
const send_message_event = "message";
const admin_name = "Admin";
const app = express();
const server = http.createServer(app);
const io = socket_io(server);

const public_dir = path.join(__dirname, "../public");

app.use(express.static(public_dir)); // for static websites

io.on("connection", (socket) => {
  // join event
  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options }); // add user to in the user array

    if (error) {
      return callback(error);
    }

    // join the room
    socket.join(user.room);

    // send the welcome message
    socket.emit(
      send_message_event,
      generateMessage(admin_name, "Welcome to the future!")
    );

    // broadcast the message to everyone except the one who joined
    // socket.broadcast.emit(
    //   send_message_event,
    //   generateMessage("A new user has joined the room!")
    // );

    // io.to.emit = send the message to everyone in the specific room
    // socket.to(room).emit(send_message_event, generateMessage("I am on!"));

    // socket.broadcast.to.emit = send the message to everyone except the one who sent in the specific room
    socket.broadcast
      .to(user.room)
      .emit(
        send_message_event,
        generateMessage(admin_name, `${user.username} has joined!`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  // send the message on send chat event
  socket.on("sendChat", (chatMessage, room, callback) => {
    const filter = new Filter();

    if (filter.isProfane(chatMessage)) {
      alert("Please be civil!");
      return callback("Please be civil!");
    }

    const user = getUser(socket.id);

    // send the message to everyone in the connection including the one who sent the message
    io.to(user.room).emit(
      send_message_event,
      generateMessage(user.username, chatMessage)
    );

    callback();
  });

  // share location event
  socket.on("shareLocation", (location, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      "shareLocationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );

    callback("Location shared!");
  });

  // this event is called when user closes the browser tab or leaves hte room
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        send_message_event,
        generateMessage(admin_name, `${user.username} has left`)
      );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () =>
  console.log("Application is running on port: " + port)
);
