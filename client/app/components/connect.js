import { io } from 'socket.io-client';
const socket =io.connect("https://videocalling-app.onrender.com")
export default socket
