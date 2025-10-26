const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("draw", (data) => {
    socket.broadcast.emit("draw", data);
  });

  socket.on("clear", () => {
    socket.broadcast.emit("clear");
  });

  socket.on("undo", (imgData) => {
    socket.broadcast.emit("undo", imgData);
  });

  socket.on("redo", (imgData) => {
    socket.broadcast.emit("redo", imgData);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = 4000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
