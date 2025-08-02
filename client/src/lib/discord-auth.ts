import { apiRequest } from "@/lib/queryClient";

export interface DiscordUser {
  id: string;
  discordId: string;
  username: string;
  avatarUrl: string | null;
  email: string | null;
}

export async function initiateDiscordAuth(): Promise<string> {
  const response = await apiRequest("GET", "/api/auth/discord");
  const data = await response.json();
  return data.authUrl;
}

export async function completeDiscordAuth(code: string): Promise<DiscordUser> {
  const response = await apiRequest("POST", "/api/auth/discord/callback", { code });
  const data = await response.json();
  return data.user;
}

export async function logout(): Promise<void> {
  await apiRequest("POST", "/api/auth/logout");
}
