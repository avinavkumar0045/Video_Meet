const fs = require('fs');

let code = fs.readFileSync('FRONTEND/src/pages/videoMeet.jsx', 'utf8');

// Add imports
code = code.replace(
    'import { Button, IconButton, TextField } from \'@mui/material\';',
    `import { Button, IconButton, TextField } from '@mui/material';\nimport PanToolIcon from '@mui/icons-material/PanTool';\nimport { SignRecognizer } from '../utils/signRecognizer.js';`
);

// Add State variables
code = code.replace(
    'const [hasUnread, setHasUnread] = useState(false);',
    `const [hasUnread, setHasUnread] = useState(false);\n    const [aiEnabled, setAiEnabled] = useState(false);\n    const [detectedGesture, setDetectedGesture] = useState("");\n    const recognizerRef = useRef(null);`
);

// Add AI Toggle handler
const newHandler = `
    let handleAiToggle = async () => {
        if (!aiEnabled) {
            if (!recognizerRef.current) {
                recognizerRef.current = new SignRecognizer((gesture) => {
                    setDetectedGesture(gesture);
                    
                    if(window.gestureTimeout) clearTimeout(window.gestureTimeout);
                    window.gestureTimeout = setTimeout(() => setDetectedGesture(""), 3000);

                    // Send gesture as a chat message
                    socketRef.current.emit("chat-message", \`[AI Sign]: \${gesture.toUpperCase()}\`, username);
                });
                await recognizerRef.current.initialize();
            }
            recognizerRef.current.start(localVideoRef.current);
            setAiEnabled(true);
        } else {
            if (recognizerRef.current) {
                recognizerRef.current.stop();
            }
            setAiEnabled(false);
            setDetectedGesture("");
        }
    };

    let handleVideo = ()=>{
`;
code = code.replace('let handleVideo = ()=>{', newHandler);

// Add AI Button to UI
code = code.replace(
    '<IconButton  onClick={handleAudio} style={{ color: "white"}}>\n                            {(audio === true)? <MicIcon/> : <MicOffIcon/>}\n                        </IconButton>',
    `<IconButton  onClick={handleAudio} style={{ color: "white"}}>\n                            {(audio === true)? <MicIcon/> : <MicOffIcon/>}\n                        </IconButton>\n                        <IconButton onClick={handleAiToggle} style={{ color: aiEnabled ? "#4caf50" : "white"}} title="Toggle Sign Language AI">\n                            <PanToolIcon />\n                        </IconButton>`
);

// Add AI Overlay to videoWrapper
code = code.replace(
    '<div className={styles.nameOverlay}>{username} (You)</div>',
    `<div className={styles.nameOverlay}>{username} (You)</div>\n                            {detectedGesture && <div className={styles.aiOverlay}>{detectedGesture.toUpperCase()}</div>}`
);

fs.writeFileSync('FRONTEND/src/pages/videoMeet.jsx', code);
