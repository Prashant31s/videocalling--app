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
const peerIdToscreen =new Map();
let users = {};
const messageshistory = [];

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
    if (m.user.length == 0) {
      socket.emit("duplicate username", m);
    } else if (!nameTaken(m.user)) {
      socketidToUserNameMap.set(socket.id, m.user);
      socket.emit("username approved");
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
    if (uname) {
      roomuser.push({
        room: roomId,
        peerId: userId,
        sId: socket.id,
        usname: uname,
        video: true,
        audio: true,
        screenshare:false,
      });
    }

    if (!roomtohost[roomId]) {
      //for checking whether the room joined already have host user if not then make the user host of that room
      roomtohost[roomId] = socket.id;
    }
    socket.emit("history", messageshistory);
    io.in(roomId).emit("user-connected", userId, roomtohost, roomuser); // tell all participant in room that a new user is connected to the room
    io.in(roomId).emit("host-user", roomtohost[roomId], roomuser); // tell the room participant that who is the host
  });
  socket.on("message", ({ message, roomId, user }) => {
    console.log("heloooo", { message, roomId, user });
    messageshistory.push({ nmessages: message, ruser: user, myroom:roomId });

    if (roomId) {
      const x = messageshistory.length;
      io.to(roomId).emit("receive-message", { message, user, messageshistory });
    } else {
      io.emit("receive-message", message);
    }
  });
  socket.on("user-toggle-audio", (userId, roomId) => {
    // for telling the user in room that someone toggled its audio and reflect the changes
    socket.join(roomId);
    for (let i = 0; i < roomuser.length; i++) {
      if (roomuser[i].peerId === userId) {
        roomuser[i].audio = !roomuser[i].audio;
      }
    }
    socket.broadcast.to(roomId).emit("user-toggle-audio", userId, roomuser);
  });

  socket.on("host-toggle-audio", (userid, roomId) => {
    for (let i = 0; i < roomuser.length; i++) {
      if (roomuser[i].peerId === userid) {
        roomuser[i].audio = !roomuser[i].audio;
      }
    }
    io.in(roomId).emit("user-toggle-audio", userid, roomuser);
  });

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
    if (roomtohost[roomId] === socket.id) {
      // check if the user is host of any room if it is then make the second user who came into the room the new host of the room
      for (let [key, value] of socketidtoRoomMap) {
        if (value === roomId && key != socket.id) {
          socketidtoRoomMap.delete(socket.id);
          roomtohost[roomId] = key;
          //
          break;
        }
      }
    }
    for (let i = 0; i < roomuser.length; i++) {
      if (roomuser[i].peerId === userId) {
        //remove the socketid from that dataso that the updated data can be displayed at the client side
        roomuser.splice(i, 1);
      }
    }
    socket.leave(roomId);
    socket.broadcast.to(roomId).emit("user-leave", userId);
    io.in(roomId).emit("data-update", roomuser, delete_socketid);
    // io.in(roomId).emit("host-user", roomtohost[roomId], roomuser);
  });

  socket.on("removeuser", (userid, roomId) => {
    // if the host removed/kicked a user than it is told to the server that the userid of roomid has leaved the room
    const x = userid;
    let delete_socketid;
    let screenstatus=false;
    for (let i = 0; i < roomuser.length; i++) {
      //data of that kicked user is removed from room useer
      if (roomuser[i].peerId === x) {
        delete_socketid = roomuser[i].sId;
        
        screenstatus =roomuser[i].screenshare;
        roomuser.splice(i, 1);
      }
    }

    if (roomtohost[roomId] === delete_socketid) {
      // check if the user is host of any room if it is then make the second user who came into the room the new host of the room
      for (let [key, value] of socketidtoRoomMap) {
        if (value === roomId && key != delete_socketid) {
          socketidtoRoomMap.delete(socket.id);
          roomtohost[roomId] = key;
          //
          break;
        }
      }
      io.in(roomId).emit("host-user", roomtohost[roomId], roomuser);
    }
    if(screenstatus){
      io.in(roomId).emit("screen-off",roomId);
    }
    io.in(roomId).emit("user-leave", userid); //all user are told in room that userid has leaved the room and changes at client side are made accordingly
    io.in(roomId).emit("data-update", roomuser, delete_socketid); // emit to update the list of users at client side
  });

  socket.on("back-button-leave", (sid) => {
    let uid;
    let myroom;
    let screenstatus=false;
    for (let i = 0; i < roomuser.length; i++) {
      //data of the user left
      if (roomuser[i].sId === sid) {
        uid = roomuser[i].peerId;
        myroom = roomuser[i].room;
        screenstatus=roomuser[i].screenshare
        roomuser.splice(i, 1);
      }
    }

    if (roomtohost[myroom] === sid) {
      // check if the user is host of any room if it is then make the second user who came into the room the new host of the room

      for (let [key, value] of socketidtoRoomMap) {
        if (value === myroom && key != sid) {
          socketidtoRoomMap.delete(socket.id);
          roomtohost[myroom] = key;
          //
          break;
        }
      }
      io.in(myroom).emit("host-user", roomtohost[myroom], roomuser);
    }

    if(screenstatus===true){
      socket.broadcast.to(myroom).emit("screen-off",myroom);
    }
    io.in(myroom).emit("user-leave", uid); //all user are told in room that userid has leaved the room and changes at client side are made accordingly
    io.in(myroom).emit("data-update", roomuser, sid);
  });
  socket.on("screen-share", (roomId,myId) => {
   
    const screenId=myId;
    io.in(roomId).emit("share-screen",screenId);
    for(let i=0;i<roomuser.length;i++){
      if(roomuser[i].peerId===myId){
        roomuser[i].screenshare=true;
      }
    }
  });

  socket.on("stream-off", (roomId)=>{
    socket.broadcast.to(roomId).emit("screen-off",roomId);
    // peerIdToscreen.delete(myId);
    for(let i=0;i<roomuser.length;i++){
      if(roomuser[i].room===roomId){
        roomuser[i].screenshare=false;
      }
    }
  })
  socket.on("disconnect", () => {
    // if the user in a room disconnects

    const curr_room = socketidtoRoomMap.get(socket.id); //get acess to the room from which it disconnected
    const userId = socketidToUserMap.get(socket.id); // get its userid from socketid
    let screenstatus=false;
    let delete_socketid;
    if (roomtohost[curr_room] === socket.id) {
      // check if the user is host of any room if it is then make the second user who came into the room the new host of the room
      let found = false;
      for (let [key, value] of socketidtoRoomMap) {
        if (value === curr_room && key != socket.id) {
          socketidtoRoomMap.delete(socket.id);
          roomtohost[curr_room] = key;
          found = true;
          break;
        }
      }
      if (!found) {
        delete roomtohost[curr_room];
      }
    }
    for (let i = 0; i < roomuser.length; i++) {
      if (roomuser[i].peerId === userId) {
        delete_socketid = roomuser[i].sId;
        
        screenstatus =roomuser[i].screenshare;
        // console.log("frdvnsjcafsersd",screenstatus)
        //remove the socketid from that dataso that the updated data can be displayed at the client side

        roomuser.splice(i, 1);
      }
    }
    if(screenstatus===true){
      socket.broadcast.to(curr_room).emit("screen-off",curr_room);
    }
    socket.broadcast.to(curr_room).emit("user-leave", userId); // on tab closing
    io.in(curr_room).emit("host-user", roomtohost[curr_room], roomuser); // tell everyone in the room that there is a new host if the leaving user is a host of that room
  });
});

function nameTaken(userName) {
  for (let i = 0; i < roomuser.length; i++) {
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
