import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
const app = express();
const port = 8080;
const server = createServer(app);

const roomuser = [];
const roomtohost = {};
const socketidtoRoomMap = new Map();
const socketidToUserMap = new Map();
const socketidToUserNameMap = new Map();

const io = new Server(server, {
  cors: {
    origin: "*",
    // method: ["GET", "POST"],
    // credentials: true,
  },
});

app.get("/", (req, res) => {
  res.send("HEllo world");
});

io.on("connection", (socket) => {
  socket.on("username", (m) => {
    //for chaecking the same username
     if (!nameTaken(m.userName)) {
      
      socketidToUserNameMap.set(socket.id, m.userName);
      socket.emit("approved username");
    } else {
      socket.emit("duplicate username", m);
    }
  });

  socket.on("join-room", (roomId, userId) => {
    //when a new user enters the room

    socket.join(roomId);
    socketidToUserMap.set(socket.id, userId);
    socketidtoRoomMap.set(socket.id, roomId);
    const uname = socketidToUserNameMap.get(socket.id);
    roomuser.push({
      room: roomId,
      userid: userId,
      sId: socket.id,
      usname: uname,
      video: true,
      audio: true,
    });

    if (!roomtohost[roomId]) {
      //for checking whether the room joined already have host user if not then make the user host of that room
      roomtohost[roomId] = socket.id;
    }

    io.in(roomId).emit("user-connected", userId, roomtohost, roomuser); // tell all participant in room that a new user is connected to the room
    io.in(roomId).emit("host-user", roomtohost[roomId], roomuser); // tell the room participant that who is the host
  });

  socket.on("user-toggle-audio", (userId, roomId) => {
    // for telling the user in room that someone toggled its audio and reflect the changes
    socket.join(roomId);
    for (let i = 0; i < roomuser.length; i++) {
      if (roomuser[i].userid === userId) {
        roomuser[i].audio = !roomuser[i].audio;
      }
    }
    socket.broadcast.to(roomId).emit("user-toggle-audio", userId,roomuser);
  });
  socket.on ("host-toggle-audio",(userid,roomId)=>{
    for (let i = 0; i < roomuser.length; i++) {
      if (roomuser[i].userid === userid) {
        roomuser[i].audio = !roomuser[i].audio;
      }
    }
    io.in(roomId).emit("user-toggle-audio",userid,roomuser);
  })
  socket.on("user-toggle-video", (userId, roomId) => {
    // for telling the user in room that someone toggled its vedio and reflect the changes
    socket.join(roomId);
    for (let i = 0; i < roomuser.length; i++) {
      if (roomuser[i].userid === userId) {
        roomuser[i].video = !roomuser[i].video;
      }
    }

    socket.broadcast.to(roomId).emit("user-toggle-video", userId);
  });

  socket.on("user-leave", (userId, roomId) => {
    //whenever a user leave it tells to the server its userid and roomid and then that message is broadcasted
    // to all participant in that room
    for (let i = 0; i < roomuser.length; i++) {
      if (roomuser[i].userid === userId) {
        //remove the socketid from that dataso that the updated data can be displayed at the client side
        roomuser.splice(i, 1);
      }
    }
    socket.leave(roomId);
    socket.broadcast.to(roomId).emit("user-leave", userId);
    io.in(roomId).emit("data-update", roomuser, delete_socketid);
  });
  socket.on("removeuser", (userid, roomId) => {
    // if the host removed/kicked a user than it is told to the server that the userid of roomid has leaved the room
    const x = userid;
    let delete_socketid;
    for (let i = 0; i < roomuser.length; i++) {
      //data of that kicked user is removed from room useer
      if (roomuser[i].userid === x) {
        delete_socketid = roomuser[i].sId;
        roomuser.splice(i, 1);
      }
    }

    io.in(roomId).emit("user-leave", userid); //all user are told in room that userid has leaved the room and changes at client side are made accordingly
    io.in(roomId).emit("data-update", roomuser, delete_socketid); // emit to update the list of users at client side
  });
  socket.on("disconnect", () => {
    // if the user in a room disconnects

    const curr_room = socketidtoRoomMap.get(socket.id); //get acess to the room from which it disconnected
    const userId = socketidToUserMap.get(socket.id); // get its userid from socketid
    let delete_socketid;
    if (roomtohost[curr_room] === socket.id) {
      // check if the user is host of any room if it is then make the second user who came into the room the new host of the room
      for (let [key, value] of socketidtoRoomMap) {
        if (value === curr_room && key != socket.id) {
          socketidtoRoomMap.delete(socket.id);
          roomtohost[curr_room] = key;
          //
          break;
        }
      }
    }
    for (let i = 0; i < roomuser.length; i++) {
      if (roomuser[i].userid === userId) {
        delete_socketid = roomuser[i].sId; //remove the socketid from that dataso that the updated data can be displayed at the client side

        roomuser.splice(i, 1);
      }
    }

    socket.broadcast.to(curr_room).emit("user-leave", userId); // on tab closing
    io.in(curr_room).emit("host-user", roomtohost[curr_room], roomuser); // tell everyone in the room that there is a new host if the leaving user is a host of that room
  });
});

function nameTaken(userName) {

  for (let i=0;i<roomuser.length;i++) {
    // function to check the data that whether the name is present in data or not
   
    if (roomuser[i].usname === userName) {
      return true;
    }
  }
  return false;
}

server.listen(port, () => {
  console.log(`server is running on ${port}`);
});
