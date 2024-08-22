import React, { useState, useEffect, useRef } from "react";
import socket from "../components/connect";
import ReactPlayer from "react-player";
import styles from "./index.module.css";

const MediaComponent = (props) => {
  const [videoDevices, setVideoDevices] = useState([]);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState("");
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState("");
  const [mediaStream, setMediaStream] = useState(null);
  const [deviceremoved, setDeviceRemoved] = useState(false);
  const videoRef = useRef(null);
  const peerid = props.myId;
  const room = props.roomId;
  const playing = props.playing;
  const toggleAudio = props.toggleAudio;
  const toggleVideo = props.toggleVideo;
  const muted = props.muted;

  // useEffect(() => {
  const fetchDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      // console.log("devices",devices);
      const video = devices.filter((device) => device.kind === "videoinput");
      const audio = devices.filter(
        (device) =>
          device.kind === "audioinput" && device.label.charAt(0) == "M"
      );
      setVideoDevices(video);
      setAudioDevices(audio);
      let videodeviceremoved = true;
      let audiodeviceremoved = true;
      console.log("audio",audio);
      for (let i = 0; i < devices.length; i++) {
        if (devices.id === selectedAudioDeviceId) {
          audiodeviceremoved = false;
        }
        if (devices.id === selectedVideoDeviceId) {
          videodeviceremoved = false;
        }
      }
      if (audiodeviceremoved) {
        setSelectedAudioDeviceId(audio[0].deviceId);
      }
      if (audiodeviceremoved) {
        setSelectedVideoDeviceId(video[0].deviceId);
      }
    } catch (error) {
      console.error("Error enumerating devices:", error);
    }
  };

  // fetchDevices();
  // }, []);
  useEffect(() => {
    if (deviceremoved === true) {
    }
  }, [deviceremoved]);
  useEffect(() => {
    fetchDevices(); // Initial fetch

    const handleDeviceChange = () => {
      fetchDevices();
    };

    navigator.mediaDevices.ondevicechange = handleDeviceChange;

    // Cleaning up the event listener on component unmount
    return () => {
      navigator.mediaDevices.ondevicechange = null;
    };
  }, []);
  useEffect(() => {
    // Cleaningup previous media stream when new one is set
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaStream]);

  useEffect(() => {
    const getMediaStream = async () => {
      if (selectedVideoDeviceId || selectedAudioDeviceId) {
        try {
          const constraints = {
            video: selectedVideoDeviceId
              ? { deviceId: { exact: selectedVideoDeviceId } }
              : true,
            audio: selectedAudioDeviceId
              ? { deviceId: { exact: selectedAudioDeviceId } }
              : true,
          };

          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          setMediaStream(stream);

          // Ensure the video element is updated with the new stream
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error("Error getting user media:", error);
        }
      }
    };

    getMediaStream();
  }, [selectedVideoDeviceId, selectedAudioDeviceId]);

  useEffect(() => {
    // console.log("grd",videoRef.current.srcObject);
    if (mediaStream) {
      socket.emit("device-change", peerid, room);
      props.setCurrStream(mediaStream);

      for (let i = 0; i < props.data.length; i++) {
        if (props.data[i].peerId !== peerid && props.data[i].room === room) {
          const call = props.peer.call(props.data[i].peerId, mediaStream);
          // Optionally handle `call` to manage the call, e.g., listen to events
        }
      }
    }
  }, [mediaStream]);

  return (
    <div className="flex flex-row gap-[15px]">
      <div className="flex flex-row rounded-[110px] bg-white">
        {muted ? (
          <button
            title="Turn off mic"
            className="rounded-full w-[55px] bg-buttonPrimary hover:bg-secondary items-center  p-3 text-white"
            onClick={toggleAudio}
          >
            <img
              src={`https://www.svgrepo.com/show/448520/mic-off.svg`}
              alt="button icon "
              className={styles.whitesvg}
            />
          </button>
        ) : (
          <button
            title="Turn on mic"
            className="rounded-full w-[55px] bg-secondary  hover:bg-buttonPrimary items-center  p-3 fill-white"
            onClick={toggleAudio}
          >
            <img
              src={`https://www.svgrepo.com/show/448518/mic.svg`}
              alt="button icon"
              className={styles.whitesvg}
            />
          </button>
        )}

        <select
          className="w-[55px] h-full rounded-r-[55px]"
          onChange={(e) => setSelectedAudioDeviceId(e.target.value)}
          value={selectedAudioDeviceId}
        >
          {audioDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || "Unknown Microphone"}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-row rounded-full bg-white">
        {playing ? (
          <button
            className="rounded-full w-[55px] bg-secondary items-center  p-[12px] fill-white hover:bg-buttonPrimary"
            title="Turn Off Video"
            onClick={toggleVideo}
          >
            <img
              src={`https://www.svgrepo.com/show/521913/video-off.svg`}
              alt="button icon"
              className={styles.whitesvg}
            />
          </button>
        ) : (
          // <Video className={styles.icon} size={55} onClick={toggleVideo} />
          <button
            className="rounded-full w-[55px] bg-buttonPrimary items-center  p-2 fill-white hover:bg-secondary"
            title="Turn On Video"
            onClick={toggleVideo}
          >
            <img
              src={`https://www.svgrepo.com/show/532727/video.svg`}
              alt="button icon"
              className={styles.whitesvg}
            />
          </button>
        )}
        
        <select
          className="w-[55px] rounded-r-[55px] "
          onChange={(e) => setSelectedVideoDeviceId(e.target.value)}
          value={selectedVideoDeviceId}
        >
          {videoDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || "Unknown Camera"}
            </option>
          ))}
        </select>
      </div>

      {/* <h2>Video Output</h2> */}
      {/* <ReactPlayer
                url={videoRef}
                playing={true}
                width="100%"
                height="100%"
              /> */}
      {/* <video
        autoPlay
        ref={videoRef}
        style={{ width: '100%', height: 'auto' }}
      /> */}
    </div>
  );
};

export default MediaComponent;
