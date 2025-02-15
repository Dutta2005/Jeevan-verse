// // require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import connectDB from "../src/db/index.js";
import {app, server} from "../src/app.js"

dotenv.config({ path: "./.env" });


connectDB()
.then(() => {
    console.log("MongoDB Connected!! DataBase HOST: ", process.env.MONGODB_URI);
    app.on("error", (error) => {
        console.error("ERROR: ", error);
        throw error
    })
})
.then(() => {
    // Start the HTTP server (with WebSocket integrated)
    server.listen(process.env.PORT || 8000, () => {
        console.log(`🚀 Server is running on : ${process.env.PORT || 8000}`);
      });
})
.catch((err) => {
    console.error("MONGODB CONNECTION ERROR: ", err);
})