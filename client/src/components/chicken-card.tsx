import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useRef } from "react";
import { Chicken, Resource } from "@shared/schema";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Egg, Droplets, Wheat, Cloud, Sun } from "lucide-react";

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
  const [chickenState, setChickenState] = useState<'idle' | 'walk' | 'peck' | 'flap'>('idle');
  const controls = useAnimation();
  const walkInterval = useRef<NodeJS.Timeout | null>(null);

  // Animate chicken with more complex behaviors
  useEffect(() => {
    // Random chicken behaviors
    const startRandomBehaviors = () => {
      const behaviors = ['idle', 'walk', 'peck', 'flap'];
      const randomInterval = () => 3000 + Math.random() * 7000; // 3-10 seconds
      
      const runBehavior = () => {
        if (!isFeeding) { // Don't change state during feeding
          const randomBehavior = behaviors[Math.floor(Math.random() * behaviors.length)] as 'idle' | 'walk' | 'peck' | 'flap';
          setChickenState(randomBehavior);
          
          // For walk behavior, animate chicken position
          if (randomBehavior === 'walk' && !walkInterval.current) {
            const direction = Math.random() > 0.5 ? 1 : -1;
            walkInterval.current = setInterval(() => {
              controls.start({
                x: direction * (10 + Math.random() * 20),
                transition: { duration: 0.8, ease: "easeInOut" }
              });
            }, 800);
            
            // Stop walking after a random duration
            setTimeout(() => {
              if (walkInterval.current) {
                clearInterval(walkInterval.current);
                walkInterval.current = null;
                controls.start({ x: 0, transition: { duration: 0.5 } });
              }
            }, 2000 + Math.random() * 2000);
          }
        }
        
        setTimeout(runBehavior, randomInterval());
      };
      
      // Start the cycle
      runBehavior();
    };
    
    startRandomBehaviors();
    
    return () => {
      if (walkInterval.current) {
        clearInterval(walkInterval.current);
      }
    };
  }, [controls, isFeeding]);

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
    if (walkInterval.current) {
      clearInterval(walkInterval.current);
      walkInterval.current = null;
    }
    
    // Reset position before feeding animation
    controls.start({ x: 0, transition: { duration: 0.2 } });
    
    setTimeout(() => {
      onHatch();
      setIsFeeding(false);
    }, 1500);
  };

  // Get yield from chicken
  const getYield = () => {
    return requirements[chicken.type as keyof typeof requirements].eggYield;
  };

  // Get animation variables based on chicken state
  const getChickenAnimation = () => {
    switch (chickenState) {
      case 'idle':
        return {
          y: [0, -2, 0],
          rotate: 0,
          transition: { 
            y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
            rotate: { duration: 0.5 }
          }
        };
      case 'walk':
        return {
          y: [0, -5, 0, -5, 0],
          rotate: [0, 5, 0, -5, 0],
          transition: { 
            y: { repeat: Infinity, duration: 1, ease: "easeInOut" },
            rotate: { repeat: Infinity, duration: 1, ease: "easeInOut" }
          }
        };
      case 'peck':
        return {
          y: [0, 10, 0],
          rotate: [0, 15, 0],
          transition: { 
            y: { repeat: 3, duration: 0.3, ease: "easeInOut" },
            rotate: { repeat: 3, duration: 0.3, ease: "easeInOut" }
          }
        };
      case 'flap':
        return {
          y: [0, -10, 0],
          rotate: [0, -5, 5, -5, 0],
          scale: [1, 1.1, 1],
          transition: { 
            y: { duration: 0.5, ease: "easeOut" },
            rotate: { duration: 0.5, ease: "easeInOut" },
            scale: { duration: 0.5, ease: "easeInOut" }
          }
        };
      default:
        return {
          y: 0,
          rotate: 0,
          transition: { duration: 0.5 }
        };
    }
  };

  // Feeding animation is special
  const getFeedingAnimation = () => {
    return {
      y: [0, -15, -5, -15, 0],
      rotate: [0, -5, 5, -5, 0],
      scale: [1, 1.2, 1.1, 1.2, 1],
      transition: { 
        duration: 1.5,
        times: [0, 0.2, 0.5, 0.8, 1],
        ease: "easeInOut"
      }
    };
  };

  // Township-style chicken colors and themes
  const getChickenTheme = () => {
    switch (chicken.type) {
      case "baby":
        return {
          cardBg: "linear-gradient(135deg, #fff4d9, #ffebb3)",
          headerBg: "linear-gradient(to bottom, #ffc107, #ffb300)",
          border: "#ffd54f",
          progressBg: "linear-gradient(to right, #ffca28, #ffb300)",
          buttonBg: "linear-gradient(to bottom, #ffb300, #ffa000)",
          buttonHoverBg: "linear-gradient(to bottom, #ffa000, #ff8f00)",
          shadow: "0 4px 12px rgba(255, 179, 0, 0.3)"
        };
      case "golden":
        return {
          cardBg: "linear-gradient(135deg, #fff9e6, #ffe0b2)",
          headerBg: "linear-gradient(to bottom, #ffc107, #ff9800)",
          border: "#ffb74d",
          progressBg: "linear-gradient(to right, #ffb74d, #ff9800)",
          buttonBg: "linear-gradient(to bottom, #ff9800, #f57c00)",
          buttonHoverBg: "linear-gradient(to bottom, #f57c00, #ef6c00)",
          shadow: "0 4px 12px rgba(255, 152, 0, 0.3)"
        };
      default:
        return {
          cardBg: "linear-gradient(135deg, #ffecb3, #ffe0b2)",
          headerBg: "linear-gradient(to bottom, #ff9800, #fb8c00)",
          border: "#ffa726",
          progressBg: "linear-gradient(to right, #ffa726, #fb8c00)",
          buttonBg: "linear-gradient(to bottom, #fb8c00, #f57c00)",
          buttonHoverBg: "linear-gradient(to bottom, #f57c00, #ef6c00)",
          shadow: "0 4px 12px rgba(251, 140, 0, 0.3)"
        };
    }
  };

  const theme = getChickenTheme();
  const chickenAnimation = getChickenAnimation();
  const feedingAnimation = getFeedingAnimation();

  return (
    <div 
      className="township-chicken-card w-full h-full max-w-sm rounded-xl overflow-hidden"
      style={{ 
        background: theme.cardBg,
        boxShadow: theme.shadow,
        border: `2px solid ${theme.border}`,
        transform: "translateZ(0)" // Fix for safari rendering
      }}
    >
      <div 
        className="p-3 sm:p-4"
        style={{ background: theme.headerBg }}
      >
        <div className="flex items-center justify-between text-white">
          <h3 className="capitalize text-base sm:text-lg font-bold">{chicken.type} Chicken</h3>
          <div className="bg-white/30 backdrop-blur-sm rounded-full px-2 py-1 flex items-center">
            <Egg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-white" />
            <span className="text-xs sm:text-sm font-semibold">×{getYield()}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-3 sm:space-y-4 p-3 sm:p-4">
        <div className="township-chicken-scene relative h-32 sm:h-40 rounded-lg overflow-hidden bg-gradient-to-b from-sky-200 to-green-100">
          {/* Sky and ground elements */}
          <div className="absolute inset-0">
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-green-300 to-transparent"></div>
            <motion.div 
              className="absolute top-2 right-4 text-yellow-500"
              animate={{ 
                rotate: 360,
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                rotate: { repeat: Infinity, duration: 60, ease: "linear" },
                opacity: { repeat: Infinity, duration: 4, ease: "easeInOut" }
              }}
            >
              <Sun className="w-6 h-6 sm:w-8 sm:h-8" />
            </motion.div>
            
            <motion.div 
              className="absolute top-3 left-4 text-white"
              animate={{ x: [0, 100], opacity: [0.7, 0, 0.7] }}
              transition={{ 
                repeat: Infinity, 
                duration: 20, 
                ease: "linear",
                repeatType: "loop"
              }}
            >
              <Cloud className="w-8 h-8 sm:w-10 sm:h-10 opacity-80" />
            </motion.div>

            <motion.div 
              className="absolute top-6 left-24 text-white"
              animate={{ x: [0, 120], opacity: [0, 0.7, 0] }}
              transition={{ 
                repeat: Infinity, 
                duration: 30,
                delay: 5, 
                ease: "linear",
                repeatType: "loop"
              }}
            >
              <Cloud className="w-6 h-6 sm:w-7 sm:h-7 opacity-60" />
            </motion.div>
          </div>

          {/* Chicken */}
          <motion.div
            className="absolute bottom-3 left-1/2 transform -translate-x-1/2"
            animate={controls}
          >
            <motion.div
              animate={isFeeding ? feedingAnimation : chickenAnimation}
              className="relative"
            >
              <img
                src={chicken.type === 'golden' 
                  ? '/assets/goldenchicken.png' 
                  : chicken.type === 'regular' 
                    ? '/assets/regularchicken.png' 
                    : '/assets/babychicken.png'}
                alt={`${chicken.type} Chicken`}
                className="h-20 w-20 sm:h-24 sm:w-24 object-contain"
                onError={(e) => {
                  // Fallback if image doesn't load
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI0ZGQTUwMCIgZD0iTTEyLDJBMTAsMTAgMCAwLDAgMiwxMkExMCwxMCAwIDAsMCAxMiwyMkExMCwxMCAwIDAsMCAyMiwxMkExMCwxMCAwIDAsMCAxMiwyTTEyLDRBOCw4IDAgMCwxIDIwLDEyQTgsOCAwIDAsMSAxMiwyMEE4LDggMCAwLDEgNCwxMkE4LDggMCAwLDEgMTIsNE0xMCw5LjVDMTAsNy42IDguNCw2IDYuNSw2QzQuNiw2IDMsNy42IDMsOS41QzMsMTEuNCAxLjUsMTMgMS41LDEzTDQuNSwxOUw5LDE1QzksOSAxMCw5LjUgMTAsOS41WiIgLz48L3N2Zz4=";
                }}
              />
              
              {/* Egg dropping animation when feeding */}
              <AnimatePresence>
                {isFeeding && (
                  <motion.div 
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
                    initial={{ y: 0, opacity: 0, scale: 0.5 }}
                    animate={{ 
                      y: [0, 30, 60],
                      opacity: [0, 1, 0],
                      scale: [0.5, 1, 0.8]
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ 
                      duration: 1,
                      times: [0, 0.6, 1],
                      ease: ["easeOut", "easeIn"]
                    }}
                  >
                    <Egg className="w-6 h-6 sm:w-7 sm:h-7 text-amber-100 fill-amber-50" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-gray-700">Next Hatch:</span>
            <span 
              className={`font-semibold ${canHatch ? 'text-green-600' : 'text-amber-600'}`}
            >
              {timeLeft}
            </span>
          </div>
          
          <div className="township-progress h-2 sm:h-3 rounded-full bg-gray-200 overflow-hidden">
            <motion.div 
              className="h-full rounded-full"
              style={{ 
                background: theme.progressBg,
                width: `${cooldownProgress}%` 
              }}
              initial={{ width: "0%" }}
              animate={{ width: `${cooldownProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence>
          {canHatch && hasResources() && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <button 
                onClick={handleHatch}
                className="township-button w-full h-10 sm:h-12 flex items-center justify-center text-white rounded-lg font-bold text-sm sm:text-base relative overflow-hidden"
                style={{ 
                  background: theme.buttonBg,
                  border: `2px solid ${theme.border}`,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                }}
                disabled={!canHatch || !hasResources()}
                onMouseOver={(e) => {
                  const target = e.currentTarget;
                  target.style.background = theme.buttonHoverBg;
                }}
                onMouseOut={(e) => {
                  const target = e.currentTarget;
                  target.style.background = theme.buttonBg;
                }}
              >
                <span className="z-10 mr-2">Hatch Eggs</span>
                <motion.div
                  className="z-10 flex items-center justify-center bg-white/20 rounded-full p-1"
                  animate={{ rotate: [0, 10, 0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Egg className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.div>
                
                <motion.div
                  className="absolute inset-0 bg-white/10"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear"
                  }}
                />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {!canHatch && (
          <div className="text-center text-sm text-gray-600 py-1.5">
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex justify-center items-center"
            >
              <span>Cooldown in progress</span>
              <span className="ml-1">
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >.</motion.span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.25 }}
                >.</motion.span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                >.</motion.span>
              </span>
            </motion.div>
          </div>
        )}

        {canHatch && !hasResources() && (
          <motion.div 
            className="bg-white/70 backdrop-blur-sm rounded-lg p-3 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="font-semibold text-orange-600 mb-2">Missing Resources:</p>
            <div className="flex justify-center space-x-6">
              <div className="flex flex-col items-center">
                <div className={`p-1.5 rounded-full mb-1 ${resources.waterBuckets >= requirements[chicken.type as keyof typeof requirements].water ? 'bg-blue-100' : 'bg-red-100'}`}>
                  <Droplets className={`w-4 h-4 sm:w-5 sm:h-5 ${resources.waterBuckets >= requirements[chicken.type as keyof typeof requirements].water ? 'text-blue-500' : 'text-red-500'}`} />
                </div>
                <span className="text-sm font-medium">
                  {resources.waterBuckets}/{requirements[chicken.type as keyof typeof requirements].water}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <div className={`p-1.5 rounded-full mb-1 ${resources.wheatBags >= requirements[chicken.type as keyof typeof requirements].wheat ? 'bg-amber-100' : 'bg-red-100'}`}>
                  <Wheat className={`w-4 h-4 sm:w-5 sm:h-5 ${resources.wheatBags >= requirements[chicken.type as keyof typeof requirements].wheat ? 'text-amber-500' : 'text-red-500'}`} />
                </div>
                <span className="text-sm font-medium">
                  {resources.wheatBags}/{requirements[chicken.type as keyof typeof requirements].wheat}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}