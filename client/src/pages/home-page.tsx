import { useQuery, useMutation } from "@tanstack/react-query";
import ChickenCard from "@/components/chicken-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Chicken, Resource } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function HomePage() {
  const { toast } = useToast();

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[200px] w-full" />
        ))}
      </div>
    );
  }

  if (!chickensQuery.data?.length) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome to your farm!</h2>
        <p className="text-muted-foreground">
          Visit the shop to buy your first chicken and start your farming journey.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {chickensQuery.data.map((chicken) => (
        <ChickenCard
          key={chicken.id}
          chicken={chicken}
          resources={resourcesQuery.data!}
          onHatch={() => hatchMutation.mutate(chicken.id)}
        />
      ))}
    </div>
  );
}