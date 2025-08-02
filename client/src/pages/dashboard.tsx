import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { BotConfigCard } from "@/components/dashboard/bot-config-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Settings, Server, ExternalLink, Copy } from "lucide-react";
import { useState } from "react";
import type { BotConfig } from "@shared/schema";

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const { data: botConfigs, isLoading: configsLoading } = useQuery<BotConfig[]>({
    queryKey: ["/api/bot-configs"],
  });

  const { data: inviteData } = useQuery({
    queryKey: ["/api/bot/invite"],
    enabled: isAuthenticated,
  });

  const copyInviteLink = async () => {
    if (inviteData?.inviteUrl) {
      await navigator.clipboard.writeText(inviteData.inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (configsLoading) {
    return (
      <div className="space-y-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div>
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Settings className="mr-3 text-indigo-600 h-8 w-8" />
          Dashboard
        </h1>
        <p className="text-muted-foreground">Configure your DiscordAssist bot policies and settings</p>
      </div>

      {/* Quick Stats */}
      <StatsGrid />

      {/* Bot Invite Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="mr-2 text-indigo-600 h-5 w-5" />
            Invite Bot to Your Server
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Use the DiscordAssist bot in your server by inviting it with the link below.
            </p>
            
            {inviteData?.inviteUrl && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <input
                  type="text"
                  value={inviteData.inviteUrl}
                  readOnly
                  className="flex-1 bg-transparent text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyInviteLink}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(inviteData.inviteUrl, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bot Configurations */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="mr-2 text-indigo-600 h-5 w-5" />
            Bot Configuration
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {botConfigs && botConfigs.length > 0 ? (
            <div className="space-y-4">
              {botConfigs.map((config) => (
                <BotConfigCard key={config.id} config={config} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Bot className="text-muted-foreground h-16 w-16 mx-auto mb-6" />
              <h3 className="text-xl font-medium mb-3">No bot configuration found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Contact the bot administrator to set up your configuration.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}
