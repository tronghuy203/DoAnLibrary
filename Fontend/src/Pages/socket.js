import { io } from "socket.io-client";

let socket;

export const initSocket = () => {
  if (!socket || !socket.connected) {
    socket = io(process.env.REACT_APP_SERVER_URL, {
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