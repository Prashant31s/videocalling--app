import React, { useEffect, useState, useRef } from "react";
import cx from "classnames";
import { Mic, MicOff } from "lucide-react";
import AudioVisualizer from "./AudioVisualiser";

import styles from "./index.module.css";
import { ReactMediaRecorder } from "react-media-recorder";
import ReactPlayer from "react-player";

const Player = (props) => {
  const { playerId ,url, muted, playing, isActive, name, ishost,mictoggleuser} = props;
  const videoRef = useRef(null);
  // if(isActive){
  //   console.log("playerurl",url)
  // }
  
  if(ishost){
    console.log("i am host",playerId);
  }
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = url; // Assign the MediaStream to the video element
    }
  }, [url,playing,muted]);

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
          {/* {url instanceof MediaStream ? ( */}
            <video
              ref={videoRef}
              muted={muted}
              autoPlay
              playsInline
              width="100%"
              height="100%"
              controls={false}
            />
          {/* ) : ( */}
            {/* <ReactPlayer
            key ={url}
              url={url}
              muted={muted}
              playing={playing}
              width="100%"
              height="100%"
            /> */}
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
        
          ishost ? (
            muted ? (
              <MicOff className={styles.icon2} size={20}  />
            ) : (
              <Mic className={styles.icon2} size={20} onClick={() => mictoggleuser(playerId)} />
            )
          //   <Mic
          //   size={20}
          //   className={styles.icon2}
          //   onClick={() => mictoggleuser(item.userid)} //will exectute the remove user function for that kicked userid
          // />

          ):(
            muted ? (
              <MicOff className={styles.icon2} size={20} />
            ) : (
              <Mic className={styles.icon2} size={20} />
            )

          )
        
        
        
      ) : undefined}
    </div>
  );
};

export default Player;
