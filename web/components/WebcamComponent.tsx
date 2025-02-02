'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button } from "@/components/ui/button";
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';

export default function WebcamComponent() {
    const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
    const [isCameraFlipped, setIsCameraFlipped] = useState<boolean>(false);
    const [webcamKey, setWebcamKey] = useState<number>(0); // Add a key to force re-render
    const webcamRef = useRef<Webcam | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);

    // Load the COCO-SSD model
    useEffect(() => {
        const loadModel = async () => {
            await tf.setBackend("webgl");
            const loadedModel = await cocoSsd.load();
            setModel(loadedModel);
        };

        loadModel();
    }, []);

    // Object detection function
    const detectObjects = useCallback(async () => {
        if (!webcamRef.current || !canvasRef.current || !model) return;

        const video = webcamRef.current.video as HTMLVideoElement;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) {
            requestAnimationFrame(detectObjects);
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const detectFrame = async () => {
            if (!ctx || !model) return;

            const predictions = await model.detect(video);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            predictions.forEach((prediction) => {
                const [x, y, width, height] = prediction.bbox;
                ctx.strokeStyle = "red";
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, width, height);
                ctx.fillStyle = "red";
                ctx.fillText(prediction.class, x, y > 10 ? y - 5 : 10);
            });

            requestAnimationFrame(detectFrame);
        };

        detectFrame();
    }, [model]);

    // Start object detection when camera is active
    useEffect(() => {
        if (model && isCameraActive) {
            detectObjects();
        }
    }, [model, isCameraActive, detectObjects]);

    const toggleCamera = () => {
        setIsCameraActive((prevState) => !prevState);
    };

    const flipCamera = () => {
        setIsCameraFlipped((prevState) => !prevState);
        setWebcamKey((prevKey) => prevKey + 1); // Force re-render of Webcam component
        setIsCameraActive((prevState) => !prevState);
        setIsCameraActive((prevState) => !prevState);
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <div style={{ marginTop: '20px' }}>
                <Button onClick={toggleCamera}>
                    {isCameraActive ? 'Stop Camera' : 'Start Camera'}
                </Button>
            </div>

            {isCameraActive ? (
                <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%', margin: '0 auto' }}>
                    <Webcam
                        key={webcamKey} // Force re-render when flipping camera
                        audio={false}
                        ref={webcamRef}
                        videoConstraints={{
                            facingMode: isCameraFlipped ? 'environment' : 'user',
                        }}
                        screenshotFormat="image/jpeg"
                        width="100%"
                        style={{ objectFit: 'contain' }}
                    />
                    <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
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
