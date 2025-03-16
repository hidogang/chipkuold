import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  methodOrUrl: string,
  urlOrData?: string | RequestInit,
  data?: unknown | undefined,
): Promise<Response> {
  // Check if first parameter is a method or a URL
  if (methodOrUrl === 'GET' || methodOrUrl === 'POST' || methodOrUrl === 'PUT' || methodOrUrl === 'DELETE' || methodOrUrl === 'PATCH') {
    // First param is method, second is URL, third is data
    const method = methodOrUrl;
    const url = urlOrData as string;
    
    console.log(`[API Request] ${method} ${url}`);
    const res = await fetch(url, {
      method,
      headers: {
        ...(data ? { "Content-Type": "application/json" } : {}),
        "Accept": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include", // Important: Include credentials for all requests
    });

    console.log(`[API Response] ${method} ${url} - Status:`, res.status);
    await throwIfResNotOk(res);
    return res;
  } else {
    // First param is URL, second is options
    const url = methodOrUrl;
    const options = urlOrData as RequestInit;
    
    console.log(`[API Request] ${options?.method || 'GET'} ${url}`);
    const res = await fetch(url, {
      method: options?.method || 'GET',
      headers: {
        ...(options?.body ? { "Content-Type": "application/json" } : {}),
        "Accept": "application/json",
        ...(options?.headers || {}),
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
      credentials: "include", // Important: Include credentials for all requests
    });

    console.log(`[API Response] ${options?.method || 'GET'} ${url} - Status:`, res.status);
    await throwIfResNotOk(res);
    return res;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    console.log(`[Query] Fetching ${queryKey[0]}`);
    const res = await fetch(queryKey[0] as string, {
      credentials: "include", // Important: Include credentials for all requests
      headers: {
        "Accept": "application/json",
      }
    });

    console.log(`[Query] ${queryKey[0]} - Status:`, res.status);
    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      console.log(`[Query] Returning null for unauthorized request to ${queryKey[0]}`);
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 0, // Always fetch fresh data
      retry: 2,
    },
    mutations: {
      retry: false,
    },
  },
});