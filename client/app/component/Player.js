import React from "react";
import ReactPlayer from "react-player";
import cx from "classnames";
import { Mic, MicOff } from "lucide-react";

import styles from "./index.module.css";

const Player = (props) => {
  const { url, muted, playing, isActive, name } = props;
  // console.log("url", url);
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
          <ReactPlayer
            url={url}
            muted={muted}
            playing={playing}
            width="100%"
            height="100%"
          />
          <p className={styles.username}>{name}</p>
        </>
      ) : (
        <p className={styles.notplayingusername}>{name}</p>
      )}

      {!isActive ? (
        muted ? (
          <>
            <MicOff className={styles.icon2} size={20} />
          </>
        ) : (
          <Mic className={styles.icon2} size={20} />
        )
      ) : undefined}
    </div>
  );
};

export default Player;
