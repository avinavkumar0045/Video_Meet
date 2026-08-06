import {Route , BrowserRouter as Router , Routes}from 'react-router-dom';
import LandingPage from './pages/landing';
import Authentication from './pages/authentication';
import "./App.css"
import { AuthProvider } from './contexts/AuthContext';
import VideoMeetCompponent from './pages/videomeet';
import HomeComponent from './pages/home.jsx';
import History from './pages/history.jsx';

function App() {
  return (

    <div className='App'>

     <Router>
      <AuthProvider>

        <Routes>
          {/* <Route path="/home" element="" /> */}
          <Route path="/" element={<LandingPage/>} />     
          <Route path="/auth" element={<Authentication/>}/>
          <Route path="/home" element={<HomeComponent/>} />
          <Route path="/history" element={<History/>} />
          <Route path="/:url" element={<VideoMeetCompponent/>} /> 
        </Routes>

      </AuthProvider>
     </Router>
    </div>
  )
}

export default App
