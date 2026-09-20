/* This class completely isolates the AI logic. It initializes MediaPipe and TensorFlow, runs predictions on the video stream, and applies temporal smoothing. */
import * as tf from "@tensorflow/tfjs";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { preprocessLandmarks } from "./landmarkPreprocess.js";

export class SignRecognizer {
    constructor(onGestureDetected) {
        this.onGestureDetected = onGestureDetected; // Callback to update React UI
        this.model = null;
        this.handLandmarker = null;
        this.isPredicting = false;
        this.lastVideoTime = -1;
        
        // Configuration
        this.labels = ['hello', 'yes', 'no', 'thank_you', 'help', 'stop', 'okay', 'sorry'];
        this.CONFIDENCE_THRESHOLD = 0.85; 
        
        // Temporal Smoothing (Debouncing)
        this.gestureHistory = []; 
        this.currentGesture = null;
    }

    async initialize() {
        console.log("Loading TensorFlow Model...");
        this.model = await tf.loadLayersModel('/model/model.json');

        console.log("Loading MediaPipe HandLandmarker...");
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm");
        this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 1
        });
        
        console.log("AI Subsystem Ready.");
    }

    start(videoElement) {
        if (!this.model || !this.handLandmarker) {
            console.error("SignRecognizer not initialized yet!");
            return;
        }
        this.isPredicting = true;
        this.gestureHistory = [];
        this.predictLoop(videoElement);
    }

    stop() {
        this.isPredicting = false;
        this.currentGesture = null;
        this.gestureHistory = [];
    }

    async predictLoop(videoElement) {
        if (!this.isPredicting) return;

        // Only process if the video frame has updated
        if (videoElement.currentTime !== this.lastVideoTime && videoElement.readyState >= 2) {
            this.lastVideoTime = videoElement.currentTime;
            
            const results = this.handLandmarker.detectForVideo(videoElement, performance.now());
            
            if (results.landmarks && results.landmarks.length > 0) {
                const features = preprocessLandmarks(results.landmarks[0]);
                
                // --- TensorFlow.js Inference ---
                const inputTensor = tf.tensor2d([features]);
                const prediction = this.model.predict(inputTensor);
                const scores = await prediction.data();
                
                // Cleanup WebGL memory
                inputTensor.dispose();
                prediction.dispose();

                // Find highest probability
                const maxScore = Math.max(...scores);
                const maxIndex = scores.indexOf(maxScore);

                // --- Temporal Smoothing ---
                if (maxScore > this.CONFIDENCE_THRESHOLD) {
                    const detected = this.labels[maxIndex];
                    this.gestureHistory.push(detected);
                    
                    // Keep history to last 5 frames
                    if (this.gestureHistory.length > 5) {
                        this.gestureHistory.shift();
                    }

                    // Check if stable (all 5 frames are exactly the same gesture)
                    if (this.gestureHistory.length === 5 && this.gestureHistory.every(g => g === detected)) {
                        if (this.currentGesture !== detected) {
                            this.currentGesture = detected;
                            this.onGestureDetected(detected); // Send to React
                        }
                    }
                } else {
                    this.gestureHistory = []; // Reset if hand is blurry/unrecognized
                }
            } else {
                this.gestureHistory = []; // Reset if no hand is detected
            }
        }
        
        // Loop again on the next animation frame
        window.requestAnimationFrame(() => this.predictLoop(videoElement));
    }
}
