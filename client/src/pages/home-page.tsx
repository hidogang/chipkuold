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
      <div>
        <BalanceBar />
        <div className="grid grid-cols-2 gap-4 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const resources = resourcesQuery.data || { waterBuckets: 0, wheatBags: 0, eggs: 0 };

  return (
    <div>
      <BalanceBar />
      
      {/* Main Game Area */}
      <div className="mt-4">
        {!chickensQuery.data?.length ? (
          <Card className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome to your farm!</h2>
            <p className="text-muted-foreground mb-4">
              Start your farming journey by getting your first chicken from the shop.
            </p>
            <Button asChild className="bg-primary/90 hover:bg-primary">
              <Link href="/shop">Visit Shop</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {chickensQuery.data.map((chicken) => (
              <Card key={chicken.id} className="p-4">
                <div className="relative aspect-square mb-4">
                  <img
                    src={`/assets/chicken-${chicken.type}.svg`}
                    alt={`${chicken.type} Chicken`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-center capitalize">
                    {chicken.type} Chicken
                  </h3>
                  <Button
                    className="w-full"
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
  );
}