import {Route , BrowserRouter as Router , Routes}from 'react-router-dom';
import LandingPage from './pages/landing';
import Authentication from './pages/authentication';
import "./App.css"
import { AuthProvider } from './contexts/AuthContext';
import VideoMeetCompponent from './pages/videomeet';
import HomeComponent from './pages/home.jsx';
import History from './pages/history.jsx';
/* Added: Imported Material UI Theme tools to enforce global dark mode */
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'dark', /* Forces all MUI components to dark mode */
  },
});

function App() {
  return (
    <div className='App'>
      {/* Added: Wrap the entire app in the Dark Theme Provider */}
      <ThemeProvider theme={darkTheme}>
        <CssBaseline /> {/* Standardizes the background color to match the dark theme */}
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<LandingPage/>} />     
              <Route path="/auth" element={<Authentication/>}/>
              <Route path="/home" element={<HomeComponent/>} />
              <Route path="/history" element={<History/>} />
              <Route path="/:url" element={<VideoMeetCompponent/>} /> 
            </Routes>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </div>
  )
}

export default App
