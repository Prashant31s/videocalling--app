import { useState, useEffect, useRef } from "react";
const useMediaStream = () => {
    const [state, setState] = useState(null);
    const isStreamSet = useRef(false);

    useEffect(() => {
        if (isStreamSet.current) return;
        isStreamSet.current = true;
        (async function initStream() {
            try {
                const startTime = performance.now();
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    },
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: "user",
                    },
                });
                const endTime = performance.now();
                console.log(
                    `Media stream acquired in ${(endTime - startTime).toFixed(2)}ms`,
                );
                setState(stream);
            } catch (e) {
                console.log("Error acquiring media stream:", e);
            }
        })();
    }, []);

    return {
        stream: state,
    };
};

export default useMediaStream;
