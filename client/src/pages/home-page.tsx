import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Chicken, Resource } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { toast } = useToast();
  const { user } = useAuth();

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

  if (chickensQuery.isLoading || resourcesQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[url('/assets/background.png')] bg-cover bg-center bg-no-repeat">
        <div className="min-h-screen bg-background/80 backdrop-blur-sm pt-20">
          <div className="fixed top-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-b shadow-lg z-50">
            <div className="container mx-auto px-4 py-3">
              <div className="flex justify-between items-center">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-8 w-16" />
                ))}
              </div>
            </div>
          </div>
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const resources = resourcesQuery.data || { waterBuckets: 0, wheatBags: 0, eggs: 0 };

  return (
    <div className="min-h-screen bg-[url('/assets/background.png')] bg-cover bg-center bg-no-repeat">
      <div className="min-h-screen bg-background/80 backdrop-blur-sm pt-20 pb-24">
        {/* Fixed Game Header with Resources */}
        <div className="fixed top-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-b shadow-lg z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-1.5">
                <img src="/assets/water-bucket.png" alt="Water" className="w-6 h-6" />
                <span className="font-bold">{resources.waterBuckets}</span>
              </div>
              <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-1.5">
                <img src="/assets/wheat-bag.png" alt="Wheat" className="w-6 h-6" />
                <span className="font-bold">{resources.wheatBags}</span>
              </div>
              <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-1.5">
                <img src="/assets/egg.png" alt="Eggs" className="w-6 h-6" />
                <span className="font-bold">{resources.eggs}</span>
              </div>
              <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-1.5">
                <img src="/assets/usdt.png" alt="USDT" className="w-6 h-6" />
                <span className="font-bold">${user?.usdtBalance || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="container mx-auto px-4 py-6">
          {!chickensQuery.data?.length ? (
            <Card className="p-6 text-center bg-card/50 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-4">Welcome to your farm!</h2>
              <p className="text-muted-foreground mb-4">
                Start your farming journey by getting your first chicken from the shop.
              </p>
              <Button asChild className="bg-primary/90 hover:bg-primary">
                <a href="/shop">Visit Shop</a>
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {chickensQuery.data.map((chicken) => (
                <Card key={chicken.id} className="p-4 bg-card/50 backdrop-blur-sm">
                  <div className="relative aspect-square mb-4">
                    <img
                      src={`/assets/chicken-${chicken.type}.png`}
                      alt={`${chicken.type} Chicken`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-center capitalize">
                      {chicken.type} Chicken
                    </h3>
                    <Button
                      className="w-full bg-primary/90 hover:bg-primary"
                      onClick={() => hatchMutation.mutate(chicken.id)}
                      disabled={hatchMutation.isPending}
                    >
                      Collect Eggs
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}