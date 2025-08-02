import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useParams } from "wouter";
import { ConfigurationTabs } from "@/components/bot-detail/configuration-tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bot, CheckCircle, XCircle, Play, Pause, BarChart3, Star, Terminal } from "lucide-react";
import type { BotConfig } from "@shared/schema";

export default function BotDetail() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { id } = useParams();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const { data: botConfig, isLoading } = useQuery<BotConfig>({
    queryKey: ["/api/bot-configs", id],
  });

  const { data: stats } = useQuery<{
    totalCommands: number;
    successfulCommands: number;
    avgRating: number;
    avgResponseTime: number;
  }>({
    queryKey: ["/api/bot-configs", id, "stats"],
    enabled: !!botConfig,
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-96 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex space-x-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
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

  if (!botConfig) {
    return (
      <div className="text-center py-16">
        <Bot className="text-muted-foreground h-16 w-16 mx-auto mb-6" />
        <h3 className="text-xl font-medium mb-3">Bot configuration not found</h3>
        <p className="text-muted-foreground mb-8">
          The bot configuration you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button onClick={() => setLocation("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const successRate = stats && stats.totalCommands > 0 
    ? Math.round((stats.successfulCommands / stats.totalCommands) * 100) 
    : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Bot className="mr-3 text-indigo-600 h-8 w-8" />
              {botConfig.guildName}
            </h1>
            <p className="text-muted-foreground">Configure your Discord support bot settings and policies</p>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setLocation("/dashboard")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            
            {botConfig.isActive ? (
              <Button variant="destructive">
                <Pause className="mr-2 h-4 w-4" />
                Deactivate Bot
              </Button>
            ) : (
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Play className="mr-2 h-4 w-4" />
                Activate Bot
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="stat-card">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
              <div className="flex items-center">
                {botConfig.isActive ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-emerald-600 mr-2" />
                    <Badge variant="default" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                      Active
                    </Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-600 mr-2" />
                    <Badge variant="secondary">
                      Inactive
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Commands</p>
              <p className="text-2xl font-bold text-blue-600">{stats?.totalCommands || 0}</p>
            </div>
            <Terminal className="text-blue-600 h-6 w-6 opacity-80" />
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Success Rate</p>
              <p className="text-2xl font-bold text-emerald-600">{successRate}%</p>
            </div>
            <BarChart3 className="text-emerald-600 h-6 w-6 opacity-80" />
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Avg Rating</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats?.avgRating ? `${stats.avgRating.toFixed(1)}/5` : "N/A"}
              </p>
            </div>
            <Star className="text-purple-600 h-6 w-6 opacity-80" />
          </CardContent>
        </Card>
      </div>

      {/* Configuration Tabs */}
      <ConfigurationTabs botConfig={botConfig} />
    </div>
  );
}
