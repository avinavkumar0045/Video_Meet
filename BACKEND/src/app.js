import express from 'express';
import {createServer} from "node:http";
import {Server} from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import { connectToSocket } from './controllers/SocketManager.js';
import userRoutes from "./routes/users.routes.js";

//khud se
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';



const app = express(); // app ka instance create kiya 
const server = createServer(app); // Server create kiya aur , server pr app phek diya 
const io = connectToSocket(server); // server ko nai IO Server mein daal diya (Server ke under io and app)


//khud se
// const __dirname = dirname(fileURLToPath(import.meta.url));
// app.use(express.static(join(__dirname, "public")));

// io.on('connection', (socket) => {
//     console.log('a user connected');
  
//     socket.on('chat message', (msg) => {
//       console.log('message: ' + msg); // Prints message to server console
//     });
  
//     socket.on('disconnect', () => {
//       console.log('user disconnected');
//     });
//   });
  


app.set("port" , (process.env.PORT || 8000))
app.use(cors()); // kyu ki allow hhtp wala error kabhi kabhi aa jata hai
app.use(express.json({limit:"40kb"})); // so that koi badmashiya naa karein
app.use(express.urlencoded({limit:"40kb" , extended : true}));

app.use("/api/v1/users", userRoutes); // this two if you are rolling a api version and want the user to run the old one , if new one dont workout.
// app.use("/api/v2/users", newUserRoutes); if rolling out new version


const start = async() =>{
    const connectionDB = await mongoose.connect("mongodb+srv://avinavkumar0045:MannKiBaat@cluster0.zcwzttl.mongodb.net/");

    console.log(`MONGO Connected DB host : ${connectionDB.connection.host}`);
    server.listen(app.get("port") , () =>{
        console.log("LISTINING ON PORT 8000")
    });

}

start();