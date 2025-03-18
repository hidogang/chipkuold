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

  // Calculate colors for segments
  const segmentColors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-orange-500",
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
      {showConfetti && <Confetti />}
      
      {/* Wheel Container */}
      <div className="relative w-80 h-80">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 w-8 h-8 z-10">
          <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[20px] border-l-transparent border-r-transparent border-t-red-600" />
        </div>

        {/* Wheel */}
        <motion.div
          className="w-full h-full rounded-full border-8 border-gray-300 overflow-hidden relative"
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
                className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 translate-y-1/2 text-white text-xs font-bold text-center whitespace-nowrap rotate-90"
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
        className="mt-8 px-8 py-4 text-lg"
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
        <Card className="mt-6 p-4 text-center bg-primary/10">
          <p className="text-lg font-semibold">
            Congratulations! You won:
          </p>
          <p className="text-xl font-bold mt-2">
            {currentReward.type === "usdt" ? `$${currentReward.amount} USDT` :
             currentReward.type === "chicken" ? `1 ${currentReward.chickenType} Chicken` :
             `${currentReward.amount} ${currentReward.type}`}
          </p>
        </Card>
      )}
    </div>
  );
}
