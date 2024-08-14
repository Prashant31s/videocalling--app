import React, { useState, useEffect, useRef } from 'react';
import socket from '../components/connect';
import ReactPlayer from 'react-player';


const MediaComponent = (props) => {
  const [videoDevices, setVideoDevices] = useState([]);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState('');
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState('');
  const [mediaStream, setMediaStream] = useState(null);
  const videoRef = useRef(null);
  const peerid = props.myId;
  const room = props.roomId;

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const video = devices.filter(device => device.kind === 'videoinput');
        const audio = devices.filter(device => device.kind === 'audioinput');
        setVideoDevices(video);
        setAudioDevices(audio);
      } catch (error) {
        console.error('Error enumerating devices:', error);
      }
    };

    fetchDevices();
  }, []);

  useEffect(() => {
    const getMediaStream = async () => {
      if (selectedVideoDeviceId || selectedAudioDeviceId) {
        try {
          const constraints = {
            video: selectedVideoDeviceId ? { deviceId: { exact: selectedVideoDeviceId } } : true,
            audio: selectedAudioDeviceId ? { deviceId: { exact: selectedAudioDeviceId } } : true
          };

          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          setMediaStream(stream);

          // Ensure the video element is updated with the new stream
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error getting user media:', error);
        }
      }
    };

    getMediaStream();
  }, [selectedVideoDeviceId, selectedAudioDeviceId]);

  useEffect(() => {
    // console.log("grd",videoRef.current.srcObject);
    if (mediaStream) {
      socket.emit("device-change", peerid, room);

      for (let i = 0; i < props.data.length; i++) {
        if (props.data[i].peerId !== peerid && props.data[i].room === room) {
          const call = props.peer.call(props.data[i].peerId, mediaStream);
          // Optionally handle `call` to manage the call, e.g., listen to events
        }
      }
    }
  }, [mediaStream]);

  return (
    <div>
      <h2>Select Video Device</h2>
      <select onChange={(e) => setSelectedVideoDeviceId(e.target.value)} value={selectedVideoDeviceId}>
        <option value="">Default</option>
        {videoDevices.map(device => (
          <option key={device.deviceId} value={device.deviceId}>{device.label || 'Unknown Camera'}</option>
        ))}
      </select>

      <h2>Select Audio Device</h2>
      <select onChange={(e) => setSelectedAudioDeviceId(e.target.value)} value={selectedAudioDeviceId}>
        <option value="">Default</option>
        {audioDevices.map(device => (
          <option key={device.deviceId} value={device.deviceId}>{device.label || 'Unknown Microphone'}</option>
        ))}
      </select>

      <h2>Video Output</h2>
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
