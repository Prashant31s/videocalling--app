import { useState } from "react";
import { cloneDeep } from "lodash";
import socket from "../components/connect";
import { useRouter } from "next/navigation";

const usePlayer = (myId, roomId, peer) => {
  const [players, setPlayers] = useState({});
  const router = useRouter();
  const playersCopy = cloneDeep(players);

  const playerHighlighted = playersCopy[myId];
  delete playersCopy[myId];

  const nonHighlightedPlayers = playersCopy;

  const leaveRoom = () => {
    socket.emit("removeuser", myId, roomId);
    console.log("leaving room", roomId);
    peer?.disconnect();
    router.push(`/`);
  };

const toggleAudio = () => {
    console.log("I toggled my audio");
    setPlayers((prev) => {
      const copy = cloneDeep(prev);
      if(!copy[myId]){
        return;
      }
      copy[myId].url.getAudioTracks()[0].enabled = copy[myId].muted;
      copy[myId].muted = !copy[myId].muted;
      return { ...copy };
    });
    
    socket.emit("user-toggle-audio", myId, roomId);
  };


  const toggleVideoo = () => {
    console.log("I toggled my video");
    setPlayers((prev) => {
      const copy = cloneDeep(prev);
      if(copy[myId]){
        copy[myId].playing = !copy[myId].playing;
      }
      

      return { ...copy };
    });
    socket.emit("user-toggle-video", myId, roomId);
  };

  const toggleVideo = () => {
    let timeoutId = setTimeout(toggleVideoo, 10);
  };

  return {
    players,
    setPlayers,
    playerHighlighted,
    nonHighlightedPlayers,
    toggleAudio,
    toggleVideo,
    leaveRoom,
  };
};

export default usePlayer;
