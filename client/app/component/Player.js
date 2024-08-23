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
  const audioRef =useRef(null);
  // if(isActive){
  //   console.log("playerurl",url)
  // }
  // const [audiotrack,setAudioTrack]=useState();
  const [videotrack,setVideoTrack]=useState();
  if(ishost){
    console.log("i am host",playerId);
  }
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = url; // Assign the MediaStream to the video element
    }
    
    // if(!playing){
      const tracks = url.getTracks();
    const currtrack = tracks.find(track => track.kind === 'audio');
    const videtrack = tracks.find(track => track.kind === 'video');
    // setAudioTrack(currtrack);
    setVideoTrack(videtrack);
    console.log("uurrrrll",url);
    if(url instanceof MediaStream){
      
    }
    
    // if (videoTrack) {
    //   videoTrack.enabled = !videoTrack.enabled; // Toggle the video track
      
    // }
    // }
  }, [url,playing,muted]);

  useEffect(()=>{
    // if(!playing){
    if(videotrack){
       videotrack.enabled=playing
    }
    console.log("videotrack",videotrack);
      
    // }
    // else{

    // }
  },[playing,videotrack])

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
          {
               isActive ?(
                <video
                  ref={videoRef}
                  muted={true}
                  autoPlay
                  playsInline
                  width="100%"
                  height="100%"
                  
                  controls={false}
                />
    
              ):(
                <video
                  ref={videoRef}
                  muted={muted}
                  autoPlay
                  playsInline
                  width="100%"
                  height="100%"
                  
                  controls={false}
                />
    
              )
          }
       
           
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
          <audio ref={audioRef} muted ={muted} controls />
          {/* <video
                  // ref={videotrack}
                  url= {videotrack}
                  muted={muted}
                  autoPlay
                  playsInline
                  width="0%"
                  height="0%"
                  
                  controls={false}
                /> */}
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
