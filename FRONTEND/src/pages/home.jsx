import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';




 function HomeComponent() {

  let navigate = useNavigate();
  const [meetingCode , setMeetingCode] = useState(""); 
  
  const {addToUserHistory} = useContext(AuthContext);
  let handleJoinVideoCall = async()=>{
    await addToUserHistory(meetingCode)
    navigate(`/${meetingCode}`)
  }

  let handleCreateVideoCall = async()=>{
    const newCode = Math.random().toString(36).substring(2, 7);
    await addToUserHistory(newCode);
    navigate(`/${newCode}`);
  }

  return (
    <>
           <div className='navBar'>
              <div style={{display :"flex ",alignItems: "center" }}>
                {/* Changed: Made the branding clickable to navigate home */}
                <h2 onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>Mann Ki Baat</h2>
              </div>

              <div style={{display:"flex" , alignItems: "center"}}>
                 <IconButton onClick={
                      ()=>{
                          navigate("/history")
                       }
                    }>
                    <RestoreIcon />
                 </IconButton>
                 <p>History</p>

                 <Button onClick={()=>{
                      localStorage.removeItem("token")
                      navigate("/auth")
                 }}>
                    Logout
                 </Button>
              </div>
           </div>

           <div className="meetContainer">
            <div className="leftPanel">
              <div>
                <h2>Providing quality meetings just like the real meeting </h2>
                <div style={{display:'flex', gap:"10px"}}>
                  <TextField onChange={e => setMeetingCode(e.target.value)} id="outlined-basic" label="Meeting Code" variant="outlined" />
                  <Button onClick={handleJoinVideoCall} variant='contained'>Join</Button>
                  <Button onClick={handleCreateVideoCall} variant='outlined'>Start Instant Meeting</Button>
                </div>
              </div>
            </div>

            <div className="rightPanel">
               <img src='/logo3.png' alt="Logo" />
            </div>
           </div>
    </>
  )
}

export default withAuth(HomeComponent);
