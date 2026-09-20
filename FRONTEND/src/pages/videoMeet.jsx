import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import  styles from "../styles/videoComponent.module.css";
import {Box,Badge, TextField, Stack, Button, IconButton } from '@mui/material';

import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
// import { Box, TextField, Stack, Button } from '@mui/material';
import { SocialDistance } from '@mui/icons-material';
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat';
import VideocamOffRoundedIcon from '@mui/icons-material/VideocamOffRounded';
import PanToolIcon from '@mui/icons-material/PanTool';
import { useNavigate } from 'react-router-dom';
import { SignRecognizer } from '../utils/signRecognizer.js';

const server_url = "http://localhost:8000";

var connections = {};

const peerConfigConnections  = {
    "iceServers":[
        {"urls": "stun:stun.l.google.com:19302"}
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoRef = useRef();

    let [videoAvailable , setVideoAvailable] = useState(true); // if available hardware wise

    let [audioAvailable , setAudioAvailable] = useState(true); // if available hardware wise

    let[video , setVideo] = useState([]); // video on offf

    let[audio , setAudio] = useState(); // audio on off
    let[screen, setScreen] = useState(); // sereensharing on off

    let [showModal  , setModal] = useState(true); // some pop us and all
    let showModalRef = useRef(true); /* Added: Ref to track modal state accurately inside socket listeners */

    let [screenAvailable , setScreenAvailable] = useState();

    let[messages, setMessages] = useState([]); // messages jo aayenge

    let[message , setMessage] = useState(""); /// jo likhenge

    /* Changed: Replaced hardcoded message counter with a simple boolean unread dot */
    let[hasUnread , setHasUnread] = useState(false);

    let[askForUsername , setAskForUsername] = useState(true);

    let[username , setUsername] = useState("");

    let [remoteUsers, setRemoteUsers] = useState({});
    let [remoteCameraStates, setRemoteCameraStates] = useState({});

    /* AI Sign Language Feature state */
    let [aiEnabled, setAiEnabled] = useState(false);
    let [detectedGesture, setDetectedGesture] = useState("");
    const recognizerRef = useRef(null);

    const videoRef  = useRef([]);

    let[videos , setVideos] = useState([]);

    const getPermissions = async() =>{
        try{
            const videoPermission = await navigator.mediaDevices.getUserMedia({video : true});

            if(videoPermission){
                setVideoAvailable(true);
                console.log("Video Permission Granted");
            }else{
                setVideoAvailable(false);
                console.log("Video Permission denied");
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({audio : true});

            if(audioPermission){
                setAudioAvailable(true);
                console.log("Audio Permission granted");
            }else{
                setAudioAvailable(false);
                console.log("Audio Permission denied");
            }
            if(navigator.mediaDevices.getDisplayMedia){
                setScreenAvailable(true);
            }else{
                setScreenAvailable(false);
            }

            if(audioAvailable || videoAvailable){
                const userMediaStream = await navigator.mediaDevices.getUserMedia({video:videoAvailable , audio : audioAvailable});

                if(userMediaStream){
                    window.localStream = userMediaStream;
                    if(localVideoRef.current){
                        localVideoRef.current.srcObject = userMediaStream;
                    }

                }
            }

        } catch(err){
            console.log(err);

        }
    }

    useEffect(() =>{
        console.log("Hello");
        getPermissions();

    } , [])

    let getUserMediaSuccess = (stream) =>{
        try{
            window.localStream.getTracks().forEach(track=> track.stop())

        }catch(e){
            console.log(e)
        }

        window.localStream= stream;
        localVideoRef.current.srcObject= stream;


        for(let id in connections){
            if(id == socketIdRef.current) continue 

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description)=>{
                console.log(description)
                connections[id].setLocalDescription(description)
                .then(()=>{
                    socketRef.current.emit("signal", id , JSON.stringify({"sdp" : connections[id].localDescription}))
                })
                .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () =>{
            setVideo(false) ; // keep in same order only
            setAudio(false);

            try{
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())

            }catch(e) { console.log(e)}

            // Todo blackSilence
            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream

            for(let id in connections){
                connections[id].addStream (window.localStream)
                connections[id].createOffer().then ((description)=>{
                    connections[id].setLocalDescription(description)
                    .then(()=>{
                        socketRef.current.emit("signal", id , JSON.stringify({"sdp":connections[id].localDescription}))
                    })
                    .catch(e => console.log(e));
                })
            }
        })
    }

    let silence = () =>{
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator();

        let dst = oscillator.connect(ctx.createMediaStreamDestination());

        oscillator.start();
        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0] ,{ enabled : false})

    }

    let black = ({width = 640, height = 480} = {}) =>{
        let canvas = Object.assign(document.createElement("canvas"), {width , height});

        canvas.getContext('2d').fillRect(0,0,width ,height);

        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], {enabled : false})
    }
    

    let getUserMedia = () => {
        if((video && videoAvailable ) || (audio && audioAvailable)){
            navigator.mediaDevices.getUserMedia({video : video, audio : audio})
            .then(getUserMediaSuccess) // responsible for stoping the stream if I stoped it and send only the audio stream and vice versa
            .then((stream)=>{})
            .catch((e)=> console.log(e))
        }else{
            try{
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(tracks => tracks.stop());
            } catch(e){}
        }
    }
    useEffect(() =>{
        if(video !== undefined && audio !== undefined){
            getUserMedia();
            console.log("SET STATE HAS ", video , audio);
        }
    } , [audio , video] )

    let gotMessageFromServer= (fromId , message)=>{
        var signal = JSON.parse(message)

        if(fromId !== socketIdRef.current){
            if(signal.sdp){
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(()=>{
                    if(signal.sdp.type === "offer"){
                        connections[fromId].createAnswer().then((description)=> {
                            connections[fromId].setLocalDescription(description).then(()=>{
                                socketRef.current.emit("signal", fromId , JSON.stringify({"sdp": connections[fromId].localDescription}))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if(signal.ice){
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }

    let addMessage = (data, sender, socketIdSender ) =>{
        
        setMessages((prevMessages)=>[
            ...prevMessages,
            {sender: sender, data :data}
        ])       
        if(socketIdSender !== socketIdRef.current){
            /* Changed: Only show the unread dot if the chat panel is currently closed */
            if(!showModalRef.current) {
                setHasUnread(true);
            }
        }
    }

    let connectToSocketServer = () =>{
        socketRef.current = io.connect(server_url, {secure : false})
        socketRef.current.on('signal',gotMessageFromServer);

        socketRef.current.on("connect", ()=>{
            socketRef.current.emit("join-call", window.location.href, username, videoAvailable)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on("chat-message",addMessage)

            socketRef.current.on("user-left", (id)=>{
                setVideos((videos)=>videos.filter((video)=>video.socketId !== id))
            })

            socketRef.current.on("update-camera-state", (id, isVideoOn) => {
                setRemoteCameraStates(prev => ({ ...prev, [id]: isVideoOn }));
            });

            socketRef.current.on("user-joined", (id , clients, usersDict, cameraDict)=>{
                if(usersDict) setRemoteUsers(usersDict);
                if(cameraDict) setRemoteCameraStates(cameraDict);

                clients.forEach((socketListId)=>{

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections) // for connection

                    connections[socketListId].onicecandidate = function(event) { // ice = interactive connection protocol
                        if(event.candidate != null ){
                            socketRef.current.emit("signal", socketListId , JSON.stringify({'ice': event.candidate}))
                        }
                    }

                    connections[socketListId].onaddstream = (event) =>{
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);
                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if(videoExists){
                            console.log("FOUND EXISTING");

                             // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId == socketListId ? { ...video, stream : event.stream} : video // give new stream else video
                                );
                                videoRef.current = updatedVideos; // new videos 
                                return updatedVideos;
                            });

                        } else{

                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId : socketListId,
                                stream : event.stream,
                                autoPlay: true,
                                playsInLine: true,
                            };
                            setVideos(videos =>{
                                const updatedVideos = [...videos , newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };

                    if((window.localStream !== undefined) && (window.localStream !== null)){
                        connections[socketListId].addStream(window.localStream);
                    } else{
                        // BLACKSILENCE

                        let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
                        window.localStream = blackSilence();
                        connections[socketListId].addStream(window.localStream);
                    }
                })

                if(id === socketIdRef.current){
                    for(let id2 in connections ){
                        if(id2 === socketIdRef.current) continue // apne hi sath kya connection banana

                        try{
                            connections[id2] .addStream(window.localStream);
                        } catch(e){ }

                        connections[id2].createOffer().then((description)=>{
                            connections[id2].setLocalDescription(description)
                            .then(() =>{
                                socketRef.current.emit("signal", id2 , JSON.stringify({"sdp":connections[id2].localDescription}))
                            })
                            .catch(e => console.log(e));
                            
                        })
                    }
                }
            })    
        })


    }

    let getMedia = ()=>{
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    let routeTo = useNavigate();


    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }

    let handleVideo = () =>{
        const newState = !video;
        setVideo(newState);
        socketRef.current.emit("camera-toggle", newState);
    }

    let handleAudio = ()=>{
        setAudio(!audio);
    }

    let getDisplayMediaSuccess = (stream) =>{
        try{
            window.localStream.getTracks().forEach(track => track.stop())
        } catch(e){console.log(e)}

        window.localStream= stream;
        localVideoRef.current.srcObject = stream;

        for(let id in connections){
            if(id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream)
            connections[id].createOffer().then((description)=>[
                connections[id].setLocalDescription(description)
                .then(() =>{
                    socketRef.current.emit("signal",id ,JSON.stringify({"sdp":connections[id].localDescription}))
                })
                .catch(e => console.log(e))
            ])
        }
        stream.getTracks().forEach(track => track.onended = () =>{
            setScreen(false) ; // keep in same order only
            

            try{
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())

            }catch(e) { console.log(e)}

            // Todo blackSilence
            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;

            getUserMedia();
        })
    }

    let getDisplayMedia = () =>{
        if(screen){
            if(navigator.mediaDevices.getDisplayMedia){
                navigator.mediaDevices.getDisplayMedia({video:true , audio:true} )
                .then(getDisplayMediaSuccess)
                .then((stream) => {})
                .catch((e)=> console.log(e))
            }
        }
    }

    useEffect(()=>{
        if(screen !== undefined){
            getDisplayMedia();

        }
    },[screen])

    let handleScreen = () =>{
        setScreen(!screen)
    }

    let handleChat = () =>{
        let newState = !showModal;
        setModal(newState);
        showModalRef.current = newState; /* Changed: Keep ref in sync for the socket listener */
        if(newState) setHasUnread(false); /* Changed: Clear the unread dot when opening chat */
    }

    let sendMessage = () =>{
        socketRef.current.emit("chat-message" , message , username);
        setMessage("");
    }

    /* AI Sign Language Toggle: initializes SignRecognizer on first use, starts/stops prediction loop */
    let handleAiToggle = async () => {
        if (!aiEnabled) {
            if (!recognizerRef.current) {
                recognizerRef.current = new SignRecognizer((gesture) => {
                    setDetectedGesture(gesture);
                    // Auto-clear the overlay after 3 seconds
                    if (window.gestureTimeout) clearTimeout(window.gestureTimeout);
                    window.gestureTimeout = setTimeout(() => setDetectedGesture(""), 3000);
                    // Broadcast to the meeting chat as an AI sign message
                    socketRef.current.emit("chat-message", `[AI Sign]: ${gesture.toUpperCase()}`, username);
                });
                await recognizerRef.current.initialize();
            }
            recognizerRef.current.start(localVideoRef.current);
            setAiEnabled(true);
        } else {
            if (recognizerRef.current) recognizerRef.current.stop();
            setAiEnabled(false);
            setDetectedGesture("");
        }
    };

    let handleEndCall = ()=>{
        try{
            let tracks =  localVideoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop())
        }catch (e){}
            window.location.href = "/home"


        
    }

    return (
        <div>
            {askForUsername === true? 
              <div className={styles.lobbyContainer}>
                <div className={styles.lobbyBox}>
                    <div>
                        <video className={styles.lobbyVideoPreview} ref={localVideoRef} autoPlay muted></video>
                    </div>
                    <div className={styles.lobbyForm}>
                        <h2>Enter into Lobby</h2>
                        <TextField 
                            id="outlined-basic" 
                            label="Username" 
                            value={username} 
                            onChange={e => setUsername(e.target.value)} 
                            variant="outlined" 
                            sx={{ 
                                "& .MuiOutlinedInput-root": {
                                    "& fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                                    "&:hover fieldset": { borderColor: "white" },
                                },
                                "& .MuiInputBase-input": { color: "white" },
                                "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" }
                            }}
                        />
                        <Button variant="contained" size="large" onClick={connect}>Connect</Button>
                    </div>
                </div>
              </div> : 
                  
                  <div className={styles.meetVideoContainer}>


                    {showModal ? <div className={styles.chatRoom}>
                        <div className={styles.chatContainer}> 
                        <h1>Chat</h1>

                        <div className={styles.chattingDisplay}>
                            { messages.length > 0 ? messages.map((item ,index)=>{
                                return (
                                    <div style={{marginBottom: "20px"}} key={index}>
                                        <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                                        <p>{item.data}</p>

                                    </div>
                                )
                            }) : <p>No messages yet </p>}
                        </div>


                        <div className={styles.chattingArea}>
                          {/* {message} */}
                          <TextField value={message} onChange={(e)=> setMessage(e.target.value)} id="outlined-basic" label="Enter your chat" variant="outlined" 
                          sx={{ 
                              flexGrow: 1, 
                              "& .MuiOutlinedInput-root": {
                                  "& fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                                  "&:hover fieldset": { borderColor: "white" },
                              },
                              "& .MuiInputBase-input": { color: "white" },
                              "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" }
                          }} 
                          />
                          <Button variant='contained' onClick={sendMessage}>Send</Button>
                        </div>

                        </div>

                    </div> : <></>}

                    <div className={styles.buttonContainers}>
                        <IconButton  onClick={handleVideo} style={{ color: "white"}}>
                            {(video === true)? <VideocamIcon/> : <VideocamOffIcon/>}
                        </IconButton>
                        <IconButton   onClick={handleEndCall} style={{ color: "red"}}>
                            <CallEndIcon /> 
                        </IconButton>
                        <IconButton  onClick={handleAudio} style={{ color: "white"}}>
                            {(audio === true)? <MicIcon/> : <MicOffIcon/>}
                        </IconButton>
                        <IconButton onClick={handleAiToggle} style={{ color: aiEnabled ? "#4caf50" : "white"}} title="Toggle Sign Language AI">
                            <PanToolIcon />
                        </IconButton>

                        {screenAvailable === true ? // if screen share
                        <IconButton onClick={handleScreen} style={{ color: "white"}}>
                            {screen === true ? <ScreenShareIcon></ScreenShareIcon> : <StopScreenShareIcon></StopScreenShareIcon>}
                        </IconButton> : <></>}

                        <Badge color="error" variant="dot" invisible={!hasUnread}>
                            <IconButton onClick={handleChat} style={{ color : "white"}}>
                                <ChatIcon/>
                            </IconButton>
                        </Badge>

                    </div>

                    <div className={styles.conferenceView}>
                        
                        <div className={styles.videoWrapper}>
                            <video ref={localVideoRef} autoPlay muted></video>
                            <div className={styles.nameOverlay}>{username} (You)</div>
                            {detectedGesture && <div className={styles.aiOverlay}>{detectedGesture.toUpperCase()}</div>}
                            {!video && <div className={styles.cameraOffOverlay}><VideocamOffRoundedIcon /></div>}
                        </div>

                        {videos.map((videoObj)=>(
                                <div key={videoObj.socketId} className={styles.videoWrapper}>
                                    <video 
                                        data-socket = {videoObj.socketId}
                                        ref={ref=>{
                                            if(ref && videoObj.stream){
                                                ref.srcObject = videoObj.stream;
                                            }
                                        }}
                                        autoPlay
                                        >
                                    </video>
                                    <div className={styles.nameOverlay}>{remoteUsers[videoObj.socketId] || videoObj.socketId}</div>
                                    {remoteCameraStates[videoObj.socketId] === false && <div className={styles.cameraOffOverlay}><VideocamOffRoundedIcon /></div>}
                                </div>
                        ))}
                    </div>
                  </div>
            
             }
        </div>
    )  
}
