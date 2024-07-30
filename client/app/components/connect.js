import { io } from 'socket.io-client';
const socket =io.connect("http://192.168.1.195:8080")
export default socket