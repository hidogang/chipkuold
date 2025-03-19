import { motion } from "framer-motion";

interface LoadingChickensProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

export function LoadingChickens({ size = "md", message = "Loading..." }: LoadingChickensProps) {
  const chickens = [
    "/assets/babychicken.png",
    "/assets/regularchicken.png",
    "/assets/goldenchicken.png"
  ];

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-4">
        {chickens.map((chicken, index) => (
          <motion.div
            key={index}
            initial={{ y: 0 }}
            animate={{
              y: [-10, 0, -10],
              rotate: [0, index === 1 ? -5 : 5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut"
            }}
          >
            <img
              src={chicken}
              alt={`Loading Chicken ${index + 1}`}
              className={`${sizeClasses[size]} object-contain`}
            />
          </motion.div>
        ))}
      </div>
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mt-4 text-amber-700 font-medium"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}
