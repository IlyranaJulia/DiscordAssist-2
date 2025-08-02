import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Clock, Star, Download, CheckCircle, XCircle } from "lucide-react";
import type { BotConfig, CommandLog } from "@shared/schema";

interface LogsAnalyticsProps {
  botConfig: BotConfig;
}

export function LogsAnalytics({ botConfig }: LogsAnalyticsProps) {
  const { data: logs, isLoading: logsLoading } = useQuery<CommandLog[]>({
    queryKey: ["/api/bot-configs", botConfig.id, "logs"],
  });

  const { data: stats } = useQuery<{
    totalCommands: number;
    successfulCommands: number;
    avgRating: number;
    avgResponseTime: number;
  }>({
    queryKey: ["/api/bot-configs", botConfig.id, "stats"],
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const formatResponseTime = (time: number | null) => {
    if (!time) return "-";
    return `${(time / 1000).toFixed(1)}s`;
  };

  // Mock today's stats - in a real app, this would be calculated from actual data
  const todayStats = {
    commands: 47,
    avgResponseTime: 1.2,
    satisfaction: 4.8,
  };

  return (
    <div className="space-y-8">
      {/* Usage Statistics */}
      <div>
        <h3 className="text-xl font-semibold mb-6">Usage Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Commands Today</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{todayStats.commands}</p>
                </div>
                <BarChart3 className="text-blue-600 dark:text-blue-400 h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Avg Response Time</p>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{todayStats.avgResponseTime}s</p>
                </div>
                <Clock className="text-emerald-600 dark:text-emerald-400 h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">User Satisfaction</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{todayStats.satisfaction}/5</p>
                </div>
                <Star className="text-purple-600 dark:text-purple-400 h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Recent Command Logs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Command Logs</CardTitle>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        </CardHeader>
        
        <CardContent>
          {logsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Command</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Response Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs && logs.length > 0 ? (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {log.success ? (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Success
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="mr-1 h-3 w-3" />
                              Error
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{log.commandName}</TableCell>
                        <TableCell>{log.username}</TableCell>
                        <TableCell>{log.channelName}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {log.executedAt ? formatDate(log.executedAt) : 'Unknown'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatResponseTime(log.responseTime)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No command logs available yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
