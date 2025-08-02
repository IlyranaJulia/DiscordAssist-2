import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { BotConfigCard } from "@/components/dashboard/bot-config-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { AddBotModal } from "@/components/modals/add-bot-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Plus, Settings, Server } from "lucide-react";
import { useState } from "react";
import type { BotConfig } from "@shared/schema";

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const [showAddModal, setShowAddModal] = useState(false);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const { data: botConfigs, isLoading: configsLoading } = useQuery<BotConfig[]>({
    queryKey: ["/api/bot-configs"],
  });

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
        <p className="text-muted-foreground">Manage your Discord support bots and configurations</p>
      </div>

      {/* Quick Stats */}
      <StatsGrid />

      {/* Bot Configurations */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Server className="mr-2 text-indigo-600 h-5 w-5" />
            Your Bot Configurations
          </CardTitle>
          <Button onClick={() => setShowAddModal(true)} className="font-medium">
            <Plus className="mr-2 h-4 w-4" />
            Add New Bot
          </Button>
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
              <h3 className="text-xl font-medium mb-3">No bots configured yet</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Create your first Discord support bot configuration to get started with AI-powered customer support.
              </p>
              <Button onClick={() => setShowAddModal(true)} className="font-medium">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Bot
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <RecentActivity />

      {/* Add Bot Modal */}
      <AddBotModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  );
}
