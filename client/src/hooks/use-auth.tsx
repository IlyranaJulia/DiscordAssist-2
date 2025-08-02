import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";
import { initiateDiscordAuth, completeDiscordAuth, logout as logoutApi, type DiscordUser } from "@/lib/discord-auth";

export function useAuth() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery<DiscordUser | null>({
    queryKey: ["/api/user/me"],
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async () => {
      const authUrl = await initiateDiscordAuth();
      
      // Detect Safari browser (including iOS Safari)
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) || 
                      /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      if (isSafari) {
        // For Safari, redirect directly in the same window
        sessionStorage.setItem('discord_auth_return_url', window.location.pathname);
        window.location.href = authUrl;
        return Promise.reject(new Error('Redirecting...'));
      }
      
      // Open Discord OAuth in a popup for other browsers
      const popup = window.open(
        authUrl,
        "discord-auth",
        "width=600,height=700,scrollbars=yes,resizable=yes"
      );

      return new Promise<DiscordUser>((resolve, reject) => {
        if (!popup) {
          reject(new Error("Popup blocked"));
          return;
        }

        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            clearInterval(checkUrl);
            window.removeEventListener("message", messageListener);
            reject(new Error("Authentication cancelled"));
          }
        }, 1000);

        // Listen for auth completion message
        const messageListener = (event: MessageEvent) => {
          // Allow messages from any origin for the popup
          if (event.data.type === "DISCORD_AUTH_SUCCESS") {
            clearInterval(checkClosed);
            clearInterval(checkUrl);
            window.removeEventListener("message", messageListener);
            popup?.close();
            resolve(event.data.user);
          } else if (event.data.type === "DISCORD_AUTH_ERROR") {
            clearInterval(checkClosed);
            clearInterval(checkUrl);
            window.removeEventListener("message", messageListener);
            popup?.close();
            reject(new Error(event.data.error || "Authentication failed"));
          }
        };
        
        // Also check for URL change in popup (fallback for Safari)
        const checkUrl = setInterval(() => {
          try {
            if (popup?.location?.href && popup.location.href.includes('/api/auth/discord/callback')) {
              clearInterval(checkUrl);
              // The callback should handle the response via postMessage
            }
          } catch (e) {
            // Cross-origin security error is expected
          }
        }, 500);

        window.addEventListener("message", messageListener);
      });
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user/me"], user);
      toast({
        title: "Welcome!",
        description: `Successfully logged in as ${user.username}`,
      });
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Authentication Failed",
        description: error.message || "Failed to log in with Discord",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.setQueryData(["/api/user/me"], null);
      queryClient.clear();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Logout Failed",
        description: "Failed to log out properly",
        variant: "destructive",
      });
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
