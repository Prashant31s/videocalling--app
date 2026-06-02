import socket from "../components/connect";
import { useSearchParams } from "next/navigation";

const { useState, useEffect, useRef } = require("react");

const usePeer = () => {
    const searchParams = useSearchParams();

    const roomId = searchParams.get("room");
    const [peer, setPeer] = useState(null);
    const [myId, setMyId] = useState("");
    const isPeerSet = useRef(false);
    const connectionTimeoutRef = useRef(null);

    // Initialize peer eagerly (before entering room) to gather ICE candidates
    useEffect(() => {
        if (isPeerSet.current) return;
        isPeerSet.current = true;

        const peerConfig = {
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" },
                { urls: "stun:stun2.l.google.com:19302" },
                { urls: "stun:stun3.l.google.com:19302" },
                { urls: "stun:stun4.l.google.com:19302" },
            ],
        };

        (async function initPeer() {
            try {
                const PeerJS = await import("peerjs");
                const myPeer = new PeerJS.default({
                    config: { iceServers: peerConfig.iceServers },
                });
                setPeer(myPeer);

                const startTime = performance.now();
                myPeer.on("open", (id) => {
                    const endTime = performance.now();
                    console.log(
                        `Peer connection established in ${(endTime - startTime).toFixed(2)}ms, ID: ${id}`,
                    );
                    setMyId(id);
                    // Room joining is handled separately in the useEffect below
                });

                // Timeout fallback - if peer doesn't open in 10 seconds, try reinitializing
                connectionTimeoutRef.current = setTimeout(() => {
                    console.warn(
                        "Peer connection timeout - attempting reinitialize",
                    );
                }, 10000);

                myPeer.on("error", (err) => {
                    console.error("Peer connection error:", err);
                });
            } catch (error) {
                console.error("Error initializing PeerJS:", error);
            }
        })();

        return () => {
            if (connectionTimeoutRef.current) {
                clearTimeout(connectionTimeoutRef.current);
            }
        };
    }, []);

    // Handle room joining separately
    useEffect(() => {
        if (myId && roomId && socket && peer) {
            console.log("Joining room:", roomId);
            socket.emit("join-room", roomId, myId);
        }
    }, [myId, roomId, socket, peer]);

    return {
        peer,
        myId,
    };
};

export default usePeer;
