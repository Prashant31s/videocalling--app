import React, { useEffect, useState, useRef } from "react";
import cx from "classnames";
import { Mic, MicOff } from "lucide-react";
import AudioVisualizer from "./AudioVisualiser";

import styles from "./index.module.css";
import { ReactMediaRecorder } from "react-media-recorder";
import ReactPlayer from "react-player";

const Player = (props) => {
  const { url, muted, playing, isActive, name } = props;
  const videoRef = useRef(null);

  useEffect(() => {
    if (url instanceof MediaStream && videoRef.current) {
      videoRef.current.srcObject = url;
    }
  }, [url]);

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
          {/* {url instanceof MediaStream ? (
            <video
              ref={videoRef}
              muted={muted}
              autoPlay
              playsInline
              width="100%"
              height="100%"
              controls={false}
            />
          ) : ( */}
            <ReactPlayer
              url={url}
              muted={muted}
              playing={playing}
              width="100%"
              height="100%"
            />
          {/* )} */}
          <p className={styles.username}>{name}</p>
        </>
      ) : (
        <>
          {!muted && !isActive && <AudioVisualizer stream={url} />}
          <p className={styles.notplayingusername}>{name.charAt(0)}</p>
        </>
      )}

      {!isActive ? (
        muted ? (
          <MicOff className={styles.icon2} size={20} />
        ) : (
          <Mic className={styles.icon2} size={20} />
        )
      ) : undefined}
    </div>
  );
};

export default Player;
