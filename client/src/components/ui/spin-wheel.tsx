import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { dailySpinRewards, superJackpotRewards, type SpinRewardType } from "@shared/schema";
import { Loader2 } from "lucide-react";
import Confetti from "react-confetti";

interface SpinWheelProps {
  onSpin: () => Promise<{
    reward: {
      type: string;
      amount: number;
      chickenType?: string;
    };
  }>;
  rewards: SpinRewardType[];
  isSpinning: boolean;
  spinType: "daily" | "super";
}

export function SpinWheel({ onSpin, rewards, isSpinning, spinType }: SpinWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentReward, setCurrentReward] = useState<{ type: string; amount: number; chickenType?: string } | null>(null);

  const segmentAngle = 360 / rewards.length;

  // Calculate colors for segments - Updated with more vibrant colors
  const segmentColors = [
    "bg-gradient-to-r from-blue-500 to-blue-600",
    "bg-gradient-to-r from-green-500 to-green-600",
    "bg-gradient-to-r from-yellow-500 to-yellow-600",
    "bg-gradient-to-r from-purple-500 to-purple-600",
    "bg-gradient-to-r from-pink-500 to-pink-600",
    "bg-gradient-to-r from-indigo-500 to-indigo-600",
    "bg-gradient-to-r from-red-500 to-red-600",
    "bg-gradient-to-r from-orange-500 to-orange-600",
  ];

  const handleSpin = async () => {
    try {
      // Calculate random number of full rotations (between 5 and 8)
      const fullRotations = Math.floor(Math.random() * 3 + 5) * 360;

      // Start the spin animation
      setRotation(prev => prev + fullRotations);

      // Get the actual reward from the server
      const result = await onSpin();

      // Find the segment index for this reward
      const rewardIndex = rewards.findIndex(r => 
        r.reward.type === result.reward.type && 
        r.reward.amount === result.reward.amount
      );

      // Calculate final rotation to land on the correct segment
      const finalRotation = fullRotations + (360 - (rewardIndex * segmentAngle));
      setRotation(finalRotation);

      // Show reward after spin completes
      setTimeout(() => {
        setCurrentReward(result.reward);
        setShowConfetti(true);
      }, 3000);

      // Hide confetti after 5 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 8000);

    } catch (error) {
      console.error("Error during spin:", error);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={200}
          />
        </div>
      )}

      {/* Wheel Container with Glowing Effect */}
      <div className="relative w-80 h-80">
        {/* Center Point */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 z-20 shadow-lg border-2 border-white" />

        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 w-8 h-8 z-10">
          <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[20px] border-l-transparent border-r-transparent border-t-amber-600 filter drop-shadow-lg" />
        </div>

        {/* Wheel */}
        <motion.div
          className="w-full h-full rounded-full border-8 border-amber-600/20 overflow-hidden relative shadow-[0_0_15px_rgba(251,191,36,0.3)] backdrop-blur-sm"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: "transform 3s cubic-bezier(0.2, 0.8, 0.2, 1)"
          }}
        >
          {rewards.map((reward, index) => (
            <div
              key={index}
              className={cn(
                "absolute w-1/2 h-1/2 origin-bottom-right transform -translate-y-1/2",
                segmentColors[index % segmentColors.length]
              )}
              style={{
                transform: `rotate(${index * segmentAngle}deg)`,
                transformOrigin: "0% 100%"
              }}
            >
              <div 
                className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 translate-y-1/2 text-white text-xs font-bold text-center whitespace-nowrap rotate-90 drop-shadow-md"
                style={{ width: "120px" }}
              >
                {reward.reward.type === "usdt" ? `$${reward.reward.amount}` :
                 reward.reward.type === "chicken" ? `${reward.reward.chickenType} Chicken` :
                 `${reward.reward.amount} ${reward.reward.type}`}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Spin Button */}
      <Button
        className="mt-8 px-8 py-4 text-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        onClick={handleSpin}
        disabled={isSpinning}
      >
        {isSpinning ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Spinning...
          </>
        ) : (
          `Spin ${spinType === "super" ? "Super Jackpot" : "Wheel"}`
        )}
      </Button>

      {/* Current Reward Display */}
      {currentReward && (
        <Card className="mt-6 p-6 text-center bg-gradient-to-b from-amber-50 to-amber-100/50 border-amber-200 shadow-lg animate-in fade-in-0 duration-500">
          <p className="text-lg font-semibold text-amber-900">
            Congratulations! You won:
          </p>
          <p className="text-2xl font-bold mt-2 text-amber-700">
            {currentReward.type === "usdt" ? `$${currentReward.amount} USDT` :
             currentReward.type === "chicken" ? `1 ${currentReward.chickenType} Chicken` :
             `${currentReward.amount} ${currentReward.type}`}
          </p>
        </Card>
      )}
    </div>
  );
}