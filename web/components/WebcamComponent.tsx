'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';
import { useSocket } from '@/lib/useSocket';
import { Button } from "@/components/ui/button";

interface Room {
  id: number;
  status: string;
  users: { id: string; username: string }[];
  objectList: string[];
  round: number;
}

interface WebcamComponentProps {
  room: Room | null;
}

export default function WebcamComponent({ room }: WebcamComponentProps) {
  const { socket } = useSocket();
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [isCameraFlipped, setIsCameraFlipped] = useState<boolean>(false);
  const [webcamKey, setWebcamKey] = useState<number>(0);
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [foundTarget, setFoundTarget] = useState<boolean>(false);
  
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null); // Ref to track debounce timeout

  const targetObject = room?.objectList?.[room.round - 1]?.toLowerCase() || ""; // Ensure correct indexing

  useEffect(() => {
    const loadModel = async () => {
      await tf.setBackend("webgl");
      const loadedModel = await cocoSsd.load();
      setModel(loadedModel);
    };
    loadModel();
  }, []);

  useEffect(() => {
    setFoundTarget(false); // Reset detection when the round changes
  }, [room?.round]);

  const detectObjects = useCallback(async () => {
    if (!webcamRef.current || !canvasRef.current || !model || !room) return;

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
      if (!ctx || !model || !room) return;

      const predictions = await model.detect(video);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      for (const prediction of predictions) {
        const [x, y, width, height] = prediction.bbox;
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        ctx.fillStyle = "red";
        ctx.fillText(prediction.class, x, y > 10 ? y - 5 : 10);

        // Check if detected object matches the current target
        if (prediction.class.toLowerCase() === targetObject && !foundTarget) {
          setFoundTarget(true);
          
          // Debounce the call to notify the server
          if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current); // Clear any existing timeouts
          }

          debounceTimeout.current = setTimeout(() => {
            notifyServerTargetFound(); // Notify server after debounce delay
          }, 2000); // 2-second debounce delay
        }
      }

      requestAnimationFrame(detectFrame);
    };

    detectFrame();
  }, [model, room, targetObject, foundTarget]);

  useEffect(() => {
    if (model && isCameraActive) {
      detectObjects();
    }
  }, [model, isCameraActive, detectObjects]);

  const notifyServerTargetFound = () => {
    if (socket && room) {
      socket.emit('gameAction', {
        roomId: room.id,
        userId: socket.id,
        objectFound: true,
      });
      console.log(`Target "${targetObject}" found and server notified.`);
    }
  };

  const toggleCamera = () => {
    setIsCameraActive((prevState) => !prevState);
  };

  const flipCamera = () => {
    setIsCameraActive(false);
    setTimeout(() => {
      setIsCameraFlipped((prevState) => !prevState);
      setWebcamKey((prevKey) => prevKey + 1);
      setIsCameraActive(true);
    }, 300);
  };

  if (!room) {
    return <p>Loading room...</p>;
  }

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
            key={webcamKey}
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
