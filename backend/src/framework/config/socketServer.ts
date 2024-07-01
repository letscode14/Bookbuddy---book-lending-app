import { Server as socketServer } from "socket.io";
import http from "http";

export const initSocketsever = (server: http.Server) => {
  const io = new socketServer(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    console.log("A user is connected", socket.id);

    socket.on("clicked", (data) => {
      console.log(data);
    });

    socket.on("disconnect", () => {
      console.log("A user is disconnected");
    });
  });
};
