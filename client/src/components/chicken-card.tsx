import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { Chicken, Resource } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { Egg } from "lucide-react";

interface ChickenCardProps {
  chicken: Chicken;
  resources: Resource;
  onHatch: () => void;
}

export default function ChickenCard({ chicken, resources, onHatch }: ChickenCardProps) {
  const [cooldownProgress, setCooldownProgress] = useState(0);
  const [canHatch, setCanHatch] = useState(false);
  const [isFeeding, setIsFeeding] = useState(false);

  const requirements = {
    baby: { water: 1, wheat: 1, cooldown: 6 * 60 * 60 * 1000 },
    regular: { water: 2, wheat: 2, cooldown: 5 * 60 * 60 * 1000 },
    golden: { water: 10, wheat: 15, cooldown: 3 * 60 * 60 * 1000 },
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!chicken.lastHatchTime) {
        setCooldownProgress(100);
        return;
      }

      const cooldownTime = requirements[chicken.type as keyof typeof requirements].cooldown;
      const timePassed = Date.now() - new Date(chicken.lastHatchTime).getTime();
      const progress = Math.min((timePassed / cooldownTime) * 100, 100);

      setCooldownProgress(progress);
      setCanHatch(progress === 100);
    }, 1000);

    return () => clearInterval(interval);
  }, [chicken]);

  const hasResources = () => {
    const req = requirements[chicken.type as keyof typeof requirements];
    return resources.waterBuckets >= req.water && resources.wheatBags >= req.wheat;
  };

  const handleHatch = () => {
    setIsFeeding(true);
    setTimeout(() => {
      onHatch();
      setIsFeeding(false);
    }, 1000);
  };

  const getChickenEmoji = () => {
    switch (chicken.type) {
      case "baby":
        return "🐤";
      case "golden":
        return "🐥";
      default:
        return "🐔";
    }
  };

  return (
    <Card className="w-full max-w-sm overflow-hidden">
      <CardHeader>
        <CardTitle className="capitalize flex items-center gap-2">
          {chicken.type} Chicken
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div
          animate={{
            scale: isFeeding ? 1.1 : 1,
            y: isFeeding ? -10 : 0
          }}
          transition={{ duration: 0.2 }}
          className="text-center py-4"
        >
          <motion.span
            className="text-6xl inline-block cursor-pointer"
            whileHover={{ scale: 1.2, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            {getChickenEmoji()}
          </motion.span>
        </motion.div>

        <div className="space-y-2">
          <div className="text-sm flex justify-between">
            <span>Cooldown Progress</span>
            <span>{Math.round(cooldownProgress)}%</span>
          </div>
          <Progress value={cooldownProgress} />
        </div>

        <AnimatePresence>
          {canHatch && hasResources() && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Button 
                onClick={handleHatch}
                className="w-full relative overflow-hidden group"
                disabled={!canHatch || !hasResources()}
              >
                <span className="relative z-10">Hatch Eggs</span>
                <motion.div
                  className="absolute inset-0 bg-primary/20"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    repeat: Infinity,
                    duration: 1,
                    ease: "linear"
                  }}
                />
                <Egg className="w-4 h-4 ml-2 inline-block" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {!hasResources() && (
          <p className="text-sm text-muted-foreground text-center">
            Need {requirements[chicken.type as keyof typeof requirements].water}🪣 water and{" "}
            {requirements[chicken.type as keyof typeof requirements].wheat}🌾 wheat
          </p>
        )}
      </CardContent>
    </Card>
  );
}