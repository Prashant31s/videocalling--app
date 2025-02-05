import React, { useState, useEffect, useRef } from "react";
import socket from "../components/connect";
import styles from "./index.module.css";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

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

  const toggleVoice = () => {
    if(playing!=undefined){
      toggleAudio();
    }
    
  }

  const fetchDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      const video = devices.filter((device) => device.kind === "videoinput");
      const audio = devices.filter(
        (device) =>
          device.kind === "audioinput" && device.label.charAt(0) == "M"
      );
      setVideoDevices(video);
      setAudioDevices(audio);
      let videodeviceremoved = true;
      let audiodeviceremoved = true;

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

  useEffect(() => {
    if (deviceremoved === true) {
    }
  }, [deviceremoved]);
  useEffect(() => {
    fetchDevices(); // Initial fetch

    const handleDeviceChange = () => {
      console.log("device-change");
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
    if (mediaStream) {
      socket.emit("device-change", peerid, room);
      props.setCurrStream(mediaStream);

      for (let i = 0; i < props.data.length; i++) {
        if (props.data[i].peerId !== peerid && props.data[i].room === room) {
          const call = props.peer.call(props.data[i].peerId, mediaStream);
          console.log("changesssd");
          // Optionally handle `call` to manage the call, e.g., listen to events
        }
      }
    }
  }, [mediaStream]);

  return (
    <div className="flex flex-row gap-3">
      <div className="flex flex-row rounded-full bg-white items-center">
        <button
          title={muted ? "Turn on mic" : "Turn off mic"}
          className={`rounded-full w-[55px] h-14  flex items-center justify-center ${
            muted ? "bg-buttonPrimary" : "bg-secondary"
          } p-[12px] hover:bg-buttonPrimary text-white`}
          onClick={toggleVoice}
        >
          <img
            src={`https://www.svgrepo.com/show/${
              muted ? "448520/mic-off" : "448518/mic"
            }.svg`}
            alt="Mic Icon"
            className={styles.whitesvg}
          />
        </button>

        <Menu as="div" className="relative">
          <MenuButton className="inline-flex items-center gap-x-1.5 rounded-r-full bg-white px-[2px] py-2 text-sm font-semibold text-gray-900 shadow-sm   hover:bg-gray-50">
            <ChevronDownIcon className="h-10 w-8 text-gray-600" />
          </MenuButton>
          <MenuItems
            as="div"
            className="absolute bottom-full right-0  w-56 origin-bottom-right rounded-md bg-white shadow-lg  focus:outline-none z-10"
          >
            <div className="">
              {audioDevices.map((device) => (
                <MenuItem
                  key={device.deviceId}
                  onClick={() => setSelectedAudioDeviceId(device.deviceId)}
                >
                  {device.deviceId === selectedAudioDeviceId ? (
                    <button className="block w-full px-4 py-2 text-sm text-black hover:bg-gray-100 bg-gray-200  border-gray-500 rounded-md">
                      {device.label || "Unknown Microphone"}
                    </button>
                  ) : (
                    <button className="block w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                      {device.label || "Unknown Microphone"}
                    </button>
                  )}
                </MenuItem>
              ))}
            </div>
          </MenuItems>
        </Menu>
      </div>

      <div className="flex flex-row rounded-full bg-white items-center">
        <button
          className={`rounded-full w-[55px] h-14  flex items-center justify-center ${
            playing ? "bg-secondary" : "bg-buttonPrimary"
          } p-[12px] hover:bg-secondary text-white`}
          title={playing ? "Turn Off Video" : "Turn On Video"}
          onClick={toggleVideo}
        >
          <img
            src={`https://www.svgrepo.com/show/${
              playing ? "532727/video" : "521913/video-off"
            }.svg`}
            alt="Video Icon"
            className={styles.whitesvg}
          />
        </button>

        <Menu as="div" className="relative">
          <MenuButton className="inline-flex items-center gap-x-1.5 rounded-r-full bg-white px-[2px] py-2 text-sm font-semibold text-gray-900 shadow-sm  hover:bg-gray-50">
            <ChevronDownIcon className="h-10 w-8 text-gray-600" />
          </MenuButton>
          <MenuItems
            as="div"
            className="absolute bottom-full right-0 mt-1 w-56 origin-bottom-right rounded-md bg-white shadow-lg  focus:outline-none z-10"
          >
            <div className="">
              {videoDevices.map((device) => (
                <MenuItem
                  key={device.deviceId}
                  onClick={() => setSelectedVideoDeviceId(device.deviceId)}
                >
                  {device.deviceId === selectedVideoDeviceId ? (
                    <button className="block w-full px-4 py-2 text-sm text-black hover:bg-gray-100 bg-gray-200 rounded-md">
                      {device.label || "Unknown Camera"}
                    </button>
                  ) : (
                    <button className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                      {device.label || "Unknown Camera"}
                    </button>
                  )}
                </MenuItem>
              ))}
            </div>
          </MenuItems>
        </Menu>
      </div>
    </div>
  );
};

export default MediaComponent;
