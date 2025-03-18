import { QueryClient, QueryFunction } from "@tanstack/react-query";

const defaultHeaders = {
  "Accept": "application/json",
  "Content-Type": "application/json",
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || res.statusText;
    } catch {
      errorMessage = await res.text() || res.statusText;
    }
    throw new Error(`${res.status}: ${errorMessage}`);
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
        ...defaultHeaders,
        ...(method !== 'GET' && data ? { "Content-Type": "application/json" } : {}),
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
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options?.method !== 'GET' && options?.body ? { "Content-Type": "application/json" } : {}),
        ...(options?.headers || {}),
      },
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
      headers: defaultHeaders,
      credentials: "include", // Important: Include credentials for all requests
    });

    console.log(`[Query] ${queryKey[0]} - Status:`, res.status);
    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      console.log(`[Query] Returning null for unauthorized request to ${queryKey[0]}`);
      return null;
    }

    await throwIfResNotOk(res);
    try {
      return await res.json();
    } catch (error) {
      console.error(`[Query] Failed to parse JSON response from ${queryKey[0]}:`, error);
      throw new Error("Invalid JSON response from server");
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 0, // Always fetch fresh data
      retry: (failureCount, error) => {
        // Don't retry on 401 Unauthorized
        if (error instanceof Error && error.message.startsWith("401:")) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});