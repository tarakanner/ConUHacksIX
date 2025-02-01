"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentCamera, setCurrentCamera] = useState<string | null>(null); // Track which camera is active
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]); // List of available cameras

  useEffect(() => {
    // Get the list of media devices (cameras) when the component mounts
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameras(videoDevices);
        if (videoDevices.length > 0) {
          setCurrentCamera(videoDevices[0].deviceId); // Default to the first camera
        }
      } catch (err) {
        console.error("Error accessing devices: ", err);
      }
    };

    getCameras();
  }, []);

  const handleStartCamera = async () => {
    if (currentCamera) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: currentCamera } }
        });
        setStream(mediaStream);
      } catch (err) {
        console.error("Error accessing camera: ", err);
      }
    }
  };

  const handleStopCamera = () => {
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      setStream(null);
    }
  };

  const toggleCamera = () => {
    if (cameras.length > 1) {
      const nextCameraIndex = (cameras.findIndex(camera => camera.deviceId === currentCamera) + 1) % cameras.length;
      setCurrentCamera(cameras[nextCameraIndex].deviceId);
      handleStopCamera(); // Stop the current stream before switching cameras
      handleStartCamera(); // Start the new stream
    }
  };

  return (
    <div>
      <h1>Camera App</h1>
      <button onClick={handleStartCamera}>Turn on Camera</button>
      <button onClick={handleStopCamera}>Turn off Camera</button>
      {cameras.length > 1 && <button onClick={toggleCamera}>Flip Camera</button>}

      {stream && (
        <video
          ref={(video) => {
            if (video && stream) {
              video.srcObject = stream;
            }
          }}
          autoPlay
          playsInline
          width="100%"
          height="auto"
        />
      )}
    </div>
  );
}
