'use client'

import { useState, useRef } from 'react';
import Webcam from 'react-webcam';

export default function Home() {
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
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Webcam Example</h1>

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

      <div style={{ marginTop: '20px' }}>
        <button onClick={toggleCamera}>
          {isCameraActive ? 'Turn Camera Off' : 'Turn Camera On'}
        </button>
      </div>

      <div style={{ marginTop: '10px' }}>
        <button onClick={flipCamera}>Flip Camera</button>
      </div>
    </div>
  );
}
