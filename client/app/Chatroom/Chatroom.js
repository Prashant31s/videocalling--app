"use client";
import React, { useEffect, useState } from "react";
import socket from "../components/connect";
import { useSearchParams } from "next/navigation";
import usePeer from "../hooks/usePeer";
import useMediaStream from "../hooks/useMediaStream";
import usePlayer from "../hooks/usePlayer";
import Player from "../component/Player";
import Bottom from "../component/Bottom";
import CopySection from "../component/CopySection";
import styles from "./Chatroom.module.css";
import { cloneDeep, cond, set } from "lodash";
import { Mic, PhoneOff } from "lucide-react";
import { useRouter } from "next/navigation";

function Chatroom() {
  const searchParams = useSearchParams();
  const user = searchParams.get("user");
  const newroom = searchParams.get("room");
  const [roomId, setRoomId] = useState(newroom);
  const [data, setData] = useState([]);
  const { peer, myId } = usePeer();
  const router = useRouter();
  const [length, setLength] = useState(0);

  const { stream } = useMediaStream();
  const [roomhost, setRoomhost] = useState();
  const [showDataList, setShowDataList] = useState(false);

  const [users, setUsers] = useState([]);
  const [myidnew, setMyidnew] = useState();
  let playerContainerClass = styles.PlayerContainer;

  const {
    players,
    setPlayers,
    playerHighlighted,
    nonHighlightedPlayers,
    toggleAudio,
    toggleVideo,
    leaveRoom,
  } = usePlayer(myId, roomId, peer);

  useEffect(() => {
    if (myId) {
      setMyidnew(myId);
    }
  }, [myId, myidnew]);
  useEffect(() => {
    if (!socket || !peer || !stream) return;
    const handleUserConnected = (newUser, roomtohost, roomuser) => {
      const call = peer.call(newUser, stream);
      call.on("stream", (incomingStream) => {
        //receive call and set the user players of that room just add on the new user
        setPlayers((prev) => ({
          ...prev,
          [newUser]: {
            url: incomingStream,
            muted: true,
            playing: true,
          },
        }));

        setUsers((prev) => ({
          ...prev,
          [newUser]: call,
        }));
      });
    };
    socket.on("user-connected", handleUserConnected); //a user is connected

    return () => {
      socket.off("user-connected", handleUserConnected);
    };
  }, [peer, setPlayers, socket, stream]);

  const handleUserLeave = (userId) => {
    // fucntion to handle if a person has leaved the room
    console.log(`user ${userId} is leaving the room`);

    users[userId]?.close(); //if the user leaves delete its data from the client side player so that its player doesnt dhow in the screen
    const playersCopy = cloneDeep(players);
    delete playersCopy[userId];
    setPlayers(playersCopy);
  };
  useEffect(() => {
    if (!socket) return;
    const handleToggleAudio = (userId, roomuser) => {
      //function to handle if someone has changed it audio int the room
      setData(roomuser);
      console.log("ddddddo", data);
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        copy[userId].muted = !copy[userId].muted;
        return { ...copy };
      });
    };

    const handleToggleVideo = (userId) => {
      //function to handle if someone has changed its vedio status in the room

      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        copy[userId].playing = !copy[userId].playing; // changing the video status of that user so that it can be reflected on the screen
        return { ...copy };
      });
    };
    setLength(Object.keys(nonHighlightedPlayers).length + 1);
    const handleDataUpdate = (roomuser, delete_socketid) => {
      // handle data updation coming from server in the room so that user list can be updated and shown
      setData(roomuser);
      if (socket.id === delete_socketid) {
        //if the current user is being kicked from the room by the host than it will be pushed to the homepage
        peer.disconnect();
        router.push(`/`);
      }
    };

    socket.on("user-toggle-audio", handleToggleAudio); // receiving the emitt from the server
    socket.on("user-toggle-video", handleToggleVideo);
    socket.on("user-leave", handleUserLeave);
    socket.on("data-update", handleDataUpdate);

    return () => {
      socket.off("user-toggle-audio", handleToggleAudio);
      socket.off("user-toggle-video", handleToggleVideo);
      socket.off("user-leave", handleUserLeave);
      socket.off("data-update", handleDataUpdate);
    };
  }, [players, setPlayers, stream, players.playing, playerHighlighted, data]);

  useEffect(() => {
    if (!peer || !stream) return;
    peer.on("call", (call) => {
      // the peer wiil make a call and also receive the call in the room and set the incoming stream in players so thatit can be shown
      const { peer: callerId } = call;
      call.answer(stream);

      call.on("stream", (incomingStream) => {
        if (myId && callerId !== myidnew) {
          let currvideo;
          let curraudio;
          for (let i = 0; i < data.length; i++) {
            if (data[i].userid === callerId) {
              currvideo = data[i].video;
              curraudio = data[i].audio;
            }
          }
          setPlayers((prev) => ({
            ...prev,
            [callerId]: {
              url: incomingStream,
              muted: curraudio,
              playing: currvideo,
            },
          }));

          setUsers((prev) => ({
            ...prev,
            [callerId]: call,
          }));
        }
      });
    });
  }, [peer, setPlayers, stream, players, myidnew, data]);

  useEffect(() => {
    if (!stream || !myId) return;
    console.log(`setting my stream ${myId}`);
    setPlayers((prev) => ({
      //users stream will be set into the player
      ...prev,
      [myId]: {
        url: stream,
        muted: true,
        playing: true,
      },
    }));
  }, [myId, setPlayers, stream]);

  useEffect(() => {
    const handlehostuser = (host, ruser) => {
      // function to handle the hostuserr and tell the users in the room that who is the host
      let x = 0;
      for (let i = 0; i < ruser.length; i++) {
        if (ruser[i].room == roomId) {
          x++;
        }
      }
      setLength(x);
      setData(ruser);
      setRoomhost(host);
    };
    socket.on("host-user", handlehostuser);
  }, [data, length]);
  const removeuser = (userid) => {
    // if the user want to leave from the room by clicking the button it will notify the room that the userid is leaving the roomId emitting tho server
    socket.emit("removeuser", userid, roomId);
  };
  const mictoggleuser = (userid) => {
    socket.emit("host-toggle-audio", userid, roomId);
  };

  const toggleDataList = () => {
    setShowDataList((prev) => !prev); // Toggle the visibility state
  };

  // useEffect(() => {
  //   router.beforePopState(({ url, as, options }) => {
  //     // I only want to allow these two routes!
  //     if (as !== '/' && as !== '/other') {
  //       // Have SSR render bad routes as a 404.
  //       window.location.href = as
  //       return false
  //     }
 
  //     return true
  //   })
  // }, [router])

  if (length === 1) {
    playerContainerClass += ` ${styles.onePlayer}`;
  } else if (length === 2) {
    playerContainerClass += ` ${styles.twoPlayers}`;
  } else if (length === 3) {
    playerContainerClass += ` ${styles.threePlayers}`;
  } else if (length === 4) {
    playerContainerClass += ` ${styles.fourPlayers}`;
  } else if (length === 5) {
    playerContainerClass += ` ${styles.fivePlayers}`;
  } else if (length === 6) {
    playerContainerClass += ` ${styles.sixPlayers}`;
  }

  return (
    <>
      <div className={styles.main}>
        <div className={styles.toppart}>
          <div className={playerContainerClass}>
            {Object.keys(nonHighlightedPlayers).map((playerId, index) => {
              const { url, muted, playing } = nonHighlightedPlayers[playerId];

              return (
                <>
                  <Player
                    key={playerId}
                    url={url}
                    muted={muted}
                    playing={playing}
                    isActive={false}
                    name={data.find((item) => item.userid === playerId)?.usname}
                  />
                </>
              );
            })}

            {playerHighlighted && (
              <Player
                url={playerHighlighted.url}
                muted={playerHighlighted.muted}
                playing={playerHighlighted.playing}
                isActive={true}
                name="Me"
              />
            )}
          </div>
          {showDataList && (
            <div className={styles.datalist}>
              {/*displaying the copysection containing the roomid and the list of all users in room */}

              <div className="   h-full relative  text-wrap overflow-auto border-black rounded-[15px]   scrollbar-thin scrollbar-thumb-rounded-sm scrollbar-thumb-black">
                {data.map(
                  (item, index) =>
                    item.room === roomId && ( //will only show the participant of that particular room
                      <div key={index} className="data-item">
                        <div className="flex flex-row p-2 ">
                          {item.sId === roomhost ? (
                            item.sId === socket.id ? (
                              <p className="text-black">
                                Me(Host) : {item.usname}
                              </p>
                            ) : (
                              <p className="text-black">Host : {item.usname}</p>
                            )
                          ) : item.sId === socket.id ? (
                            <p className="text-black">Me : {item.usname}</p>
                          ) : (
                            <p className="text-black">User : {item.usname}</p>
                          )}

                          {socket.id === roomhost &&
                            item.sId != socket.id && ( //will only show the kick button to the host of the room
                              <div>
                                <button
                                  className="rounded-full w-[25px] bg-buttonPrimary justify-between p-1 mx-2 text-white cursor-pointer right-2 absolute"
                                  onClick={() => removeuser(item.userid)}
                                >
                                  <img
                                    src={`https://www.svgrepo.com/show/246569/remove-user.svg`}
                                    alt="button icon"
                                    className={styles.whitesvg}
                                  />
                                </button>
                                
                                {item.audio === false && (
                                  <Mic
                                    size={25}
                                    className="bg-buttonPrimary rounded-full p-[5px] justify-between mx-2 text-white cursor-pointer right-10 absolute"
                                    onClick={() => mictoggleuser(item.userid)} //will exectute the remove user function for that kicked userid
                                  />
                                )}
                              </div>
                            )}
                        </div>
                      </div>
                    )
                )}
              </div>
            </div>
          )}
        </div>
        <div className={styles.bottompart}>
          <div className=" h-15vh ">
            <CopySection roomId={roomId} />
          </div>

          <Bottom
            muted={playerHighlighted?.muted} //will show the bottom button like videoff, micoff , leaveroom button  by default the mic is muted and the video is on
            playing={playerHighlighted?.playing}
            toggleAudio={toggleAudio}
            toggleVideo={toggleVideo}
            leaveRoom={leaveRoom}
            toggleDataList={toggleDataList}
            showDataList={showDataList}
          />
          {/* <ModeToggle/> */}
        </div>
      </div>
    </>
  );
}

export default Chatroom;
