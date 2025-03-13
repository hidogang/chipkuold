import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Chicken, Resource } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import BalanceBar from "@/components/balance-bar";
import ChickenCard from "@/components/chicken-card";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Droplets, Wheat, Egg, ChevronsRight, ChevronsLeft, X, Building, Building2, TreePine, Tractor } from "lucide-react";

export default function HomePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('day');
  const [activeTab, setActiveTab] = useState<'farm' | 'buildings' | 'decorations'>('farm');
  const [showSidebar, setShowSidebar] = useState(false);
  const farmAreaRef = useRef<HTMLDivElement>(null);
  
  // Farm grid info
  const gridSize = { rows: 6, cols: 8 };
  const [activeTool, setActiveTool] = useState<'select' | 'move' | 'place'>('select');
  const [draggedItem, setDraggedItem] = useState<null | { type: string, id: number }>(null);
  
  // Position management for draggable items
  const [chickenPositions, setChickenPositions] = useState<{[key: number]: {x: number, y: number}}>({});

  // Day-night cycle logic
  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 17) {
        setTimeOfDay('day');
      } else if (hour >= 17 && hour < 20) {
        setTimeOfDay('sunset');
      } else {
        setTimeOfDay('night');
      }
    };

    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const chickensQuery = useQuery<Chicken[]>({
    queryKey: ["/api/chickens"],
  });

  const resourcesQuery = useQuery<Resource>({
    queryKey: ["/api/resources"],
  });

  const hatchMutation = useMutation({
    mutationFn: async (chickenId: number) => {
      const res = await apiRequest("POST", `/api/chickens/${chickenId}/hatch`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chickens"] });
      toast({
        title: "Success",
        description: "Successfully hatched eggs!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Initialize chicken positions if they don't exist
  useEffect(() => {
    if (chickensQuery.data?.length) {
      const initialPositions: {[key: number]: {x: number, y: number}} = {};
      
      chickensQuery.data.forEach((chicken, index) => {
        if (!chickenPositions[chicken.id]) {
          // Arrange in grid pattern - each chicken takes a position based on its index
          const row = Math.floor(index / 3);
          const col = index % 3;
          initialPositions[chicken.id] = { 
            x: 80 + col * 160, 
            y: 120 + row * 140 
          };
        }
      });
      
      if (Object.keys(initialPositions).length > 0) {
        setChickenPositions(prev => ({
          ...prev,
          ...initialPositions
        }));
      }
    }
  }, [chickensQuery.data]);

  const handleDragStart = (chickenId: number) => {
    setDraggedItem({ type: 'chicken', id: chickenId });
    setActiveTool('move');
  };

  const handleDragEnd = (chickenId: number, position: { x: number, y: number }) => {
    if (farmAreaRef.current) {
      const farmRect = farmAreaRef.current.getBoundingClientRect();
      
      // Keep the chicken within farm bounds
      let x = Math.max(0, Math.min(position.x, farmRect.width - 100));
      let y = Math.max(0, Math.min(position.y, farmRect.height - 100));
      
      setChickenPositions(prev => ({
        ...prev,
        [chickenId]: { x, y }
      }));
    }
    
    setDraggedItem(null);
    setActiveTool('select');
  };

  if (chickensQuery.isLoading || resourcesQuery.isLoading) {
    return (
      <div className="landscape-app">
        <BalanceBar />
        <div className="grid grid-cols-2 gap-4 mt-4 p-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Create a proper Resource type object with required fields
  const resources: Resource = resourcesQuery.data 
    ? resourcesQuery.data 
    : { 
        id: 0, 
        userId: user?.id || 0, 
        waterBuckets: 0, 
        wheatBags: 0, 
        eggs: 0 
      };

  // Background styles based on time of day
  const getBgStyle = () => {
    switch (timeOfDay) {
      case 'day':
        return 'bg-gradient-to-b from-sky-200 to-sky-100';
      case 'sunset':
        return 'bg-gradient-to-b from-orange-300 to-amber-100';
      case 'night':
        return 'bg-gradient-to-b from-indigo-900 to-blue-900 text-white';
    }
  };
  
  // Township-style grid tiles (grass texture)
  const renderGridTiles = () => {
    const tiles = [];
    
    for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.cols; col++) {
        const isEvenRow = row % 2 === 0;
        const isEvenCol = col % 2 === 0;
        const tileClass = ((isEvenRow && isEvenCol) || (!isEvenRow && !isEvenCol)) 
          ? 'bg-green-300/60' 
          : 'bg-green-400/40';
          
        tiles.push(
          <div 
            key={`tile-${row}-${col}`}
            className={`absolute border border-green-500/20 ${tileClass}`}
            style={{
              width: `${100 / gridSize.cols}%`,
              height: `${100 / gridSize.rows}%`,
              left: `${(col / gridSize.cols) * 100}%`,
              top: `${(row / gridSize.rows) * 100}%`
            }}
          />
        );
      }
    }
    
    return tiles;
  };

  const renderResourceBar = () => (
    <div className="resource-bar absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-800/70 to-amber-700/70 text-white px-4 py-1 flex justify-between items-center backdrop-blur-sm z-30">
      <div className="flex space-x-4">
        <motion.div 
          className="flex items-center"
          whileHover={{ scale: 1.05 }}
        >
          <Droplets className="h-4 w-4 text-blue-300 mr-1" />
          <span>{resources.waterBuckets}</span>
        </motion.div>
        
        <motion.div 
          className="flex items-center"
          whileHover={{ scale: 1.05 }}
        >
          <Wheat className="h-4 w-4 text-yellow-300 mr-1" />
          <span>{resources.wheatBags}</span>
        </motion.div>
        
        <motion.div 
          className="flex items-center"
          whileHover={{ scale: 1.05 }}
        >
          <Egg className="h-4 w-4 text-amber-100 mr-1" />
          <span>{resources.eggs}</span>
        </motion.div>
      </div>
      
      <div className="flex space-x-2">
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-7 px-2 text-white" 
          onClick={() => setShowSidebar(!showSidebar)}
        >
          {showSidebar ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
  
  const renderSidebar = () => (
    <motion.div 
      className={`township-sidebar absolute right-0 top-0 bottom-0 bg-gradient-to-l from-amber-950/80 to-amber-900/80 backdrop-blur-sm text-white z-20 overflow-y-auto flex flex-col`}
      initial={{ width: 0, opacity: 0 }}
      animate={{ 
        width: showSidebar ? 220 : 0,
        opacity: showSidebar ? 1 : 0
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="p-3 flex justify-between items-center border-b border-amber-700/60">
        <h2 className="font-bold">Build Menu</h2>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowSidebar(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="tab-navigation flex border-b border-amber-700/60">
        <button 
          className={`flex-1 py-2 px-3 ${activeTab === 'farm' ? 'bg-amber-700/60' : ''}`}
          onClick={() => setActiveTab('farm')}
        >
          <Tractor className="h-4 w-4 mx-auto mb-1" />
          <span className="text-xs">Farm</span>
        </button>
        <button 
          className={`flex-1 py-2 px-3 ${activeTab === 'buildings' ? 'bg-amber-700/60' : ''}`}
          onClick={() => setActiveTab('buildings')}
        >
          <Building2 className="h-4 w-4 mx-auto mb-1" />
          <span className="text-xs">Buildings</span>
        </button>
        <button 
          className={`flex-1 py-2 px-3 ${activeTab === 'decorations' ? 'bg-amber-700/60' : ''}`}
          onClick={() => setActiveTab('decorations')}
        >
          <TreePine className="h-4 w-4 mx-auto mb-1" />
          <span className="text-xs">Decor</span>
        </button>
      </div>
      
      <div className="p-3 flex-1">
        {activeTab === 'farm' && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold mb-2">Your Chickens</h3>
            {chickensQuery.data && chickensQuery.data.map((chicken) => (
              <div key={chicken.id} className="bg-amber-800/60 rounded p-2 flex items-center">
                <div className="w-10 h-10 relative">
                  <img 
                    src={`/assets/chicken-${chicken.type}.svg`} 
                    alt={chicken.type} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="ml-2">
                  <p className="text-xs capitalize">{chicken.type} Chicken</p>
                  <div className="text-xs text-amber-300 mt-0.5">
                    {canHatch(chicken) ? (
                      <span>Ready to hatch! ✓</span>
                    ) : (
                      <span>Cooldown in progress...</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <Button asChild size="sm" className="w-full mt-3">
              <Link href="/shop">Get More Chickens</Link>
            </Button>
          </div>
        )}
        
        {activeTab === 'buildings' && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold mb-2">Buildings</h3>
            <p className="text-xs text-amber-200">Coming soon! You'll be able to build barns, coops, and more!</p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="bg-amber-800/60 rounded p-2 flex flex-col items-center">
                <Building className="h-10 w-10 text-amber-300 mb-1" />
                <span className="text-xs">Chicken Coop</span>
                <span className="text-[10px] bg-amber-950/50 px-1 rounded mt-1">10 USDT</span>
              </div>
              <div className="bg-amber-800/60 rounded p-2 flex flex-col items-center">
                <Building2 className="h-10 w-10 text-amber-300 mb-1" />
                <span className="text-xs">Barn</span>
                <span className="text-[10px] bg-amber-950/50 px-1 rounded mt-1">15 USDT</span>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'decorations' && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold mb-2">Decorations</h3>
            <p className="text-xs text-amber-200">Coming soon! Add trees, fences and more to beautify your farm!</p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="bg-amber-800/60 rounded p-2 flex flex-col items-center">
                <TreePine className="h-10 w-10 text-green-400 mb-1" />
                <span className="text-xs">Pine Tree</span>
                <span className="text-[10px] bg-amber-950/50 px-1 rounded mt-1">5 USDT</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-amber-700/60">
        <Button asChild size="sm" className="w-full">
          <Link href="/market">Visit Market</Link>
        </Button>
      </div>
    </motion.div>
  );
  
  // Helper function to determine if a chicken can hatch
  const canHatch = (chicken: Chicken) => {
    if (!chicken.lastHatchTime) return true;
    
    const requirements = {
      baby: { cooldown: 6 * 60 * 60 * 1000 }, // 6 hours
      regular: { cooldown: 5 * 60 * 60 * 1000 }, // 5 hours
      golden: { cooldown: 3 * 60 * 60 * 1000 }, // 3 hours
    };
    
    const cooldownTime = requirements[chicken.type as keyof typeof requirements].cooldown;
    const now = Date.now();
    const hatchTime = new Date(chicken.lastHatchTime).getTime();
    const timePassed = now - hatchTime;
    
    return timePassed >= cooldownTime;
  };

  return (
    <div className={`fixed inset-0 transition-colors duration-1000 ${getBgStyle()} overflow-hidden`}>
      {/* Resource display bar */}
      {renderResourceBar()}
      
      {/* Sidebar for buildings/items */}
      {renderSidebar()}
      
      {/* Main Game Area */}
      <div 
        ref={farmAreaRef}
        className={`township-farm-area relative w-full h-full ${showSidebar ? 'mr-[220px]' : ''}`}
        style={{ transition: 'margin 0.3s ease' }}
      >
        {/* Grid tiles */}
        {renderGridTiles()}
        
        {/* Farm decorative elements */}
        <div className="decorative-elements">
          {/* Add trees, rocks, etc. here */}
        </div>
        
        {!chickensQuery.data?.length ? (
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-md w-full z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-4 sm:p-6 text-center">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Welcome to your farm!</h2>
              <p className="text-muted-foreground text-sm sm:text-base mb-4">
                Start your farming journey by getting your first chicken from the shop.
              </p>
              <Button asChild className="bg-primary/90 hover:bg-primary">
                <Link href="/shop">Visit Shop</Link>
              </Button>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* Township-style title */}
            <motion.div
              className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-amber-800/80 px-4 py-1 rounded-full text-white text-sm font-bold backdrop-blur-sm z-10"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {timeOfDay === 'day' 
                ? '☀️ Good Morning! Time to collect eggs!' 
                : timeOfDay === 'sunset' 
                  ? '🌅 Good Afternoon! Your chickens are active!' 
                  : '🌙 Good Evening! Your chickens are resting.'}
            </motion.div>
            
            {/* Draggable chicken elements */}
            {chickensQuery.data.map((chicken, index) => {
              const position = chickenPositions[chicken.id] || { x: 100 + (index * 50), y: 100 + (index * 20) };
              
              return (
                <motion.div
                  key={chicken.id}
                  className="absolute cursor-move"
                  style={{ 
                    x: position.x, 
                    y: position.y, 
                    zIndex: draggedItem?.id === chicken.id ? 100 : 10
                  }}
                  drag
                  dragMomentum={false}
                  onDragStart={() => handleDragStart(chicken.id)}
                  onDragEnd={(_, info) => {
                    const newPos = {
                      x: position.x + info.offset.x,
                      y: position.y + info.offset.y
                    };
                    handleDragEnd(chicken.id, newPos);
                  }}
                >
                  <div className="relative">
                    <motion.img
                      src={`/assets/chicken-${chicken.type}.svg`}
                      alt={`${chicken.type} Chicken`}
                      className="w-20 h-20 object-contain"
                      animate={{
                        y: [0, -5, 0],
                        rotate: [0, index % 2 === 0 ? 3 : -3, 0]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2 + (index * 0.2), 
                        ease: "easeInOut",
                        delay: index * 0.1
                      }}
                    />
                    
                    {/* Hatch button for ready chickens */}
                    {canHatch(chicken) && (
                      <motion.button
                        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs py-1 px-2 rounded-full shadow-md"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => hatchMutation.mutate(chicken.id)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        Hatch Eggs
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}