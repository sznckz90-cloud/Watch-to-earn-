import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";

// Hook to fetch bot statistics
export function useBotStats() {
  return useQuery({
    queryKey: [api.stats.path],
    queryFn: async () => {
      const res = await fetch(api.stats.path);
      if (!res.ok) throw new Error("Failed to fetch bot stats");
      // Using .parse() for strict validation
      return api.stats.responses[200].parse(await res.json());
    },
    // Poll every 30 seconds to keep stats fresh
    refetchInterval: 30000,
  });
}

// Hook to manually trigger the scheduler
export function useTriggerScheduler() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.triggerScheduler.path, {
        method: api.triggerScheduler.method,
      });
      if (!res.ok) throw new Error("Failed to trigger scheduler");
      return api.triggerScheduler.responses[200].parse(await res.json());
    },
  });
}
