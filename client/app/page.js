"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export default function Home() {
  const [roomName, setRoomName] = useState("");
  const [userName, setUsername] = useState("");
  const [takenName, setTakenName] = useState(true);
  const [hasPermission, setHasPermission] = useState(null); // <-- Add this

  const router = useRouter();

  function userjoin() {
    if (userName && roomName) {
      router.push(`/Chatroom?user=${userName}&room=${roomName}`);
    }
  }

  async function checkMediaPermissions() {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      return true;
    } catch (err) {
      return false;
    }
  }

  useEffect(() => {
    async function getPermission() {
      const isPermission = await checkMediaPermissions();
      setHasPermission(isPermission); // <-- Store in state
      console.log("is permission", isPermission);
    }
    getPermission();
  }, []);


  return (
    <>
      <div className="main"> 
        <div className="box">
          <input
            className="flex p-2 mb-4 rounded-xl"
            style={{ border: "1px solid black" }}
            placeholder="Username"
            value={userName}
            maxLength={8}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="p-2 m shadow-md rounded-xl "
            style={{ border: "1px solid black" }}
            placeholder="Room"
            value={roomName}
            maxLength={5}
            onChange={(e) => setRoomName(e.target.value)}
          />
          {
            !hasPermission &&<span className="p-2 text-wrap text-[#555]">Give media permission to proceed</span>
          }
          {!takenName ? (
            ""
          ) : (
            <span className="p-2 text-wrap text-[#555]">{takenName}</span>
          )}

          <button
            className="p-4 m-3 text-white bg-[#0a6b60] hover:bg-[#09594d] border-b-4 border-[#09594d]  border-l-green-700 rounded-[13px] disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300 w-[100px]"
            onClick={() => userjoin()}
            disabled={!hasPermission}
          >
            Enter
          </button>
        </div>
      </div>
    </>
  );
}
