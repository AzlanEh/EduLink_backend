import dotenv from "dotenv";
import http from "http";
import { app } from "./app.js";
import connectToDB from "./db/index.js";

dotenv.config({
  path: "./.env",
});

const server = http.createServer(app);

connectToDB()
  .then(() => {
    app.on("Error", (Error) => {
      console.log("ERR:", Error);
    });

    app.get("/", (req, res) => {
      res.send("hello AZLAN");
    });
    app.get("/api/connet", (req, res) => {
      res.send("hello AZLAN");
    });
    server.listen(process.env.PORT || 8080, () => {
      console.log(`Server is starting at PORT ${process.env.PORT || 8080}`);
    });
  })
  .catch((err) => {
    console.log(`mongoDB Connection FAILED !!!!! `, err);
  });
