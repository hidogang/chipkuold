import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Price } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import BalanceBar from "@/components/balance-bar";

const CHICKEN_TYPES = [
  {
    type: "baby",
    name: "Baby Chicken",
    description: "2 eggs per hatch, 6hr cooldown",
    requirements: "1 water bucket, 1 wheat bag"
  },
  {
    type: "regular",
    name: "Regular Chicken",
    description: "5 eggs per hatch, 5hr cooldown",
    requirements: "2 water buckets, 2 wheat bags"
  },
  {
    type: "golden",
    name: "Golden Chicken",
    description: "20 eggs per hatch, 3hr cooldown",
    requirements: "10 water buckets, 15 wheat bags"
  }
];

export default function ShopPage() {
  const { toast } = useToast();

  const pricesQuery = useQuery<Price[]>({
    queryKey: ["/api/prices"],
  });

  const buyChickenMutation = useMutation({
    mutationFn: async (type: string) => {
      const res = await apiRequest("POST", "/api/chickens/buy", { type });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chickens"] });
      toast({
        title: "Success",
        description: "Chicken purchased successfully!",
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

  const getPrice = (type: string) => {
    const price = pricesQuery.data?.find(p => p.itemType === `${type}_chicken`);
    return price ? parseFloat(price.price) : 0;
  };

  return (
    <div className="pb-20 md:pb-6">
      <BalanceBar />
      
      <div className="space-y-4 sm:space-y-6 mt-2 sm:mt-4 px-2 sm:px-4">
        <h1 className="text-xl sm:text-2xl font-bold">Chicken Shop</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {CHICKEN_TYPES.map((chicken) => (
            <Card key={chicken.type} className="overflow-hidden">
              <div className="flex items-center p-2 sm:p-3 bg-gradient-to-r from-primary/10 to-transparent">
                <div className="mr-2 w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
                  <img 
                    src={`/assets/chicken-${chicken.type}.svg`} 
                    alt={chicken.name}
                    className="w-full h-full object-contain" 
                  />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">{chicken.name}</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">{chicken.description}</p>
                </div>
              </div>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 pt-3">
                <div className="p-2 rounded-md bg-amber-50 dark:bg-amber-950/30">
                  <p className="text-xs sm:text-sm font-medium">Requires: {chicken.requirements}</p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-semibold text-green-600">
                    ${getPrice(chicken.type)}
                  </span>
                  <Button
                    onClick={() => buyChickenMutation.mutate(chicken.type)}
                    disabled={buyChickenMutation.isPending}
                    size="sm"
                    className="h-8 sm:h-9 text-xs sm:text-sm"
                  >
                    Buy Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}