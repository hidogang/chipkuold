import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Resource } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

export default function BalanceBar() {
  const { user } = useAuth();

  const resourcesQuery = useQuery<Resource>({
    queryKey: ["/api/resources"],
    staleTime: 0,
    retry: 2,
  });

  console.log('[BalanceBar] Current user balance:', user?.usdtBalance);
  console.log('[BalanceBar] Resources query data:', resourcesQuery.data);

  if (!user || resourcesQuery.isLoading) {
    console.log('[BalanceBar] Loading state or no user');
    return null;
  }

  if (resourcesQuery.error) {
    console.error('[BalanceBar] Resources query error:', resourcesQuery.error);
    return null;
  }

  const resources = resourcesQuery.data || { waterBuckets: 0, wheatBags: 0, eggs: 0 };

  const items = [
    {
      name: "Water",
      value: resources.waterBuckets,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.5 8 3 12.5 3 16.5C3 20.5 7 24 12 24C17 24 21 20.5 21 16.5C21 12.5 17.5 8 12 2Z" fill="#4FC3F7" />
          <path d="M12 22C8.13 22 5 19.5 5 16.5C5 13.87 7.61 10.44 12 6.25C16.39 10.44 19 13.87 19 16.5C19 19.5 15.87 22 12 22Z" fill="#81D4FA" />
          <path d="M12 19C10.35 19 9 17.65 9 16C9 14.35 10.35 13 12 13C13.65 13 15 14.35 15 16C15 17.65 13.65 19 12 19Z" fill="#E1F5FE" />
        </svg>
      ),
      color: "#29B6F6",
      bgGradient: "linear-gradient(135deg, rgba(3, 169, 244, 0.2), rgba(3, 169, 244, 0.05))",
      borderGradient: "linear-gradient(135deg, rgba(3, 169, 244, 0.5), rgba(3, 169, 244, 0.2))",
      glowColor: "rgba(3, 169, 244, 0.3)",
      textColor: "#01579B"
    },
    {
      name: "Wheat",
      value: resources.wheatBags,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L13.5 5H10.5L12 2Z" fill="#FFA000" />
          <path d="M12 5V9M15 12H9M8 15L16 15M12 18V22" stroke="#FFC107" strokeWidth="2" strokeLinecap="round" />
          <path d="M19.5 10C19.5 14.75 16.5 18.5 12 18.5C7.5 18.5 4.5 14.75 4.5 10C4.5 5.25 7.5 5 12 5C16.5 5 19.5 5.25 19.5 10Z" fill="#FFECB3" />
          <path d="M15 10C15 12.75 13.75 15 12 15C10.25 15 9 12.75 9 10C9 7.25 10.25 8.5 12 8.5C13.75 8.5 15 7.25 15 10Z" fill="#FFC107" />
        </svg>
      ),
      color: "#FFC107",
      bgGradient: "linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 193, 7, 0.05))",
      borderGradient: "linear-gradient(135deg, rgba(255, 193, 7, 0.5), rgba(255, 193, 7, 0.2))",
      glowColor: "rgba(255, 193, 7, 0.3)",
      textColor: "#FF6F00"
    },
    {
      name: "Eggs",
      value: resources.eggs,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="12" cy="14" rx="9" ry="8" fill="#FFF9C4" />
          <ellipse cx="12" cy="14" rx="8" ry="7" fill="#FFFDE7" />
          <ellipse cx="12" cy="7" rx="6" ry="5" fill="#FAFAFA" />
          <path d="M12 4C15.866 4 19 8.032 19 13C19 17.968 15.866 22 12 22C8.13401 22 5 17.968 5 13C5 8.032 8.13401 4 12 4Z" stroke="#FFCC80" strokeWidth="1.5" />
        </svg>
      ),
      color: "#FFB74D",
      bgGradient: "linear-gradient(135deg, rgba(255, 183, 77, 0.2), rgba(255, 183, 77, 0.05))",
      borderGradient: "linear-gradient(135deg, rgba(255, 183, 77, 0.5), rgba(255, 183, 77, 0.2))",
      glowColor: "rgba(255, 183, 77, 0.3)",
      textColor: "#E65100"
    },
    {
      name: "USDT",
      value: user.usdtBalance,
      prefix: "$",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#FFCA28" />
          <circle cx="12" cy="12" r="8" fill="#FFD54F" />
          <path d="M12 6V18M8 10H16M8 14H16" stroke="#FF6F00" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      color: "#FFB300",
      bgGradient: "linear-gradient(135deg, rgba(255, 179, 0, 0.2), rgba(255, 179, 0, 0.05))",
      borderGradient: "linear-gradient(135deg, rgba(255, 179, 0, 0.5), rgba(255, 179, 0, 0.2))",
      glowColor: "rgba(255, 179, 0, 0.3)",
      textColor: "#E65100"
    },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-30">
      <motion.div
        className="township-resource-bar max-w-4xl mx-auto overflow-hidden my-2 px-3"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <div className="relative p-2 rounded-2xl backdrop-blur-md"
          style={{
            background: "linear-gradient(135deg, rgba(255, 165, 61, 0.95), rgba(255, 124, 46, 0.9))",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.1)",
            border: "2px solid rgba(255, 208, 91, 0.7)",
          }}
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="particle-container">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-white/20"
                  animate={{
                    x: ["0%", "100%"],
                    y: ["0%", "100%"],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "linear",
                  }}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {items.map((item, index) => (
              <motion.div
                key={item.name}
                className="flex-1 relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <div
                  className="relative overflow-hidden rounded-xl p-3"
                  style={{
                    background: item.bgGradient,
                    border: "1px solid transparent",
                    borderImage: item.borderGradient,
                    borderImageSlice: 1,
                    boxShadow: `0 4px 12px ${item.glowColor}, inset 0 2px 4px rgba(255, 255, 255, 0.2)`,
                  }}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 w-full h-full"
                    animate={{
                      background: [
                        "linear-gradient(45deg, transparent 0%, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
                        "linear-gradient(45deg, transparent 0%, rgba(255,255,255,0) 100%, rgba(255,255,255,0.1) 150%, transparent 200%)",
                      ],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />

                  <div className="flex items-center gap-2">
                    <motion.div
                      className="p-2 rounded-lg"
                      style={{
                        background: `linear-gradient(135deg, ${item.glowColor}, transparent)`,
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {item.icon}
                    </motion.div>

                    <div className="flex-grow min-w-0">
                      <div className="text-xs font-medium" style={{ color: item.textColor }}>
                        {item.name}
                      </div>
                      <motion.div
                        className="text-lg font-bold truncate"
                        style={{ color: item.textColor }}
                        animate={{
                          textShadow: [
                            `0 0 8px ${item.glowColor}`,
                            `0 0 12px ${item.glowColor}`,
                            `0 0 8px ${item.glowColor}`,
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        {item.prefix}{item.value}
                      </motion.div>
                    </div>

                    <motion.button
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                      style={{
                        background: `linear-gradient(to bottom right, ${item.color}, ${item.color}dd)`,
                        boxShadow: `0 2px 8px ${item.glowColor}`,
                      }}
                      whileHover={{
                        scale: 1.1,
                        rotate: 5,
                        boxShadow: `0 4px 12px ${item.glowColor}`,
                      }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <span className="text-lg font-bold">+</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}