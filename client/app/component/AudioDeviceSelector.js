import { useEffect, useState } from 'react';

export default function AudioDeviceSelector() {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [stream, setStream] = useState(null);

  useEffect(() => {
    // Function to get the list of audio input devices
    const getDevices = async () => {
      try {
        const deviceInfos = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = deviceInfos.filter(device => device.kind === 'audioinput');
        setDevices(audioDevices);
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    };

    getDevices();
  }, []);

  useEffect(() => {
    // Function to start audio stream from selected device
    const startStream = async () => {
      if (selectedDeviceId) {
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({
            audio: { deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined },
          });
          setStream(newStream);
        } catch (error) {
          console.error('Error accessing the audio device:', error);
        }
      }
    };

    startStream();
   // console.log("nnnnnn",stream);

    // Cleanup on component unmount
    return () => {
      if (stream) {
        console.log("nnnnnn",stream);
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedDeviceId]);

  return (
    <div>
      <label htmlFor="device-select">Select Audio Input Device:</label>
      <select
        id="device-select"
        value={selectedDeviceId}
        onChange={(e) => setSelectedDeviceId(e.target.value)}
      >
        <option value="">Default</option>
        {devices.map(device => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Device ${device.deviceId}`}
          </option>
        ))}
      </select>
    </div>
  );
}
