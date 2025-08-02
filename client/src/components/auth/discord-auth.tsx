import { useEffect } from "react";

export function DiscordAuthHandler() {
  useEffect(() => {
    // Check if this page was opened as a popup for Discord OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");

    if (code) {
      // Send success message to parent window
      if (window.opener) {
        window.opener.postMessage(
          { type: "DISCORD_AUTH_SUCCESS", code },
          window.location.origin
        );
        window.close();
      }
    } else if (error) {
      // Send error message to parent window
      if (window.opener) {
        window.opener.postMessage(
          { type: "DISCORD_AUTH_ERROR", error },
          window.location.origin
        );
        window.close();
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Processing Discord authentication...</p>
      </div>
    </div>
  );
}
