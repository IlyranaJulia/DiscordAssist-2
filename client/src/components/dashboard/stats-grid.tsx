import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, CheckCircle, Terminal, TrendingUp } from "lucide-react";

interface DashboardStats {
  totalBots: number;
  activeBots: number;
  totalCommands: number;
  successRate: number;
}

export function StatsGrid() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Bots",
      value: stats?.totalBots || 0,
      icon: Bot,
      color: "text-indigo-600",
    },
    {
      title: "Active Bots", 
      value: stats?.activeBots || 0,
      icon: CheckCircle,
      color: "text-emerald-600",
    },
    {
      title: "Total Commands",
      value: stats?.totalCommands || 0,
      icon: Terminal,
      color: "text-blue-600",
    },
    {
      title: "Success Rate",
      value: `${stats?.successRate || 0}%`,
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statCards.map((card) => (
        <Card key={card.title} className="stat-card">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{card.title}</p>
              <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            </div>
            <card.icon className={`${card.color} h-8 w-8 opacity-80`} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
