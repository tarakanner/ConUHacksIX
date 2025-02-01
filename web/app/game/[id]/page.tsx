"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Game() {
  const { id } = useParams();
  const [cameraActive, setCameraActive] = useState(false);
  const [result, setResult] = useState<{ status: "win" | "lose" | null; winner?: string }>({ status: null });
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Mock WebSocket connection
    const mockWin = () => {
      setResult({ status: "win" });
    };

    const mockLose = () => {
      setResult({ status: "lose", winner: "Player 2" });
    };

    // Simulate a win after 5 seconds
    const winTimeout = setTimeout(mockWin, 5000);

    // Simulate a loss after 8 seconds
    const loseTimeout = setTimeout(mockLose, 8000);

    return () => {
      clearTimeout(winTimeout);
      clearTimeout(loseTimeout);
    };
  }, []);

  const toggleCamera = async () => {
    if (cameraActive) {
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((track) => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null; // Ensure stream is removed
      setCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 pt-8">
      <h1 className="text-3xl font-bold mb-6">Game Room: {id}</h1>
      
      {/* Always Show Win/Loss Message */}
      {result.status && (
        <div className={`w-full max-w-md p-2 text-center text-white font-bold ${result.status === "win" ? "bg-green-500" : "bg-red-500"}`}>
          {result.status === "win" ? "You win!" : `Too late! ${result.winner} won.`}
        </div>
      )}

      <div className="w-full max-w-md space-y-4 mt-4">
        <Button onClick={toggleCamera} className="w-full">
          {cameraActive ? "Stop Camera" : "Start Camera"}
        </Button>

        {/* Show Video Only When Camera is Active */}
        {cameraActive && (
          <div className="relative">
            <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
          </div>
        )}
      </div>
    </div>
  );
}
