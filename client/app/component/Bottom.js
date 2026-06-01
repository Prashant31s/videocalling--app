import styles from "./index.module.css";
import MediaComponent from "./MediaComponent";
import { ScreenShare, ScreenShareOff } from "lucide-react";

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
        data,
        myId,
        roomId,
        peer,
        setCurrStream,
    } = props;

    return (
        <div className={styles.bottomMenu}>
            <MediaComponent
                data={data}
                myId={myId}
                roomId={roomId}
                peer={peer}
                setCurrStream={setCurrStream}
                muted={muted}
                playing={playing}
                toggleAudio={toggleAudio}
                toggleVideo={toggleVideo}
            />

            <button
                className={`${styles.menuButton} rounded-full w-[55px] bg-red-600 items-center p-3 fill-white hover:bg-red-500`}
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
                    className={`${styles.menuButton} rounded-full w-[55px] bg-teal-600 hover:bg-teal-500 items-center p-[8px] text-white`}
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
                    className={`${styles.menuButton} rounded-full w-[55px] bg-slate-700 hover:bg-teal-600 items-center p-3 text-white`}
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
                    className={`${styles.menuButton} rounded-full w-[55px] bg-teal-600 hover:bg-teal-500 items-center p-3 text-white`}
                    onClick={toggleChat}
                >
                    <img
                        src={`https://cdn.iconscout.com/icon/premium/png-512-thumb/comment-balloon-off-slash-mute-8930794-7379670.png?f=webp&w=256`}
                        alt="button icon "
                        className={styles.whitesvg}
                    />
                </button>
            ) : (
                <button
                    title="Open Chat"
                    className={`${styles.menuButton} rounded-full w-[55px] bg-slate-700 hover:bg-teal-600 items-center p-3 fill-white`}
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
                    className={`${styles.menuButton} rounded-full w-[55px] bg-slate-700 flex items-center justify-center p-3 text-white hover:bg-teal-600`}
                    onClick={shareScreen}
                >
                    <ScreenShare size={24} strokeWidth={2.3} />
                </button>
            ) : (
                <button
                    title="Close Screen Share"
                    className={`${styles.menuButton} rounded-full w-[55px] bg-teal-600 flex items-center justify-center p-3 text-white hover:bg-teal-500`}
                    onClick={shareScreen}
                >
                    <ScreenShareOff size={24} strokeWidth={2.3} />
                </button>
            )}
        </div>
    );
};

export default Bottom;
