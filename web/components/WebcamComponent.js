'use client'

import { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { Button } from "@/components/ui/button";

export default function WebcamComponent() {
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isCameraFlipped, setIsCameraFlipped] = useState(false);
    const webcamRef = useRef(null);

    const toggleCamera = () => {
        setIsCameraActive((prevState) => !prevState);
    };

    const flipCamera = () => {
        setIsCameraFlipped((prevState) => !prevState);
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <div style={{ marginTop: '20px' }}>
                <Button onClick={toggleCamera}>
                    {isCameraActive ? 'Stop Camers' : 'Start Camera'}
                </Button>
            </div>
            {isCameraActive ? (
                <div>
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        videoConstraints={{
                            facingMode: isCameraFlipped ? 'environment' : 'user',
                        }}
                        screenshotFormat="image/jpeg"
                        width="100%"
                    />
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
