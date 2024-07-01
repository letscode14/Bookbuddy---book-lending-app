import createServer from "./framework/config/app";
import { connecDB } from "./framework/config/connectDB";
import { initSocketsever } from "./framework/config/socketServer";

import http from "http";
import { config } from "dotenv";
config();

const startServer = async () => {
  try {
    const app = createServer();
    const server = http.createServer(app);

    const port = process.env.PORT;

    initSocketsever(server);

    server?.listen(port, () => {
      console.log("server is running at port ", port);
    });

    await connecDB();
  } catch (error) {
    console.log(error);
  }
};

startServer();
