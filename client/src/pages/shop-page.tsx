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
    <div>
      <BalanceBar />
      
      <div className="space-y-6 mt-4">
        <h1 className="text-2xl font-bold">Chicken Shop</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CHICKEN_TYPES.map((chicken) => (
            <Card key={chicken.type}>
              <CardHeader className="pb-2">
                <CardTitle>{chicken.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{chicken.description}</p>
                <p className="text-sm">Requires: {chicken.requirements}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">
                    ${getPrice(chicken.type)}
                  </span>
                  <Button
                    onClick={() => buyChickenMutation.mutate(chicken.type)}
                    disabled={buyChickenMutation.isPending}
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