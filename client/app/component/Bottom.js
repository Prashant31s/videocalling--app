import cx from "classnames";
import { Video, VideoOff, ListCollapse, List, MessageSquareOff } from "lucide-react";

import styles from "./index.module.css";

const Bottom = (props) => {
  const {
    muted,
    playing,
    toggleAudio,
    toggleVideo,
    leaveRoom,
    toggleDataList,
    showDataList,
    shareScreen,
    toggleChat,
    showChat,
  } = props;

  return (
    <div className={styles.bottomMenu}>
      {muted ? (
        <button
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
      {playing ? (
        <Video className={styles.icon} size={55} onClick={toggleVideo} />
      ) : (
        <VideoOff
          className={cx(styles.icon, styles.active)}
          size={55}
          onClick={toggleVideo}
        />
      )}
      <button
        className="rounded-full w-[55px] bg-secondary items-center  p-3 fill-white hover:bg-buttonPrimary"
        onClick={leaveRoom}
      >
        <img
          src={`https://www.svgrepo.com/show/533302/phone-slash.svg`}
          alt="button icon"
          className={styles.whitesvg}
        />
      </button>

      {showDataList ? (
        <ListCollapse
          size={55}
          className="bg-black rounded-full text-white p-[10px] cursor-pointer hover:bg-secondary"
          onClick={toggleDataList}
        />
      ) : (
        <List
          size={55}
          className="bg-secondary rounded-full text-white p-[10px] cursor-pointer hover:bg-black"
          onClick={toggleDataList}
        />
      )}

      {showChat ? (
        <button
          className="rounded-full w-[55px] bg-black hover:bg-secondary items-center  p-3 text-white"
          onClick={toggleChat}
        >
          <img
            src={`https://cdn.iconscout.com/icon/premium/png-512-thumb/comment-balloon-off-slash-mute-8930794-7379670.png?f=webp&w=256`}
            alt="button icon "
            className={styles.whitesvg}
          />
        </button>
      ) : (
        // <MessageSquareOff/>
        <button
          className="rounded-full w-[55px] bg-secondary  hover:bg-black items-center  p-3 fill-white"
          onClick={toggleChat}
        >
          <img
            src={`https://www.svgrepo.com/show/500493/chat-dot-round.svg`}
            alt="button icon"
            className={styles.whitesvg}
          />
        </button>
      )}

      {shareScreen ? (
        <button
          className=" rounded-full w-[55px] bg-secondary items-center  p-3 fill-white hover:bg-black"
          onClick={shareScreen}
        >
          <img
            src={`https://static.thenounproject.com/png/4038430-200.png`}
            alt="button icon"
            className={styles.whitesvg}
          />
        </button>
      ) : (
        <button
          className=" rounded-full w-[55px] bg-black items-center  p-3 fill-white hover:bg-secondary"
          onClick={shareScreen}
        >
          <img
            src={`https://static.thenounproject.com/png/4038430-200.png`}
            alt="button icon"
            className={styles.whitesvg}
          />
        </button>
      )}
    </div>
  );
};

export default Bottom;
