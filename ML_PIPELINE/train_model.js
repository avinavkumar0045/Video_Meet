/* This script trains a lightweight TensorFlow.js Dense Neural Network on the collected gesture dataset and exports the model.json. */
const fs = require('fs');
const tf = require('@tensorflow/tfjs'); // Switched to pure JS version to fix path bugs

async function trainModel() {
    console.log("Loading dataset...");
    
    // Check if dataset exists
    if (!fs.existsSync('./gesture_dataset.json')) {
        console.error("Error: gesture_dataset.json not found. Please run data_collector.html first.");
        return;
    }

    const rawData = JSON.parse(fs.readFileSync('./gesture_dataset.json', 'utf8'));
    console.log(`Loaded ${rawData.length} samples.`);

    // 8 target gestures
    const LABELS = ['hello', 'yes', 'no', 'thank_you', 'help', 'stop', 'okay', 'sorry'];
    
    // Prepare Data
    const xs = tf.tensor2d(rawData.map(item => item.features));
    const ys = tf.tensor1d(rawData.map(item => LABELS.indexOf(item.label)), 'int32');
    const ysOneHot = tf.oneHot(ys, LABELS.length);

    // Build Lightweight Model
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 128, activation: 'relu', inputShape: [63] }));
    model.add(tf.layers.dropout({ rate: 0.2 }));
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.dense({ units: LABELS.length, activation: 'softmax' }));

    model.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
    });

    console.log("Training model...");
    await model.fit(xs, ysOneHot, {
        epochs: 50,
        validationSplit: 0.2,
        callbacks: {
            onEpochEnd: (epoch, logs) => console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`)
        }
    });

    console.log("Training complete. Exporting model...");
    
    // Custom save handler because pure tfjs doesn't have the file:// scheme
    await model.save(tf.io.withSaveHandler(async (artifacts) => {
        const modelDir = '../FRONTEND/public/model';
        
        // Save model.json
        const modelJSON = {
            format: artifacts.format,
            generatedBy: artifacts.generatedBy,
            convertedBy: artifacts.convertedBy,
            modelTopology: artifacts.modelTopology,
            weightsManifest: [{
                paths: ['model.weights.bin'],
                weights: artifacts.weightSpecs
            }]
        };
        fs.writeFileSync(`${modelDir}/model.json`, JSON.stringify(modelJSON));
        
        // Save model.weights.bin
        fs.writeFileSync(`${modelDir}/model.weights.bin`, Buffer.from(artifacts.weightData));
        
        return { modelArtifactsInfo: { dateSaved: new Date(), modelTopologyType: 'JSON' } };
    }));
    
    console.log("Model saved to FRONTEND/public/model!");
}

// Run the training script
trainModel();
