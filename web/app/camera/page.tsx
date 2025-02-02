'use client';

import { useRef, useState } from 'react';

export default function CameraApp() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const toggleCamera = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    } else {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
        setStream(newStream);
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    }
  };

  const flipCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
    setTimeout(toggleCamera, 500);
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <video ref={videoRef} autoPlay playsInline className="w-full max-w-md rounded-lg shadow-lg" />
      <canvas ref={canvasRef} width={300} height={200} className="border rounded-lg" />
      <div className="flex gap-2">
        <button onClick={toggleCamera} className="px-4 py-2 bg-green-500 text-white rounded-lg">
          {stream ? 'Close Camera' : 'Open Camera'}
        </button>
        <button onClick={flipCamera} className="px-4 py-2 bg-blue-500 text-white rounded-lg">Flip Camera</button>
        <button onClick={captureFrame} className="px-4 py-2 bg-yellow-500 text-black rounded-lg">Capture</button>
      </div>
    </div>
  );
}
