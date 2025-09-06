import React, { useEffect, useState, useRef } from "react";
import cx from "classnames";
import { Mic, MicOff } from "lucide-react";
import AudioVisualizer from "./AudioVisualiser";
import styles from "./index.module.css";

const Player = (props) => {
  const {
    playerId,
    url,
    muted,
    playing,
    isActive,
    name,
    ishost,
    mictoggleuser,
  } = props;
  const videoRef = useRef(null);

  const [videoTrack, setVideoTrack] = useState(null);
  const [audioTrack, setAudioTrack] = useState(null);
  if (ishost) {
    console.log("i am host", playerId);
  }
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = url; // Assign the MediaStream to the video element

      const videoTracks = url.getVideoTracks();
      const audioTracks = url.getAudioTracks();
      if (videoTracks.length > 0) {
        setVideoTrack(videoTracks[0]);
      }

      if (audioTracks.length > 0) {
        setAudioTrack(audioTracks[0]);
      }
    }
  }, [url, playing, muted]);

  useEffect(() => {
    if (videoTrack) {
      if (playing) {
        videoTrack.enabled = true; // Enable video when playing
      } else {
        videoTrack.enabled = false; // Disable video when not playing
      }
    }
  }, [playing, videoTrack]);

  return (
    <div
      className={cx(styles.playerContainer, {
        [styles.notActive]: !isActive,
        [styles.active]: isActive,
        [styles.notPlaying]: !playing,
      })}
    >
      {playing ? (
        <>
          {isActive ? (
            <video
              ref={videoRef}
              muted={true}
              autoPlay
              playsInline
              width="100%"
              height="100%"
              controls={false}
            />
          ) : (
            <video
              ref={videoRef}
              muted={muted}
              autoPlay
              playsInline
              width="100%"
              height="100%"
              controls={false}
            />
          )}

          <p className={styles.username}>{name}</p>
        </>
      ) : (
        <>
          {!muted && !isActive && <AudioVisualizer stream={url} />}
          <p className={styles.notplayingusername}>{name?.charAt(0)}</p>
          <div className="-z-50">
            <video
              ref={videoRef}
              muted={muted}
              autoPlay
              playsInline
              width="0%"
              height="0%"
              style={{ display: !playing ? "none" : "block" }}
              controls={false}
            />
          </div>
        </>
      )}

      {!isActive ? (
        ishost ? (
          muted ? (
            <MicOff className={styles.icon2} size={20} />
          ) : (
            <Mic
              className={styles.icon2}
              size={20}
              onClick={() => mictoggleuser(playerId)}
            />
          )
        ) : muted ? (
          <MicOff className={styles.icon2} size={20} />
        ) : (
          <Mic className={styles.icon2} size={20} />
        )
      ) : undefined}
    </div>
  );
};

export default Player;
