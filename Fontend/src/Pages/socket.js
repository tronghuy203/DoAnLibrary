import { io } from "socket.io-client";

let socket;

export const initSocket = () => {
  if (!socket || !socket.connected) {
    socket = io("http://localhost:8000", {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export default initSocket();