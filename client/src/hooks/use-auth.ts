import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/user"],
    retry: false, // Don't retry on 401s
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });

  // Consider unauthorized (401) as a valid "not logged in" state
  const isUnauthorized = error?.message?.includes('401');
  
  return {
    user: isUnauthorized ? null : user,
    isLoading: isLoading && !isUnauthorized,
    isAuthenticated: !!user
  };
}
