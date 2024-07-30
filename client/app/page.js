"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import socket from "./components/connect";

export default function Home() {
  const [roomName, setRoomName] = useState("");
  const [userName, setUsername] = useState("");
  const [takenName, setTakenName] = useState(true);

  const router = useRouter();

  function userjoin() {
    if (userName) {
      socket.emit("username", { userName });
      socket.on("approved username", () => {
        router.push(`/Chatroom?user=${userName}&room=${roomName}`);
      });
      socket.on("duplicate username", (m) => {
        setTakenName(`username ${m.userName} is taken`);
      });
      socket.on("toobig",()=>{
        setTakenName(`Username max length exceeded`);
      })
    }
  }

  return (
    <>
      <div className="main">
        <div className="box">
          <input
            className="flex p-2 m-2 mb-0 bg-gray-100 rounded-md text-black"
            style={{ border: "2px solid black" }}
            placeholder="Username"
            value={userName}
            maxLength={8}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="p-2 m-2 text-black bg-gray-100 shadow-md rounded-xl w-1/8 "
            style={{ border: "2px solid black" }}
            placeholder="Room"
            value={roomName}
            maxLength={5}
            onChange={(e) => setRoomName(e.target.value)}
          />
          {!takenName ? (
            ""
          ) : (
            <span className="p-2 text-wrap text-white">{takenName}</span>
          )}

          <button
            className="p-4 m-3 text-black bg-blue-500 hover:bg-blue-800  border-b-4 border-blue-800 border-l-green-700 rounded-[20px]"
            onClick={() => userjoin()}
          >
            Enter
          </button>
        </div>
      </div>
    </>
  );
}
