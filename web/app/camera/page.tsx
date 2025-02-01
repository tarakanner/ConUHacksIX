"use client";

import { useState } from "react";

export default function Home() {
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleStartCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
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

  return (
    <div>
      <h1>Camera App</h1>
      <button onClick={handleStartCamera}>Turn on Camera</button>
      <button onClick={handleStopCamera}>Turn off Camera</button>
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
