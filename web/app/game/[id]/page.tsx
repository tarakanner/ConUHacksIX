"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import WebcamComponent from '@/components/WebcamComponent';

export default function Game() {
  const { id } = useParams();
  const [result, setResult] = useState<{ status: "pending" | "win" | "lose" | null; winner?: string }>({ status: "pending" });
  const [timeLeft, setTimeLeft] = useState<number>(20); // Initialize with 10 seconds
  
  useEffect(() => {
    // Start the countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer); // Stop the timer when it reaches 0
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Simulate game result after time runs out
    const mockWin = () => {
      setResult({ status: "win" });
    };

    const mockLose = () => {
      setResult({ status: "lose", winner: "Player 2" });
    };

    // Simulate a win after 2 seconds
    const winTimeout = setTimeout(mockWin, 5000);

    // Simulate a loss after 8 seconds
    const loseTimeout = setTimeout(mockLose, 5000);

    return () => {
      clearTimeout(winTimeout);
      clearTimeout(loseTimeout);
      clearInterval(timer); // Clear the timer when the component unmounts or game ends
    };
  }, []);
  
  return (
    <div className="flex items-center justify-center min-h-screen p-4 pt-8">
      {/* Card Container */}
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg space-y-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Game Room: {id}</h1>

        {/* Show pending state by default */}
        {result.status === "pending" && (
          <div className="w-full p-2 text-center text-white font-bold bg-yellow-500">
            Waiting for the word...
          </div>
        )}

        {/* Show timer */}
        <div className="w-full p-2 text-center text-white font-bold bg-blue-500">
          Time Left: {timeLeft} seconds
        </div>

        {/* Show win/loss message when game state changes */}
        {result.status && result.status !== "pending" && (
          <div className={`w-full p-2 text-center text-white font-bold ${result.status === "win" ? "bg-green-500" : "bg-red-500"}`}>
            {result.status === "win" ? "You win!" : `Too late! ${result.winner} won.`}
          </div>
        )}

        <WebcamComponent />
      </div>
    </div>
  );
}
