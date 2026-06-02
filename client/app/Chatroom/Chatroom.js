"use client";
import React, { useEffect, useState, useRef, Suspense } from "react";
import socket from "../components/connect";
import { useSearchParams } from "next/navigation";
import usePeer from "../hooks/usePeer";
import useMediaStream from "../hooks/useMediaStream";
import usePlayer from "../hooks/usePlayer";
import Player from "../component/Player";
import Bottom from "../component/Bottom";
import CopySection from "../component/CopySection";
import styles from "./Chatroom.module.css";
import { cloneDeep } from "lodash";
import { Mic, Send, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserHistory } from "history";
import ReactPlayer from "react-player";

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
    let playerContainerClass = styles.PlayerContainer;

    const [mesuser, setMesuser] = useState([]);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [receiveuser, setReceiveuser] = useState("");
    const [currscreenstream, setCurrScreenStream] = useState(null);

    const [mediaBlobUrl, setMediaBlobUrl] = useState(null);
    const chunksRef = useRef([]);
    const [changedevice, setChangeDevice] = useState(false);
    const [devicechangepeerId, setDeviceChangePeerId] = useState();

    const finalDestRef = useRef(null);
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
    } = usePlayer(myId, roomId, peer);

    const [recording, setRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioContextRef = useRef(null); // Persistent AudioContext
    const mediaStreamDestinationRef = useRef(null);
    const [isChecked, setIsChecked] = useState(false);
    let ishost = false;

    useEffect(() => {
        if (stream && players[myId]) {
            stream.getAudioTracks()[0].enabled = !players[myId].muted;
        }
    }, [stream, players]);

    useEffect(() => {
        history.listen((update) => {
            if (update.action === "POP") {
                if (screenStream) {
                    screenStream.getTracks().forEach((track) => track.stop());
                    setScreenStream(null);
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

    useEffect(() => {
        if (myId) {
            setMyidnew(myId);
        }
    }, [myId, myidnew]);
    useEffect(() => {
        if (!socket || !peer || !stream || !usernameApproved) return;
        const activeConnections = new Set();

        const handleUserConnected = (newUser, roomtohost, roomuser) => {
            // Prevent duplicate connection attempts
            if (activeConnections.has(newUser)) {
                console.log(`Connection already in progress for ${newUser}`);
                return;
            }
            activeConnections.add(newUser);

            const callStartTime = performance.now();
            console.log(`Initiating call to ${newUser}`);

            try {
                const call = peer.call(newUser, stream, {
                    metadata: { initiator: myId },
                });

                const streamTimeout = setTimeout(() => {
                    console.warn(
                        `Stream not received from ${newUser} after 8 seconds`,
                    );
                }, 8000);

                call.on("stream", (incomingStream) => {
                    clearTimeout(streamTimeout);
                    const callEndTime = performance.now();
                    console.log(
                        `Received stream from ${newUser} in ${(callEndTime - callStartTime).toFixed(2)}ms`,
                    );

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

                call.on("error", (error) => {
                    console.error(`Call error with ${newUser}:`, error);
                    activeConnections.delete(newUser);
                });

                call.on("close", () => {
                    activeConnections.delete(newUser);
                });

                updateAudioStreams(); // Adjust this function to add the new stream to the recording
            } catch (error) {
                console.error(`Error calling ${newUser}:`, error);
                activeConnections.delete(newUser);
            }
        };
        socket.on("user-connected", handleUserConnected); //a user is connected

        return () => {
            socket.off("user-connected", handleUserConnected);
            activeConnections.clear();
        };
    }, [peer, setPlayers, socket, stream, usernameApproved, myId]);

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
            setPlayers((prev) => {
                const copy = cloneDeep(prev);
                if (!copy[userId]) {
                    return;
                }
                copy[userId].url.getAudioTracks()[0].enabled =
                    copy[userId].muted;
                copy[userId].muted = !copy[userId].muted;

                return { ...copy };
            });
        };

        const handleToggleVideo = (userId) => {
            //function to handle if someone has changed its vedio status in the room
            setPlayers((prev) => {
                const copy = cloneDeep(prev);
                if (copy[userId]) {
                    copy[userId].playing = !copy[userId].playing; // changing the video status of that user so that it can be reflected on the screen
                }
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

        const handleIncomingCall = (call) => {
            // the peer wiil make a call and also receive the call in the room and set the incoming stream in players so thatit can be shown
            const { peer: callerId } = call;
            const answerStartTime = performance.now();

            try {
                call.answer(stream);
                console.log(`Answered call from ${callerId}`);
            } catch (error) {
                console.error(`Error answering call from ${callerId}:`, error);
                return;
            }

            const streamTimeout = setTimeout(() => {
                console.warn(
                    `Stream not received from ${callerId} after 8 seconds`,
                );
            }, 8000);

            call.on("stream", (incomingStream) => {
                clearTimeout(streamTimeout);
                const answerEndTime = performance.now();
                console.log(
                    `Stream from ${callerId} received in ${(answerEndTime - answerStartTime).toFixed(2)}ms`,
                );

                if (!check) {
                    setScreenStream(incomingStream);
                    setCurrScreenStream(incomingStream);
                    check = true;
                } else {
                    if (myId && callerId !== myidnew) {
                        let currvideo = true;
                        let curraudio = true;
                        // Optimize the lookup
                        const userdata = data.find(
                            (d) => d.peerId === callerId,
                        );
                        if (userdata) {
                            currvideo = userdata.video;
                            curraudio = userdata.audio;
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
                }
            });

            call.on("error", (error) => {
                console.error(`Error in call with ${callerId}:`, error);
                clearTimeout(streamTimeout);
            });
        };

        peer.on("call", handleIncomingCall);

        return () => {
            peer.off("call", handleIncomingCall);
        };
    }, [
        usernameApproved,
        peer,
        setPlayers,
        stream,
        players,
        myidnew,
        data,
        devicechangepeerId,
    ]);

    useEffect(() => {
        if (!usernameApproved || !stream || !myId) return;

        let audiostatus = true;
        let videostatus = true;

        for (let i = 0; i < data.length; i++) {
            if (data[i].peerId === myId) {
                audiostatus = data[i].audio;
                videostatus = data[i].video;
            }
        }
        if (currstream) {
            setPlayers((prev) => ({
                //users stream will be set into the player
                ...prev,
                [myId]: {
                    url: currstream,
                    muted: audiostatus,
                    playing: videostatus,
                },
            }));
        } else {
            setPlayers((prev) => ({
                //users stream will be set into the player
                ...prev,
                [myId]: {
                    url: stream,
                    muted: audiostatus,
                    playing: videostatus,
                },
            }));
        }
    }, [usernameApproved, myId, setPlayers, , currstream, data]);

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
    // xstream = null;

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
                const screenStreame =
                    await navigator.mediaDevices.getDisplayMedia({
                        video: true,
                    });
                setScreenStream(screenStreame);
                //xstream = screenStreame;
                setShowScreen(true);
                setScrShare(true);
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
            if (currscreenstream != screenStream && currscreenstream) {
                screenStream.getTracks().forEach((track) => track.stop());
                setScreenStream(currscreenstream);
                setShowScreen(false);
            }
            socket.emit("screen-share", roomId, myId);
            socket.on("answer", (allow, uid) => {
                if (allow && uid === myId) {
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].peerId != myId && data[i].room === roomId) {
                            const call = peer.call(
                                data[i].peerId,
                                screenStream,
                            );
                        }
                    }
                } else {
                    console.log("acceess denied");
                    return;
                }
            });
        }
        return () => {
            socket.off("answer");
        };
    }, [scrShare, players]);

    const handleCheckboxChange = () => {
        if (!isChecked) {
            startRecording();
        } else {
            stopRecording();
        }
    };

    const updateAudioStreams = () => {
        const dest = mediaStreamDestinationRef.current; // Use the existing MediaStreamDestination

        Object.keys(players).forEach((playerId) => {
            const { url, muted } = players[playerId];
            const stream = new MediaStream();

            if (muted) {
                url.getAudioTracks()[0].enabled = false;
            } else {
                url.getAudioTracks()[0].enabled = true;
            }

            const audioTracks = url.getAudioTracks();
            if (audioTracks.length > 0) {
                audioTracks.forEach((track) => {
                    stream.addTrack(track);
                });

                try {
                    const source =
                        audioContextRef.current.createMediaStreamSource(stream);
                    source.connect(dest); // Connect the new stream to the existing destination
                } catch (error) {
                    console.error(
                        `Failed to create MediaStreamSource for player ${playerId}:`,
                        error,
                    );
                }
            } else {
                console.warn(`Player ${playerId} has no audio tracks.`);
            }
        });

        finalDestRef.current = dest;
    };

    const startRecording = async () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new AudioContext();
        }
        if (!mediaStreamDestinationRef.current) {
            //destinationation to be connected with audio context
            mediaStreamDestinationRef.current =
                audioContextRef.current.createMediaStreamDestination();
        }

        const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: { mediaSource: "screen" },
            audio: false,
            selfBrowserSurface: "include",
            preferCurrentTab: true,
        });

        updateAudioStreams(); // Add all current streams to the ongoing recording

        const combinedStream = new MediaStream([
            ...screenStream.getVideoTracks(),
            ...mediaStreamDestinationRef.current.stream.getAudioTracks(),
        ]);

        const mediaRecorder = new MediaRecorder(combinedStream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: "video/webm" });
            const url = URL.createObjectURL(blob);
            setMediaBlobUrl(url);
            chunksRef.current = [];
            setIsChecked(false);
            screenStream.getTracks().forEach((track) => track.stop());
            combinedStream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.onstart = () => {
            setIsChecked(true); //runs only when recording is started properly to change button state
        };

        screenStream.oninactive = () => {
            mediaRecorder.stop();
            setRecording(false);
            setIsChecked(false);
        };

        mediaRecorder.start();
        setRecording(true);
    };

    useEffect(() => {
        if (isChecked) {
            updateAudioStreams();
        }
    }, [players]);

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    useEffect(() => {
        if (playerHighlighted && currstream) {
            playerHighlighted.url = currstream;
        }
    }, [currstream]);

    if (socket.id === roomhost) {
        ishost = true;
    }
    if (screenStream) {
        if (length <= 1) {
            playerContainerClass += ` ${styles.screenOne}`;
        } else if (length === 2) {
            playerContainerClass += ` ${styles.screenTwo}`;
        } else if (length === 3) {
            playerContainerClass += ` ${styles.screenThree}`;
        } else if (length === 4) {
            playerContainerClass += ` ${styles.screenFour}`;
        } else if (length === 5) {
            playerContainerClass += ` ${styles.screenFive}`;
        } else {
            playerContainerClass += ` ${styles.screenSix}`;
        }
    } else if (length === 1) {
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

    const roomParticipantCount =
        data.filter((item) => item.room === roomId).length || length;

    return (
        <>
            <div className={styles.main}>
                <div className={styles.roomHeader}>
                    <div
                        className={styles.participantCount}
                        aria-label={`${roomParticipantCount} participants in room`}
                        title={`${roomParticipantCount} participants`}
                    >
                        <Users size={18} strokeWidth={2.4} />
                        <span>{roomParticipantCount}</span>
                    </div>
                    <div className={styles.recordControls}>
                        {mediaBlobUrl && (
                            <button
                                className={styles.downloadButton}
                                title="Download recording"
                            >
                                <span>
                                    <a
                                        href={mediaBlobUrl}
                                        download="ScreenRecording"
                                    >
                                        <svg
                                            className="fill-current w-4 h-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
                                        </svg>
                                    </a>
                                </span>
                            </button>
                        )}

                        <label className="autoSaverSwitch relative inline-flex cursor-pointer select-none items-center">
                            <input
                                type="checkbox"
                                name="autoSaver"
                                className="sr-only"
                                checked={isChecked}
                                onChange={handleCheckboxChange}
                            />
                            <span
                                className={`${styles.recordSwitch} ${
                                    isChecked ? styles.recordingSwitch : ""
                                }`}
                            >
                                <span
                                    className={`${styles.recordDot} ${
                                        isChecked ? styles.recordingDot : ""
                                    }`}
                                ></span>
                            </span>
                        </label>
                    </div>
                </div>
                <div className={styles.toppart}>
                    {!playerHighlighted && (
                        <div className={styles.lobbyNotice}>
                            Waiting for your camera. Reload if your preview does
                            not appear.
                        </div>
                    )}
                    <div className={playerContainerClass}>
                        {screenStream && (
                            <div className={styles.screenShareTile}>
                                <ReactPlayer
                                    url={screenStream}
                                    playing={true}
                                    width="100%"
                                    height="100%"
                                />
                                <span className={styles.screenShareLabel}>
                                    Screen share
                                </span>
                            </div>
                        )}
                        {Object.keys(nonHighlightedPlayers).map(
                            (playerId, index) => {
                                const { url, muted, playing } =
                                    nonHighlightedPlayers[playerId];

                                return (
                                    <Player
                                        key={playerId}
                                        playerId={playerId}
                                        url={url}
                                        muted={muted}
                                        playing={playing}
                                        isActive={false}
                                        name={
                                            data.find(
                                                (item) =>
                                                    item.peerId === playerId,
                                            )?.usname
                                        }
                                        ishost={ishost}
                                        mictoggleuser={mictoggleuser}
                                    />
                                );
                            },
                        )}

                        {playerHighlighted && (
                            <Player
                                url={playerHighlighted.url}
                                muted={playerHighlighted.muted}
                                playing={playerHighlighted.playing}
                                isActive={true}
                                name="Me"
                            />
                            // )
                        )}
                    </div>
                    {showDataList && (
                        <div className={styles.datalist}>
                            {/*displaying the copysection containing the roomid and the list of all users in room */}

                            <div className={styles.panelHeader}>
                                <div>
                                    <span>Participants</span>
                                    <strong>{length}</strong>
                                </div>
                            </div>
                            <div className={styles.participantList}>
                                {data.map(
                                    (item, index) =>
                                        item.room === roomId && ( //will only show the participant of that particular room
                                            <div
                                                key={index}
                                                className={
                                                    styles.participantItem
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.participantMeta
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            styles.participantAvatar
                                                        }
                                                    >
                                                        {item.usname?.charAt(
                                                            0,
                                                        ) || "U"}
                                                    </span>
                                                    {item.sId === roomhost ? (
                                                        item.sId ===
                                                        socket.id ? (
                                                            <p
                                                                className={
                                                                    styles.participantName
                                                                }
                                                            >
                                                                {item.usname}
                                                                <span
                                                                    className={
                                                                        styles.hostBadge
                                                                    }
                                                                >
                                                                    Me, Host
                                                                </span>
                                                            </p>
                                                        ) : (
                                                            <p
                                                                className={
                                                                    styles.participantName
                                                                }
                                                            >
                                                                {item.usname}
                                                                <span
                                                                    className={
                                                                        styles.hostBadge
                                                                    }
                                                                >
                                                                    Host
                                                                </span>
                                                            </p>
                                                        )
                                                    ) : item.sId ===
                                                      socket.id ? (
                                                        <p
                                                            className={
                                                                styles.participantName
                                                            }
                                                        >
                                                            {item.usname}
                                                            <span
                                                                className={
                                                                    styles.hostBadge
                                                                }
                                                            >
                                                                Me
                                                            </span>
                                                        </p>
                                                    ) : (
                                                        <p
                                                            className={
                                                                styles.participantName
                                                            }
                                                        >
                                                            {item.usname}
                                                        </p>
                                                    )}

                                                    {socket.id === roomhost &&
                                                        item.sId !=
                                                            socket.id && ( //will only show the kick button to the host of the room
                                                            <div
                                                                className={
                                                                    styles.participantActions
                                                                }
                                                            >
                                                                <button
                                                                    className={
                                                                        styles.iconButton
                                                                    }
                                                                    onClick={() =>
                                                                        removeuser(
                                                                            item.peerId,
                                                                        )
                                                                    }
                                                                    title="Remove user"
                                                                >
                                                                    <img
                                                                        src={`https://www.svgrepo.com/show/246569/remove-user.svg`}
                                                                        alt="remove user"
                                                                        className={
                                                                            styles.whitesvg
                                                                        }
                                                                    />
                                                                </button>

                                                                {item.audio ===
                                                                    false && (
                                                                    <Mic
                                                                        size={
                                                                            20
                                                                        }
                                                                        className={
                                                                            styles.micIcon
                                                                        }
                                                                        onClick={() =>
                                                                            mictoggleuser(
                                                                                item.peerId,
                                                                            )
                                                                        }
                                                                        title="Unmute user"
                                                                    />
                                                                )}
                                                            </div>
                                                        )}
                                                </div>
                                            </div>
                                        ),
                                )}
                            </div>
                        </div>
                    )}
                    {showChat && (
                        <div className={styles.chatcontainer}>
                            <div className={styles.panelHeader}>
                                <div>
                                    <span>Room chat</span>
                                    <strong>{mesuser.length}</strong>
                                </div>
                            </div>
                            <div className={styles.chatMessages}>
                                <div className="flex flex-col gap-2">
                                    {mesuser.map((msg, index) =>
                                        msg.ruser == user ? (
                                            <div
                                                key={index}
                                                className={styles.ownMessage}
                                            >
                                                <p
                                                    className={
                                                        styles.messageText
                                                    }
                                                >
                                                    {msg.nmessages}
                                                </p>
                                            </div>
                                        ) : (
                                            <div
                                                key={index}
                                                className={styles.otherMessage}
                                            >
                                                {msg.ruser ===
                                                    mesuser[
                                                        index - 1 > 0
                                                            ? index - 1
                                                            : 0
                                                    ].ruser && index != 0 ? (
                                                    <span
                                                        className={
                                                            styles.messageText
                                                        }
                                                    >
                                                        {msg.nmessages}
                                                    </span>
                                                ) : (
                                                    <div>
                                                        <h1
                                                            className={
                                                                styles.messageAuthor
                                                            }
                                                        >
                                                            {msg.ruser}
                                                        </h1>
                                                        <span
                                                            className={
                                                                styles.messageText
                                                            }
                                                        >
                                                            {msg.nmessages}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>

                            <form
                                className={styles.chatForm}
                                onSubmit={handleSubmit}
                            >
                                <input
                                    type="text"
                                    placeholder="Message"
                                    className={styles.input}
                                    label="Message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                ></input>

                                <button type="submit" aria-label="Send message">
                                    <Send size={20} strokeWidth={2.4} />
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
                </div>
            </div>
        </>
    );
}

// export default Chatroom;
const LoadingFallback = () => <div>Loading chat...</div>;

// Wrapping Home component with Suspense in HomePage
export default function ChatPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <Chatroom />
        </Suspense>
    );
}
