import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { Chicken, Resource } from "@shared/schema";

interface ChickenCardProps {
  chicken: Chicken;
  resources: Resource;
  onHatch: () => void;
}

export default function ChickenCard({ chicken, resources, onHatch }: ChickenCardProps) {
  const [cooldownProgress, setCooldownProgress] = useState(0);
  const [canHatch, setCanHatch] = useState(false);

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

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="capitalize">{chicken.type} Chicken</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm">Cooldown Progress</div>
          <Progress value={cooldownProgress} />
        </div>
        <Button 
          onClick={onHatch}
          disabled={!canHatch || !hasResources()}
          className="w-full"
        >
          Hatch Eggs
        </Button>
      </CardContent>
    </Card>
  );
}
