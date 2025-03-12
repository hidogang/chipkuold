import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { Chicken, Resource } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { Egg, Droplets, Wheat } from "lucide-react";

interface ChickenCardProps {
  chicken: Chicken;
  resources: Resource;
  onHatch: () => void;
}

export default function ChickenCard({ chicken, resources, onHatch }: ChickenCardProps) {
  const [cooldownProgress, setCooldownProgress] = useState(0);
  const [canHatch, setCanHatch] = useState(false);
  const [isFeeding, setIsFeeding] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate chicken every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const requirements = {
    baby: { 
      water: 1, 
      wheat: 1, 
      cooldown: 6 * 60 * 60 * 1000, // 6 hours
      eggYield: 2
    },
    regular: { 
      water: 2, 
      wheat: 2, 
      cooldown: 5 * 60 * 60 * 1000, // 5 hours
      eggYield: 5
    },
    golden: { 
      water: 10, 
      wheat: 15, 
      cooldown: 3 * 60 * 60 * 1000, // 3 hours
      eggYield: 20
    },
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!chicken.lastHatchTime) {
        setCooldownProgress(100);
        setTimeLeft("Ready");
        return;
      }

      const cooldownTime = requirements[chicken.type as keyof typeof requirements].cooldown;
      const now = Date.now();
      const hatchTime = new Date(chicken.lastHatchTime).getTime();
      const timePassed = now - hatchTime;
      const timeRemaining = cooldownTime - timePassed;
      
      // Convert remaining time to hours:minutes format
      if (timeRemaining <= 0) {
        setTimeLeft("Ready");
      } else {
        const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
        const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
        setTimeLeft(`${hours}h ${minutes}m`);
      }
      
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

  // Get yield from chicken
  const getYield = () => {
    return requirements[chicken.type as keyof typeof requirements].eggYield;
  };

  // Get colors based on chicken type
  const getChickenColors = () => {
    switch (chicken.type) {
      case "baby":
        return {
          primary: "bg-yellow-200",
          secondary: "text-yellow-800",
          border: "border-yellow-300",
          progress: "bg-yellow-500"
        };
      case "golden":
        return {
          primary: "bg-amber-100",
          secondary: "text-amber-900",
          border: "border-amber-400",
          progress: "bg-amber-500"
        };
      default:
        return {
          primary: "bg-orange-100",
          secondary: "text-orange-800",
          border: "border-orange-300",
          progress: "bg-orange-500"
        };
    }
  };

  const colors = getChickenColors();

  return (
    <Card className={`w-full max-w-sm overflow-hidden shadow-lg hover:shadow-xl transition-shadow ${colors.border} border-2`}>
      <CardHeader className={`${colors.primary} bg-opacity-30`}>
        <CardTitle className="capitalize flex items-center justify-between">
          <span>{chicken.type} Chicken</span>
          <span className="text-sm font-normal bg-white/80 rounded-full px-2 py-1 flex items-center">
            <Egg className="w-3 h-3 mr-1" />
            Yield: {getYield()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <div className="relative">
          {/* Background scenery elements */}
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-amber-100 to-transparent"></div>
            <motion.div 
              className="absolute top-1 left-1 w-6 h-6 text-yellow-500 opacity-80"
              animate={{ y: [0, -5, 0], opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 4 }}
            >
              ☀️
            </motion.div>
            <motion.div 
              className="absolute top-4 right-4 opacity-60"
              animate={{ y: [0, -2, 0], opacity: [0.4, 0.6, 0.4] }}
              transition={{ repeat: Infinity, duration: 5, delay: 1 }}
            >
              ☁️
            </motion.div>
          </div>

          {/* Chicken animation */}
          <motion.div
            animate={{
              scale: isFeeding ? 1.2 : isAnimating ? 1.1 : 1,
              y: isFeeding ? -15 : isAnimating ? [-5, 0] : 0,
              rotate: isFeeding ? [0, -5, 5, 0] : isAnimating ? [0, -3, 3, 0] : 0,
            }}
            transition={{ 
              duration: isFeeding ? 0.5 : 0.3,
              type: "spring", 
              stiffness: 300
            }}
            className="relative z-10 mx-auto py-6 flex justify-center"
          >
            <motion.img
              src={`/assets/chicken-${chicken.type}.svg`}
              alt={`${chicken.type} Chicken`}
              className="h-32 w-32 object-contain"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            />
            
            {/* Egg dropping animation when feeding */}
            <AnimatePresence>
              {isFeeding && (
                <motion.div 
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 50, opacity: [0, 1, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Egg className="w-6 h-6 text-amber-100 fill-amber-50" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="space-y-2">
          <div className="text-sm flex justify-between">
            <span>Next Hatch:</span>
            <span className={`font-medium ${canHatch ? 'text-green-600' : 'text-amber-600'}`}>
              {timeLeft}
            </span>
          </div>
          <Progress 
            value={cooldownProgress} 
            className="h-2 bg-gray-100" 
            indicatorClassName={`${colors.progress}`} 
          />
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
                className="w-full relative overflow-hidden group bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 border-none"
                disabled={!canHatch || !hasResources()}
              >
                <span className="relative z-10 font-medium">Hatch Eggs</span>
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear"
                  }}
                />
                <Egg className="w-4 h-4 ml-2 inline-block" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {!canHatch && (
          <div className="text-center text-sm text-muted-foreground">
            <motion.p
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              Cooldown in progress...
            </motion.p>
          </div>
        )}

        {canHatch && !hasResources() && (
          <motion.div 
            className="text-sm text-center space-y-2 bg-red-50 p-3 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="font-medium text-red-600">Missing resources:</p>
            <div className="flex justify-center space-x-4">
              <div className="flex items-center">
                <Droplets className="w-4 h-4 mr-1 text-blue-500" />
                <span className={resources.waterBuckets >= requirements[chicken.type as keyof typeof requirements].water ? "text-green-600" : "text-red-600"}>
                  {resources.waterBuckets}/{requirements[chicken.type as keyof typeof requirements].water}
                </span>
              </div>
              <div className="flex items-center">
                <Wheat className="w-4 h-4 mr-1 text-amber-500" />
                <span className={resources.wheatBags >= requirements[chicken.type as keyof typeof requirements].wheat ? "text-green-600" : "text-red-600"}>
                  {resources.wheatBags}/{requirements[chicken.type as keyof typeof requirements].wheat}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}