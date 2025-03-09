import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Resource } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Droplet, Wheat, Egg, Wallet } from "lucide-react";

export default function BalanceBar() {
  const { user } = useAuth();

  const resourcesQuery = useQuery<Resource>({
    queryKey: ["/api/resources"],
  });

  if (!user || resourcesQuery.isLoading) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2 sticky md:top-14 top-0 z-10 bg-background pt-2 pb-2">
      <Card className="p-3 shadow-sm border border-border/40">
        <div className="flex items-center space-x-2">
          <Droplet className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-muted-foreground">Water</span>
        </div>
        <p className="text-xl font-bold">{resourcesQuery.data?.waterBuckets || 0}</p>
      </Card>

      <Card className="p-3 shadow-sm border border-border/40">
        <div className="flex items-center space-x-2">
          <Wheat className="h-4 w-4 text-yellow-500" />
          <span className="text-sm text-muted-foreground">Wheat</span>
        </div>
        <p className="text-xl font-bold">{resourcesQuery.data?.wheatBags || 0}</p>
      </Card>

      <Card className="p-3 shadow-sm border border-border/40">
        <div className="flex items-center space-x-2">
          <Egg className="h-4 w-4 text-orange-500" />
          <span className="text-sm text-muted-foreground">Eggs</span>
        </div>
        <p className="text-xl font-bold">{resourcesQuery.data?.eggs || 0}</p>
      </Card>

      <Card className="p-3 shadow-sm border border-border/40">
        <div className="flex items-center space-x-2">
          <Wallet className="h-4 w-4 text-green-500" />
          <span className="text-sm text-muted-foreground">USDT</span>
        </div>
        <p className="text-xl font-bold">${user.usdtBalance}</p>
      </Card>
    </div>
  );
}