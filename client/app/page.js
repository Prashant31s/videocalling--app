"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    AlertCircle,
    ArrowRight,
    MessageCircle,
    MonitorUp,
    Radio,
    ShieldCheck,
    UserRound,
    Video,
} from "lucide-react";

export default function Home() {
    const [roomName, setRoomName] = useState("");
    const [userName, setUsername] = useState("");
    const [hasPermission, setHasPermission] = useState(null); // <-- Add this
    const [isMobileDeviceError, setIsMobileDeviceError] = useState(false);

    const router = useRouter();

    function userjoin() {
        if (userName && roomName) {
            router.push(`/Chatroom?user=${userName}&room=${roomName}`);
        }
    }

    async function checkMediaPermissions() {
        try {
            await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });
            return true;
        } catch (err) {
            return false;
        }
    }
    function isMobileDevice() {
        return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent,
        );
    }

    useEffect(() => {
        async function getPermission() {
            const isPermission = await checkMediaPermissions();
            setHasPermission(isPermission); // <-- Store in state
            console.log("is permission", isPermission);
        }
        getPermission();

        if (isMobileDevice()) {
            setIsMobileDeviceError(true);
        } else {
            setIsMobileDeviceError(false);
        }
    }, []);

    return (
        <main className="loginPage">
            <section className="loginShell">
                <div className="loginIntro">
                    <div className="brandMark">
                        <Video size={24} />
                    </div>
                    <p className="eyebrow">OMNIMEET</p>
                    <h1>Join a call without the clutter.</h1>
                    <p className="introCopy">
                        Enter your name and room code to continue into a focused
                        video room.
                    </p>

                    <div className="featureGrid">
                        <div>
                            <MessageCircle size={18} />
                            <span>Room chat</span>
                        </div>
                        <div>
                            <MonitorUp size={18} />
                            <span>Screen share</span>
                        </div>
                        <div>
                            <Radio size={18} />
                            <span>Recording</span>
                        </div>
                    </div>
                </div>

                <div className="joinCard">
                    <div className="joinHeader">
                        <span>Join room</span>
                        <strong>
                            {hasPermission === null
                                ? "Checking"
                                : hasPermission
                                  ? "Ready"
                                  : "Blocked"}
                        </strong>
                    </div>

                    <div className="statusStack">
                        {isMobileDeviceError && (
                            <div className="statusMessage warning">
                                <AlertCircle size={18} />
                                <span>
                                    Some features are not supported on mobile
                                    devices.
                                </span>
                            </div>
                        )}

                        {hasPermission === null && (
                            <div className="statusMessage neutral">
                                <ShieldCheck size={18} />
                                <span>
                                    Checking camera and microphone permissions.
                                </span>
                            </div>
                        )}

                        {hasPermission === false && (
                            <div className="statusMessage error">
                                <AlertCircle size={18} />
                                <span>
                                    Give camera and microphone permission to
                                    proceed.
                                </span>
                            </div>
                        )}
                    </div>

                    <label className="inputGroup">
                        <span>Your name</span>
                        <div>
                            <UserRound size={18} />
                            <input
                                placeholder="Username"
                                value={userName}
                                maxLength={8}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </label>

                    <label className="inputGroup">
                        <span>Room code</span>
                        <div>
                            <Video size={18} />
                            <input
                                placeholder="Room"
                                value={roomName}
                                maxLength={5}
                                onChange={(e) => setRoomName(e.target.value)}
                            />
                        </div>
                    </label>

                    <button
                        className="joinButton"
                        onClick={() => userjoin()}
                        disabled={!hasPermission || !userName || !roomName}
                    >
                        Enter room
                        <ArrowRight size={18} />
                    </button>
                </div>
            </section>
        </main>
    );
}
