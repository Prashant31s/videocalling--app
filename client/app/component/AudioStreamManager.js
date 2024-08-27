import React, { useState, useEffect, useRef } from 'react';

function AudioStreamManager({ players }) {
  const audioContextRef = useRef(null);
  const masterGainRef = useRef(null);
  const sourcesRef = useRef(new Map()); // Map to store MediaStreamAudioSourceNodes

  useEffect(() => {
    // Initialize AudioContext and GainNode
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    masterGainRef.current = audioContextRef.current.createGain();
    masterGainRef.current.connect(audioContextRef.current.destination);

    return () => {
      // Cleanup on component unmount
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    // Function to add a MediaStream
    const addMediaStream = (mediaStream) => {
      // Extract and connect only audio tracks
      const audioTracks = mediaStream.url.getAudioTracks();
      if (audioTracks.length > 0) {
        const audioContext = audioContextRef.current;
        const masterGain = masterGainRef.current;

        // Create a MediaStreamAudioSourceNode for the audio tracks
        const source = audioContext.createMediaStreamSource(mediaStream.url);
        source.connect(masterGain);

        // Store the source by stream ID
        sourcesRef.current.set(mediaStream.id, source);
      }
    };

    // Function to remove a MediaStream
    const removeMediaStream = (mediaStream) => {
      const source = sourcesRef.current.get(mediaStream.id);
      if (source) {
        source.disconnect(masterGainRef.current);
        sourcesRef.current.delete(mediaStream.id); // Remove the source from the map
      }
    };

    // Add new streams
    Object.values(players).forEach(mediaStream => addMediaStream(mediaStream));

    // Cleanup removed streams
    return () => {
      Object.values(players).forEach(mediaStream => removeMediaStream(mediaStream));
    };
  }, [players]);

  return (
    <div>
      <h1>Audio Stream Manager</h1>
      <p>Total Audio Streams: {sourcesRef.current.size}</p>
    </div>
  );
}

export default AudioStreamManager;
