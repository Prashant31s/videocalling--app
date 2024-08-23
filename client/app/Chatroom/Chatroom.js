"use client";
import React, { useCallback, useEffect, useState, useRef } from "react";
import socket from "../components/connect";
import { useSearchParams } from "next/navigation";
import usePeer from "../hooks/usePeer";
import useMediaStream from "../hooks/useMediaStream";
import usePlayer from "../hooks/usePlayer";
import Player from "../component/Player";
import Bottom from "../component/Bottom";
import CopySection from "../component/CopySection";
import ScreenRecording from "../component/ScreenRecording";
import styles from "./Chatroom.module.css";
import { cloneDeep } from "lodash";
import { Mic } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserHistory } from "history";
import ReactPlayer from "react-player";
import { useReactMediaRecorder } from "react-media-recorder";
// import {AudioDeviceSelector} from "../component/AudioDeviceSelector"
import AudioDeviceSelector from "../component/AudioDeviceSelector";
import AudioVisualizer from "../component/AudioVisualiser";
import AudioStream from "../component/AudioStream";
import MediaComponent from "../component/MediaComponent";

function Chatroom() {
  const [scrShare, setScrShare] = useState(false);
  const searchParams = useSearchParams();
  const user = searchParams.get("user");
  const newroom = searchParams.get("room");
  const router = useRouter();
  const [roomId, setRoomId] = useState(newroom);
  const [allow, setAllow] = useState(false);
  const [usernameApproved, setUsernameApproved] = useState(false);
  const history = createBrowserHistory();
  const [data, setData] = useState([]);
  const { peer, myId } = usePeer();
  const [length, setLength] = useState(0);
  // const [isscreenavailable, setIsScreenAvailable] = useState(false);
  const [screenpeerid, setScreenPeerId] = useState();
  let check = true;

  const { stream } = useMediaStream();
  const [roomhost, setRoomhost] = useState();
  const [showDataList, setShowDataList] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const [showScreen, setShowScreen] = useState(false);

  const [users, setUsers] = useState([]);
  const [myidnew, setMyidnew] = useState();
  // const [isrecording, setIsRecording] = useState(false);
  // let screenvideo;
  let playerContainerClass = styles.PlayerContainer;

  const [mesuser, setMesuser] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [receiveuser, setReceiveuser] = useState("");
  const [currscreenstream, setCurrScreenStream] = useState(null);

  const [recording, setRecording] = useState(false);
  const [mediaBlobUrl, setMediaBlobUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [changedevice, setChangeDevice] = useState(false);
  const [devicechangepeerId, setDeviceChangePeerId] = useState();
  // const [devices, setDevices] = useState([]);
  // const [selectedDeviceId, setSelectedDeviceId] = useState("");
  // const [sstream, setSStream] = useState(null);
  // const [remoteStream, setRemoteStream] = useState(null);
  const [currstream, setCurrStream] = useState();
  const {
    players,
    setPlayers,
    playerHighlighted,
    nonHighlightedPlayers,
    toggleAudio,
    toggleVideo,
    leaveRoom,
    showchat,
    // shareScreen
  } = usePlayer(myId, roomId, peer);

  // const { status, startRecording, stopRecording, mediaBlobUrl } =
  //   useReactMediaRecorder({ audio:false,screen: true  });

  const [isChecked, setIsChecked] = useState(false);
  const videoRef = useRef(null);
  let ishost=false;
  useEffect(() => {
    history.listen((update) => {
      if (update.action === "POP") {
        if (screenStream) {
          screenStream.getTracks().forEach((track) => track.stop());
          setScreenStream(null);
          // socket.emit("stream-off", roomId);
          setScrShare(false);
        }
        socket.emit("back-button-leave", socket.id);
      }
    });
  }, [screenStream]);

  useEffect(() => {
    socket.emit("username", { user });
    socket.on("duplicate username", (m) => {
      router.push(`/`);
      setAllow(false);
    });

    socket.on("username approved", () => {
      setUsernameApproved(true);
      setAllow(true);
    });
    return () => {
      socket.off("duplicate username");
      socket.off("username appreoved");
    };
  }, [user, router]);

  useEffect(()=>{
    setCurrStream(stream);
  },[])

  useEffect(() => {
    if (myId) {
      setMyidnew(myId);
    }
  }, [myId, myidnew]);
  useEffect(() => {
    if (!socket || !peer || !stream || !usernameApproved) return;
    const handleUserConnected = (newUser, roomtohost, roomuser) => {
      // console.log("connecteddddddd",roomuser);
      // setData(roomuser);
      // let call
      // if(currstream){
        const call = peer.call(newUser, currstream);
      // }
      // else{
        //  call = peer.call(newUser, stream);
      // }
      
      call.on("stream", (incomingStream) => {
        console.log("handleuserconnected");
        // setRemoteStream(incomingStream);
        //make a call to new user onnected and also recieve stream from it and set the user players of that room just add on the new user
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

      // for(let i=0;i<roomuser.length;i++){
      //   console.log("newshacafefs",roomuser[i].sId,socket.id ,roomuser[i].screenshare);
      //   if(roomuser[i].sId===socket.id &&roomuser[i].screenshare){
      //     const call =peer.call(newUser,screenStream)
      //     console.log("workinggggg",screenStream);
      //   }
      // }
    };
    socket.on("user-connected", handleUserConnected); //a user is connected

    return () => {
      socket.off("user-connected", handleUserConnected);
    };
  }, [peer, setPlayers, socket, stream, usernameApproved,currstream]);

  const handleUserLeave = (userId) => {
    // fucntion to handle if a person has leaved the room
    users[userId]?.close(); //if the user leaves delete its data from the client side player so that its player doesnt dhow in the screen
    const playersCopy = cloneDeep(players);
    delete playersCopy[userId];
    setPlayers(playersCopy);
  };
  useEffect(() => {
    if (!socket || !usernameApproved) return;
    const handleToggleAudio = (userId, roomuser) => {
      //function to handle if someone has changed it audio int the room
      setData(roomuser);
      // console.log("ppppppppppp", players);
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

    const handleScreenShare = (screenId) => {
      if (screenId != myId) {
        check = false;
      }
      setScreenPeerId(screenId);
    };

    const handleStreamOff = (roomId) => {
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
        setScreenStream(null);
        setCurrScreenStream(null);
        setScrShare(false);
      }
    };
    const handleHistory = (messageshistory) => {
      let mes = [];
      for (let i = 0; i < messageshistory.length; i++) {
        //console.log("messagehistoryroom", messageshistory[i].nmessages,messageshistory[i].myroom, room);
        if (messageshistory[i].myroom == roomId) {
          mes.push({
            nmessages: messageshistory[i].nmessages,
            ruser: messageshistory[i].ruser,
          });
        }
      }
      setMesuser(mes);
    };
    const handleDeviceChanged = (peerid, room) => {
      setDeviceChangePeerId(peerid);
      setChangeDevice(true);
    };
    socket.on("share-screen", handleScreenShare);
    socket.on("user-toggle-audio", handleToggleAudio); // receiving the emitt from the server
    socket.on("user-toggle-video", handleToggleVideo);
    socket.on("user-leave", handleUserLeave);
    socket.on("data-update", handleDataUpdate);
    socket.on("screen-off", handleStreamOff);
    socket.on("device-changed", handleDeviceChanged);

    socket.on("history", handleHistory);

    return () => {
      socket.off("user-toggle-audio", handleToggleAudio);
      socket.off("user-toggle-video", handleToggleVideo);
      socket.off("user-leave", handleUserLeave);
      socket.off("data-update", handleDataUpdate);
      socket.off("screen-off", handleStreamOff);
      socket.off("history", handleHistory);
      socket.off("device-changed", handleDeviceChanged);
    };
  }, [
    players,
    setPlayers,
    stream,
    players.playing,
    playerHighlighted,
    data,
    usernameApproved,
    mesuser,
    changedevice,
  ]);
  useEffect(() => {
    socket.on("receive-message", ({ message, user, messageshistory }) => {
      let mes = mesuser;
      mes.push({ nmessages: message, ruser: user });
      setMesuser(mes);
      setMessages((messages) => [...messages, message]);
      setReceiveuser(user);
    });
  }, [mesuser]);

  useEffect(() => {
    if (!usernameApproved || !peer || !stream) return;
    peer.on("call", (call) => {
      // the peer wiil make a call and also receive the call in the room and set the incoming stream in players so thatit can be shown
      const { peer: callerId } = call;
      call.answer(currstream);

      call.on("stream", (incomingStream) => {
        // console.log("i  bnjb", incomingStream,changedevice,devicechangepeerId);
        // if(changedevice){
        // console.log("changing",incomingStream,);
        // console.log("players",players);
        // if(videoRef.current){
        //   videoRef.current.srcObject=incomingStream
        // }

        // setPlayers((prev) => {
        //   const copy = cloneDeep(prev);
        //   copy[devicechangepeerId].url= videoRef; // changing the video status of that user so that it can be reflected on the screen
        //   return { ...copy };
        // });
        // console.log("after",players)
        // setChangeDevice(false);

        // }
        console.log("dataaaaa",data);
        if (!check) {
          console.log("incoming tream", incomingStream);
          setScreenStream(incomingStream);
          setCurrScreenStream(incomingStream);
          check = true;
        } else {
          if (myId && callerId !== myidnew) {
            let currvideo;
            let curraudio;
            for (let i = 0; i < data.length; i++) {
              if (data[i].peerId === callerId) {
                currvideo = data[i].video;
                curraudio = data[i].audio;
              }
            }
            console.log("check",curraudio,currvideo);
            setPlayers((prev) => ({
              ...prev,
              [callerId]: {
                url: incomingStream,
                muted: curraudio,
                playing: currvideo,
              },
            }));
            console.log("players",players);
            setUsers((prev) => ({
              ...prev,
              [callerId]: call,
            }));
          }
        }
      });
    });
  }, [
    usernameApproved,
    peer,
    setPlayers,
    stream,
    players,
    myidnew,
    data,
    
  ]);
  // useEffect(()=>{
  //   console.log("useffecr",players);
  // },[players])

  useEffect(() => {
    if (!usernameApproved || !stream || !myId) return;
    if (currstream) {
      setPlayers((prev) => ({
        //users stream will be set into the player
        ...prev,
        [myId]: {
          url: currstream,
          muted: true,
          playing: true,
        },
      }));
    } else {
      setPlayers((prev) => ({
        //users stream will be set into the player
        ...prev,
        [myId]: {
          url: stream,
          muted: true,
          playing: true,
        },
      }));
    }
  }, [usernameApproved, myId, setPlayers, , currstream]);

  useEffect(() => {
    if (!usernameApproved) return;
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
      
      
      // // screenStream.getTracks().forEach((track) => track.stop());
      // // setScreenStream(null);
      // // socket.emit("stream-off", roomId);
      // setScrShare(false);
    };
    socket.on("host-user", handlehostuser);
    return () => {
      socket.off("host-user", handlehostuser);
    };
  }, [usernameApproved, data, length]);

  const removeuser = (userid) => {
    // if the user want to leave from the room by clicking the button it will notify the room that the userid is leaving the roomId emitting tho server
    socket.emit("removeuser", userid, roomId);
  };

  const mictoggleuser = (userid) => {
    socket.emit("host-toggle-audio", userid, roomId);
  };

  const toggleDataList = () => {
    if (showChat) {
      setShowChat((prev) => !prev);
    }
    setShowDataList((prev) => !prev); // Toggle the visibility state
  };

  const toggleChat = () => {
    setShowChat((prev) => !prev);
    if (showDataList) {
      setShowDataList((prev) => !prev);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message) {
      socket.emit("message", { message, roomId, user });
    }

    setMessage("");
  };
  let xstream = null;
  // console.log("screenpeerid", screenpeerid, myId);

  const shareScreen = async () => {
    if (screenStream) {
      if (screenpeerid === myId) {
        screenStream.getTracks().forEach((track) => track.stop());
        setScreenStream(null);
        setCurrScreenStream(null);
        socket.emit("stream-off", roomId);
        setScrShare(false);
        setShowScreen(false);
      }

      return;
    } else {
      try {
        const screenStreame = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        setScreenStream(screenStreame);
        xstream = screenStreame;

        // if(scrShare){
        //   console.log("scrshare");
        // }
        setShowScreen(true);
        setScrShare(true);
        // socket.broadcast(roomId)emit("screen-share", screenStream);
        // socket.emit("screen-share",screenStreame,roomId);
      } catch (error) {
        console.error("Error sharing screen:", error);
      }
    }
  };

  if (screenStream) {
    screenStream.getVideoTracks()[0].onended = function () {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      setCurrScreenStream(null);
      socket.emit("stream-off", roomId);
      setScrShare(false);
      setShowScreen(false);
    };
  }

  useEffect(() => {
    if (scrShare) {
      console.log("screeenstream", screenStream);
      console.log("screeenstream", currscreenstream);
      if (currscreenstream != screenStream && currscreenstream) {
        screenStream.getTracks().forEach((track) => track.stop());
        setScreenStream(currscreenstream);
        setShowScreen(false);
      }
      socket.emit("screen-share", roomId, myId);
      socket.on("answer", (allow, uid) => {
        console.log("ansss", allow);
        if (allow && uid === myId) {
          for (let i = 0; i < data.length; i++) {
            if (data[i].peerId != myId && data[i].room === roomId) {
              const call = peer.call(data[i].peerId, screenStream);
            }
          }
        } else {
          // remove();
          console.log("acceess denied");
          return;
        }
      });
    }
    return () => {
      socket.off("answer");
    };
  }, [scrShare, players]);
  // console.log("blobutfe", mediaBlobUrl);
  // const RecordingStop =()=>{
  //   stopRecording();
  //   setIsRecording(false);
  //   console.log("bloburl22",mediaBlobUrl)
  // }
  // const RecordingStart=()=>{
  //   startRecording();
  //   setIsRecording(true);
  // }
  const handleCheckboxChange = () => {
    if(!isChecked){
      startRecording();
    }
    else{
      stopRecording();
    }
    
  }

  const startRecording = async () => {
    try {
      // Requesting screen and audio capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true, // Request audio capture
        selfBrowserSurface: "include",
        preferCurrentTab: true,
      });

      // Creating a MediaRecorder instance
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Collecting chunks of data as they become available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Creating a URL for the recorded video when recording stops
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setIsChecked(false);
        setMediaBlobUrl(url);
        chunksRef.current = [];
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.onstart=()=>{
        setIsChecked(true);
      }

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Error starting screen recording:", error);
    }
  };
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      // mediaRecorderRef.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };
  // if (!navigator.mediaDevices?.enumerateDevices) {
  //   console.log("enumerateDevices() not supported.");
  // } else {
  //   // List cameras and microphones.
  //   navigator.mediaDevices
  //     .enumerateDevices()
  //     .then((devices) => {
  //       devices.forEach((device) => {
  //         // console.log(`${device.kind}: ${device.label} id = ${device.deviceId}`);
  //         if(device.kind ==='audioinput'){
  //           console.log(device,device.length)
  //         }

  //       });
  //     })
  //     .catch((err) => {
  //       console.error(`${err.name}: ${err.message}`);
  //     });
  // }

  // useEffect(()=>{
  //   if(mediaBlobUrl){

  //   }
  //   else{

  //   }

  // },[mediaBlobUrl])
  // const [curraudiooutputdevice, setCurrAudioOutputDevice]=useState();
  // let curraudiooutputdevice = "";
  // const handleDeviceSelect = (deviceId) => {
  //   setSelectedDeviceId(deviceId);
  // };
  // const audioOutputDevice = new Map();
  // const audioInputDevice = new Map();
  // const getAudioOutputDevice = async () => {
  //   const devices = await navigator.mediaDevices.enumerateDevices();
  //   for (const device of devices) {
  //     if (device.kind == "audiooutput")
  //       audioOutputDevice.set(device.deviceId, device);
  //     if (device.kind == "audioinput")
  //       audioInputDevice.set(device.deviceId, device);
  //   }
  //   console.log("output", audioOutputDevice);
  //   console.log("input", audioInputDevice);
  //   console.log("all devices", devices);

  //   // setCurrAudioOutputDevice(audioOutputDevice);
  //   setAudioOutputDevice();
  //   curraudiooutputdevice = audioOutputDevice;
  //   return audioOutputDevice;
  // };
  // const setAudioOutputDevice = (deviceId) => {
  // console.log("fedfewsdefd", audioOutputDevice);
  // const audioTags = document.getElementsByTagName("audio");
  // audioTags.forEach((tag) => {
  //   tag.setSinkId(deviceId);
  // });
  // };

 

  // useEffect(() => {
  //   // Function to start audio stream from selected device
  //   // console.log("selectdeviceid",selectedDeviceId);
  //   const startStream = async () => {
  //     if (selectedDeviceId) {
  //       try {
  //         const newStream = await navigator.mediaDevices.getUserMedia({
  //           video: true,
  //           audio: {
  //             deviceId: selectedDeviceId
  //               ? { exact: selectedDeviceId }
  //               : undefined,
  //           },
  //         });
  //         setSStream(newStream);
  //         // stream=newStream;
  //       } catch (error) {
  //         console.error("Error accessing the audio device:", error);
  //       }
  //     }
  //   };
  //   // console.log("newstrram",sstream);
  //   startStream();
  //   // console.log("nnnnnn",stream);

  //   // Cleanup on component unmount
  //   return () => {
  //     if (sstream) {
  //       // console.log("nnnnnn", stream);
  //       sstream.getTracks().forEach((track) => track.stop());
  //     }
  //   };
  // }, [selectedDeviceId]);

  // useEffect(() => {
  //   // console.log("sssssstraeam", sstream);
  //   // if(sstream){
  //   if (sstream) {
  //     socket.emit("device-change", myId, roomId);
  //     for (let i = 0; i < data.length; i++) {
  //       if (data[i].peerId != myId && data[i].room === roomId) {
  //         const call = peer.call(data[i].peerId, sstream);
  //       }
  //     }
  //   }

  //   // setStream(sstream);
  // }, [sstream]);
  useEffect(() => {
    // console.log("FRFGRFS",currstream ,stream);
    // console.log("playerhighlighted", playerHighlighted);
    if (playerHighlighted && currstream) {
      playerHighlighted.url = currstream;
      // console.log("ghjkhbvjnkljbvbnkl")
    }
    // console.log("playerhighlighted", playerHighlighted);
  }, [currstream]);
  // useEffect(()=>{
  //   console.log("updated");
  // },[playerHighlighted])
  if(socket.id===roomhost){
    ishost=true;
  }
  if (length === 1 && !screenStream) {
    playerContainerClass += ` ${styles.onePlayer}`;
  } else if (
    (length === 2 && !screenStream)
  ) {
    playerContainerClass += ` ${styles.twoPlayers}`;
  } else if (length === 3 && !screenStream) {
    playerContainerClass += ` ${styles.threePlayers}`;
  } else if (length === 4 && !screenStream) {
    playerContainerClass += ` ${styles.fourPlayers}`;
  } else if (length === 5) {
    playerContainerClass += ` ${styles.fivePlayers}`;
  } else if (length === 6) {
    playerContainerClass += ` ${styles.sixPlayers}`;
  } 
  else if(length===1 &&screenStream){
    playerContainerClass += ` ${styles.screenOne}`;
  }
  else if (length === 2 && screenStream) {
    playerContainerClass += ` ${styles.screenTwo}`;
  } else if (length === 3 && screenStream) {
    playerContainerClass += ` ${styles.screenThree}`;
  } else if (length === 4 && screenStream) {
    playerContainerClass += ` ${styles.screenFour}`;
  }
  // console.log("pppp",playerContainerClass);
  return (
    <>
      <img
        src={`https://upload.wikimedia.org/wikipedia/commons/a/a7/Skype_logo.svg`}
        alt="button icon"
        className="absolute left-[70px] top-[2px] w-[65px]"
      />
      <div className="absolute top-[3px] right-[10px] ">
        {/* <p>{status}</p> */}
        {/* {
        isrecording ?(
          <button onClick={RecordingStop}>stop</button>
        ):(
          <button className ="" onClick={RecordingStart}>Start</button>
        )
      } */}

        {mediaBlobUrl && (
          <button class=" hover:bg-gray-400 text-gray-800 font-bold  rounded inline-flex items-center pr-[100px]">
            <span>
              <a href={mediaBlobUrl} download="ScreenRecording">
                <svg
                  class="fill-current w-4 h-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
                </svg>
              </a>
            </span>
          </button>
        )}
        {/* <video src={mediaBlobUrl} controls autoPlay loop /> */}
        <label className='autoSaverSwitch relative inline-flex cursor-pointer select-none items-center'>
        <input
          type='checkbox'
          name='autoSaver'
          className='sr-only'
          checked={isChecked}
          onChange={handleCheckboxChange}
        />
        <span
          className={`slider mr-3 flex h-[26px] w-[50px] items-center rounded-full p-1 duration-200 ${
            isChecked ? 'bg-red-500' : 'bg-[#CCCCCE]'
          }`}
        >
          <span
            className={`dot h-[18px] w-[18px] rounded-full bg-white duration-200 ${
              isChecked ? 'translate-x-6' : ''
            }`}
          ></span>
        </span>
        <span className='label flex items-center text-sm font-medium text-black'>
        {/* <span className='pl-1'> {isChecked ? 'Stop' : 'Start'} </span> */}
        </span>
      </label>
        {/* <div className="absolute right-[5px] top-0 ">
          {recording ? (
            <button onClick={stopRecording}>Stop </button>
          ) : (
            <button onClick={startRecording}>Start </button>
          )} */}
          {/* {mediaBlobUrl && (
        <a href={mediaBlobUrl} download="recording.webm">Download Recording</a>
      )} */}
        {/* </div> */}
      </div>
      <div className={styles.main}>
        <div className={styles.toppart}>
          <div className={playerContainerClass}>
            {screenStream && (
              // console.log("fe",screenvideo.id)

              <ReactPlayer
                url={screenStream}
                playing={true}
                width="100%"
                height="100%"
              />

              // <Player

              //   // width="100%"
              //   // height="100%"
              // />
            )}
            {Object.keys(nonHighlightedPlayers).map((playerId, index) => {
              const { url, muted, playing } = nonHighlightedPlayers[playerId];

              return (
                <>
                  {/* {console.log("frfsfsd",url)} */}
                  <Player
                    playerId={playerId}
                    url={url}
                    muted={muted}
                    playing={playing}
                    isActive={false}
                    name={data.find((item) => item.peerId === playerId)?.usname}
                    ishost ={ishost}
                    mictoggleuser={mictoggleuser}
                  />
                </>
              );
            })}

            {playerHighlighted && (
              // currstream ?(

              //   <Player
              //   url={currstream}
              //   muted={playerHighlighted.muted}
              //   playing={playerHighlighted.playing}
              //   isActive={true}
              //   name="Me"
              //   />
              // ):(
              <Player
                url={playerHighlighted.url}
                muted={playerHighlighted.muted}
                playing={playerHighlighted.playing}
                isActive={true}
                name="Me"
              />
              // )
            )}
            {/* <div>
              {screenvideo}
            </div> */}
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
                                  onClick={() => removeuser(item.peerId)}
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
          {showChat && (
            <div className={styles.chatcontainer}>
              <div className="flex flex-col-reverse   mt-5   overflow-auto  scrollbar-thin scrollbar-thumb-rounded-sm scrollbar-thumb-black">
                <div className="flex flex-col gap-2 mr-[5px]">
                  {mesuser.map((msg, index) =>
                    msg.ruser == user ? (
                      <div className="bg-primary flex flex-col self-end max-w-60 pb-1 border-[1px] border-black rounded-[30px] bg-zinc-700">
                        <p className="text-wrap m-1 p-1  word text-white ">
                          {msg.nmessages}
                        </p>
                      </div>
                    ) : (
                      <div
                        key={index}
                        className="bg-zinc-900 flex flex-col  max-w-60 border-[1.5px] border-white  w-fit rounded-2xl  p-2  text-white "
                      >
                        {msg.ruser ===
                          mesuser[index - 1 > 0 ? index - 1 : 0].ruser &&
                        index != 0 ? (
                          <span className=" bg-zinc-900  text-white  text-wrap word overflow-x-auto  pb-1 pt-1 rounded-2xl pl-0 ">
                            {msg.nmessages}
                          </span>
                        ) : (
                          <div>
                            <h1 className="font-semibold text-messageuse">
                              {" "}
                              {msg.ruser} :
                            </h1>
                            <span className=" bg-zinc-900  text-white  text-wrap word overflow-x-auto  pb-1 pt-1 rounded-2xl pl-0 ">
                              {msg.nmessages}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              <form className={styles.form} onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="enter message"
                  className={styles.input}
                  label="Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></input>

                <button type="submit" className="">
                  send
                </button>
              </form>
            </div>
          )}
        </div>
        <div className={styles.bottompart}>
          <div className="items-center justify-center">
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
            shareScreen={shareScreen}
            showScreen={showScreen}
            toggleChat={toggleChat}
            showChat={showChat}
            data={data}
            myId={myId}
            roomId={roomId}
            peer={peer}
            setCurrStream={setCurrStream}
          />
          {/* <ModeToggle/> */}
        </div>
        <div>
          {/* <h1>Select an Audio Input Device</h1>
          <div>
            <label htmlFor="device-select">Select Audio Input Device:</label>
            <select
              id="device-select"
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
            >
              <option value="">Default</option>
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Device ${device.deviceId}`}
                </option>
              ))}
            </select>
          </div> */}
          {/* <MediaComponent data= {data} myId={myId} roomId={roomId} peer ={peer} setCurrStream ={setCurrStream}/> */}

          {/* <AudioStream deviceId={selectedDeviceId} />
           */}
          {/* <button onClick={getAudioOutputDevice}>output</button>  */}
          {/* <AudioVisualizer /> */}
          {/* <video
        autoPlay
        ref={videoRef}
        style={{ width: '100%', height: 'auto' }}
      /> */}
        </div>
      </div>
    </>
  );
}

export default Chatroom;
