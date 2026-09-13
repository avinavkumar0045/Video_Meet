/* This utility file normalizes MediaPipe hand landmarks relative to the wrist and scales them for ML prediction. */

/**
 * Normalizes 21 3D hand landmarks from MediaPipe.
 * 1. Shifts the origin (0,0,0) to the wrist (landmark 0).
 * 2. Scales all coordinates relative to the maximum distance to ensure scale invariance.
 * 3. Flattens the coordinates into a 63-element 1D array (21 landmarks * 3 axes).
 * 
 * @param {Array} landmarks - Array of 21 objects containing {x, y, z}.
 * @returns {Array} - Flattened array of 63 normalized floats.
 */
export const preprocessLandmarks = (landmarks) => {
    if (!landmarks || landmarks.length !== 21) {
        return null;
    }

    // 1. Get the wrist coordinates to act as the new origin
    const wrist = landmarks[0];
    
    // 2. Subtract wrist coordinates from all landmarks
    let normalized = landmarks.map(lm => ({
        x: lm.x - wrist.x,
        y: lm.y - wrist.y,
        z: lm.z - wrist.z
    }));

    // 3. Find the maximum absolute value across all axes for scaling
    let maxVal = 0;
    normalized.forEach(lm => {
        maxVal = Math.max(maxVal, Math.abs(lm.x), Math.abs(lm.y), Math.abs(lm.z));
    });

    // Avoid division by zero
    if (maxVal === 0) maxVal = 1;

    // 4. Scale and flatten into a 63-element array
    const flattened = [];
    normalized.forEach(lm => {
        flattened.push(lm.x / maxVal);
        flattened.push(lm.y / maxVal);
        flattened.push(lm.z / maxVal);
    });

    return flattened;
};
