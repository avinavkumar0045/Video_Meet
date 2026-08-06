import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import '../App.css' //react mein CSS ki files overwrite ho jati jai

export default function LandingPage() {
     
    const router = useNavigate();

  return (
    <div className='landingPageContainer'>
        {/* navbar */}
        <nav>
            <div className='navHeader'>
                <h2>
                    <span style={{color:'#FF9933'}}>Mann </span>
                    <span style={{color:'#FFFFFF'}}>Ki </span> 
                    <span style={{color:'#138808'}}>Baat</span>  
                </h2>
            </div>

            <div className='navlist'>
                <p onClick={() =>{
                    router("/asdw2s");
                }}>Join as Guest</p>
                
                <p  onClick={ () =>{
                    router("/auth")
                }}>Register</p>

                <div onClick={ () =>{
                    router("/auth")
                }} role='button'>
                    <p className='login'>LOGIN</p>
                </div>

            </div>
        </nav>
        {/* main section */}
        <div className='landingMainContainer'>
            <div>
                <h1><span style={{color:'#000080'}}>ReConnect </span> with your <br></br> Loved Ones</h1>
                <br></br>
                <p>Cover a distance by Mann Ki Gatti</p>
                <div role='button' className="btn btn-success">
                    <Link to={"/auth"}>Get Started</Link>
                </div>
            </div>

            <div>
                <img src='/funny.png' alt=''/>
            </div>

        </div>

    </div>
  )
}
