// import { useEffect, useState } from 'react';

// const AudioStream = ({ deviceId }) => {
//   const [stream, setStream] = useState(null);

//   useEffect(() => {
//     const startStream = async () => {
//       if (deviceId) {
//         // Stop the existing stream if any
//         if (stream) {
//           stream.getTracks().forEach(track => track.stop());
//         }

//         try {
//           const newStream = await navigator.mediaDevices.getUserMedia({
//             audio: { deviceId: { exact: deviceId } }
//           });
//           setStream(newStream);
//         } catch (error) {
//           console.error('Error accessing audio device:', error);
//         }
//       }
//     };

//     startStream();

//     // Cleanup on component unmount or when deviceId changes
//     return () => {
//       if (stream) {
//         stream.getTracks().forEach(track => track.stop());
//       }
//     };
//   }, [deviceId]);

//   return (
//     <div>
//       {stream ? <p>Audio stream active</p> : <p>No stream active</p>}
//     </div>
//   );
// };

// export default AudioStream;
