'use client'

import { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Button } from "@/components/ui/button";
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';

export default function WebcamComponent() {
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isCameraFlipped, setIsCameraFlipped] = useState(false);
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [model, setModel] = useState(null);

    // Load the COCO-SSD model
    useEffect(() => {
        const loadModel = async () => {
            await tf.setBackend("webgl"); // Use WebGL for faster processing
            const loadedModel = await cocoSsd.load();
            setModel(loadedModel);
        };

        loadModel();
    }, []);

    // Start object detection when camera is active
    useEffect(() => {
        if (model && isCameraActive) {
            detectObjects();
        }
    }, [model, isCameraActive]);

    const toggleCamera = () => {
        setIsCameraActive((prevState) => !prevState);
    };

    const flipCamera = () => {
        setIsCameraFlipped((prevState) => !prevState);
    };

    // Object detection function
    const detectObjects = async () => {
        if (!webcamRef.current || !canvasRef.current || !model) return;

        const video = webcamRef.current.video;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Ensure video has valid width and height
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            requestAnimationFrame(detectObjects); // Wait until video has dimensions
            return;
        }

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const detectFrame = async () => {
            if (!ctx) return;

            const predictions = await model.detect(video);

            // Clear previous drawings
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Draw predictions
            predictions.forEach((prediction) => {
                const [x, y, width, height] = prediction.bbox;
                ctx.strokeStyle = "red";
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, width, height);
                ctx.fillStyle = "red";
                ctx.fillText(prediction.class, x, y > 10 ? y - 5 : 10);
            });

            requestAnimationFrame(detectFrame); // Keep detecting
        };

        detectFrame();
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <div style={{ marginTop: '20px' }}>
                <Button onClick={toggleCamera}>
                    {isCameraActive ? 'Stop Camera' : 'Start Camera'}
                </Button>
            </div>

            {isCameraActive ? (
                <div style={{ position: 'relative' }}>
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        videoConstraints={{
                            facingMode: isCameraFlipped ? 'environment' : 'user',
                        }}
                        screenshotFormat="image/jpeg"
                        width="100%"
                    />
                    <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
                </div>
            ) : (
                <p>Camera is off</p>
            )}

            <div style={{ marginTop: '10px' }}>
                <Button onClick={flipCamera}>Flip Camera</Button>
            </div>
        </div>
    );
}
