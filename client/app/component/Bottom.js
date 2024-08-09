import cx from "classnames";
import {
  Video,
  VideoOff,
  ListCollapse,
  List,
  MessageSquareOff,
} from "lucide-react";

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
    showScreen,
    toggleChat,
    showChat,
  } = props;
  console.log("sharescreeeen value", showScreen);

  return (
    <div className={styles.bottomMenu}>
      {muted ? (
        <button
          title="Turn off mic"
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
          title="Turn on mic"
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
        <button
          className="rounded-full w-[55px] bg-secondary items-center  p-[12px] fill-white hover:bg-buttonPrimary"
          title="Turn Off Video"
          onClick={toggleVideo}
        >
          <img
            src={`https://www.svgrepo.com/show/521913/video-off.svg`}
            alt="button icon"
            className={styles.whitesvg}
          />
        </button>
      ) : (
        // <Video className={styles.icon} size={55} onClick={toggleVideo} />
        <button
          className="rounded-full w-[55px] bg-buttonPrimary items-center  p-2 fill-white hover:bg-secondary"
          title="Turn On Video"
          onClick={toggleVideo}
        >
          <img
            src={`https://www.svgrepo.com/show/532727/video.svg`}
            alt="button icon"
            className={styles.whitesvg}
          />
        </button>
      )}
      <button
        className="rounded-full w-[55px] bg-secondary items-center  p-3 fill-white hover:bg-buttonPrimary"
        title="End Call"
        onClick={leaveRoom}
      >
        <img
          src={`https://www.svgrepo.com/show/533302/phone-slash.svg`}
          alt="button icon"
          className={styles.whitesvg}
        />
      </button>

      {showDataList ? (
       <button
       title="Close Participants"
       className="rounded-full w-[55px] bg-black hover:bg-secondary items-center  p-[8px] text-white"
       onClick={toggleDataList}
     >
       <img
         src={`https://www.svgrepo.com/show/525995/list-cross-minimalistic.svg`}
         alt="button icon "
         className={styles.whitesvg}
       />
     </button>
      ) : (
        <button
        title="Open Participants"
        className="rounded-full w-[55px] bg-secondary hover:bg-black items-center  p-3 text-white"
        onClick={toggleDataList}
      >
        <img
          src={`https://www.svgrepo.com/show/532192/list.svg`}
          alt="button icon "
          className={styles.whitesvg}
        />
      </button>
      )}

      {showChat ? (
        <button
          title="Close Chat"
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
          title="Open Chat"
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

      {!showScreen ? (
        <button
          title="Start Screen Share"
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
          title="Close Screen Share"
          className=" rounded-full w-[55px] bg-black items-center  p-3 fill-white hover:bg-secondary"
          onClick={shareScreen}
        >
          <img
            src={`https://www.svgrepo.com/show/310201/video-person-off.svg`}
            alt="button icon"
            className={styles.whitesvg}
          />
        </button>
      )}
    </div>
  );
};

export default Bottom;
