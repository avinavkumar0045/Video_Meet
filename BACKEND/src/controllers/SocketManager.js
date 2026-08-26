import { connect } from "mongoose";
import { Server } from "socket.io";


let connections = {}
let messages = {}
let timeOnline  ={}
let users = {} /* Added: Store socket.id to username mapping */
let cameraStates = {} /* Added: Store socket.id to camera state mapping */

export const connectToSocket = (server) =>{
    const io = new Server(server ,{  // not to do this cors section in production , just in testing, cause server from anywhere

        cors:{
            origin : "*",
            methods : ["GET", "POST"],
            allowedHeaders:["*"],
            credentials : true
        }
    });


    io .on("connection", (socket)=>{

        console.log("SOMETHING CONNECTED");

        socket.on("join-call",(path, username, initialVideoState)=>{ /* Added: Accept username and initial video state */
            
            users[socket.id] = username || "Guest"; /* Added: Save username */
            cameraStates[socket.id] = initialVideoState; /* Added: Save initial camera state */

            if(connections[path] === undefined){
                connections[path] = []
            }
            connections[path].push(socket.id);

            timeOnline[socket.id] = new Date();

            for(let a = 0; a< connections[path].length ; a++){
                /* Added: Broadcast users and cameraStates objects so everyone knows the names and video statuses */
                io.to(connections[path][a]).emit("user-joined" , socket.id, connections[path], users, cameraStates);
            }

            if (messages[path] !== undefined){
                for(let a = 0; a<messages[path].length ; ++a){
                    io.to(socket.id).emit("chat-message", messages[path][a]['data'],
                        messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
                }
            }
        })

        socket.on("camera-toggle", (isVideoOn) => { /* Added: Handle remote camera toggling */
            cameraStates[socket.id] = isVideoOn;
            
            const[matchingRoom , found] = Object.entries(connections)
                .reduce(([room , isFound], [roomKey , roomValue])=>{
                if(!isFound && roomValue.includes(socket.id)){ return [roomKey , true]; }
                return [room , isFound];
            } , ['', false]);

            if(found === true){
                connections[matchingRoom].forEach((elem)=> {
                    io.to(elem).emit("update-camera-state", socket.id, isVideoOn);
                })
            }
        })

        socket.on("signal", (toId , message)=>{
            io.to(toId).emit("signal",socket.id , message);
        })

        socket.on("chat-message", (data, sender)=>{

            const[matchingRoom , found] = Object.entries(connections)
                .reduce(([room , isFound], [roomKey , roomValue])=>{

                if(!isFound && roomValue.includes(socket.id)){
                    return [roomKey , true];
                }

                return [room , isFound];
            } , ['', false]);

            if(found === true){
                if(messages[matchingRoom] === undefined){
                    messages[matchingRoom] = []
                }
                messages[matchingRoom].push({'sender':sender , "data": data ,"socket-id-sender": socket.id })
                // socket.listenersAnyOutgoing("message",matchingRoom,":",sender ,data)
                console.log("message",matchingRoom,":",sender ,data)

                connections[matchingRoom].forEach((elem)=> {
                    io.to(elem).emit("chat-message", data , sender , socket.id)
                })
            }

        })

        socket.on("disconnect",()=>{
            var diffTime = Math.abs(timeOnline[socket.id] - new Date());
            var key
            for(const [k,v] of JSON.parse(JSON.stringify(Object.entries(connections)))){
                for(let a = 0; a< v.length ; ++a){
                    if(v[a] === socket.id){
                        key = k;

                        for(let a = 0; a< connections[key].length ; ++a){
                            io.to(connections[key][a]).emit('user-left', socket.id);
                        }

                        var index = connections[key].indexOf(socket.id)

                        connections[key].splice(index, 1)

                        if(connections[key].lenght === 0){
                            delete connections[key];
                        }
                    }


                }
            }

        })
    })

    return io;

}
