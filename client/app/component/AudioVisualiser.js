import { Radius } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const AudioVisualizer = ({ stream }) => {
    // const [shade, setShade] = useState('transparent'); // Default to transparent
    const [width,setWidth]=useState('50%');
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);

    useEffect(() => {
        if (!stream) return; // Exit if no stream is provided

        // Initialize audio context and stream
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyserRef.current = analyser;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        // Function to update visual indicator based on audio volume
        const updateAudioStatus = () => {
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(dataArray);

            const averageVolume = dataArray.reduce((sum, value) => sum + value) / dataArray.length;

            // Map the volume to a grayscale color
            // const volumeThreshold = 50; // Adjust this threshold as needed
            const volumePercentage = Math.min(1, averageVolume /50);
            // const grayValue = Math.round(255 * (1 - volumePercentage)); 
            // const shade = `rgba(52, 58, 64)`;
            const widthtoset= Math.min(225,150*(1+volumePercentage)); 
            // setShade(shade);
            
            setWidth(widthtoset);
            
            requestAnimationFrame(updateAudioStatus);
        };

        // Start updating the audio status
        updateAudioStatus();

        // Clean up on component unmount
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, [stream]);
    // useEffect(() => {
    //     const canvas = canvasRef.current;
    //     // const canvasCtx = canvas.getContext('2d');

    //     // const drawCircle = () => {
    //     //     const radius = canvas.width / 2;
    //     //     canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    //     //     canvasCtx.beginPath();
    //     //     canvasCtx.arc(radius, radius, radius, 0, Math.PI * 2, false);
    //     //     canvasCtx.fillStyle = shade;
    //     //     canvasCtx.fill();
    //     // };

    //     drawCircle();
    //     // Redraw circle when the shade changes
    // }, [shade]);


    return (
        <div
            style={{
                position: '',
                top: 0,
                left: 0,
                width: width,
                height: width,
                pointerEvents: 'none',
                background: '#343a40',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'background 0.1s ease',
                borderRadius: width,
                
            }}
        >
            {/* Optional: Display text or icon if needed */}
            {/* <canvas
                ref={canvasRef}
                width={100}
                height={100}
                style={{
                    borderRadius: '50%', // Makes the canvas circular
                    overflow: 'hidden',
                    border: '1px solid black', // Optional border
                }}
            /> */}
        </div>
    );
};

export default AudioVisualizer;