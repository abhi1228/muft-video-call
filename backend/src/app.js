import express from "express";
import {createServer} from "node:http";
import {Server} from "socket.io";

import mongoose from "mongoose";

import cors from "cors";
import userRoutes from "./routes/users.routes.js";
import connnectToScoket from "./controllers/socketManager.js";
import dotenv from 'dotenv';
const app=express();
dotenv.config();
const server=createServer(app);
const io=connnectToScoket(server);
app.set("port",process.env.PORT || 8000);
app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb",extended:true}))

// app.get("/",(req,res)=>{
//     return res.json({"hello":"world"});
// });
console.log("app.js");
app.use("/api/v1/users",userRoutes);


const start=async ()=>{
    const connectionDb=await mongoose.connect(process.env.MONGODB_URL);
    //console.log(`Mongo connected db host: ${connectionDb.connection.host}`);
    console.log("DB connected successfully")
    server.listen(app.get("port"),()=>{
        console.log(`LISTING ON PORT ${process.env.PORT}`);
    })
}

start();