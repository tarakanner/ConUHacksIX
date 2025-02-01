"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  // List available video devices on mount
  useEffect(() => {
    const fetchDevices = async () => {
      const deviceInfos = await navigator.mediaDevices.enumerateDevices();
      setDevices(deviceInfos.filter(device => device.kind === "videoinput"));
    };
    fetchDevices();
  }, []);

  const handleStartCamera = async () => {
    try {
      const deviceId = currentDeviceId || devices[1]?.deviceId; // Default to the first available device
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId }
      });
      setStream(mediaStream);
    } catch (err) {
      console.error("Error accessing camera: ", err);
    }
  };

  const handleStopCamera = () => {
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleFlipCamera = () => {
    const nextDevice = devices.find(
      (device) => device.deviceId !== currentDeviceId
    );
    if (nextDevice) {
      setCurrentDeviceId(nextDevice.deviceId);
      handleStopCamera();
    }
  };

  return (
    <div>
      <h1>Camera App</h1>
      <button onClick={handleStartCamera}>Turn on Camera</button>
      <button onClick={handleStopCamera}>Turn off Camera</button>
      <button onClick={handleFlipCamera} disabled={devices.length <= 1}>
        Flip Camera
      </button>
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
