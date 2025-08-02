import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, History, Inbox } from "lucide-react";
import type { CommandLog } from "@shared/schema";

export function RecentActivity() {
  const { data: recentLogs, isLoading } = useQuery<CommandLog[]>({
    queryKey: ["/api/recent-activity"],
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="mr-2 text-indigo-600 h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-3 w-20 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <History className="mr-2 text-indigo-600 h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {recentLogs && recentLogs.length > 0 ? (
          <div className="space-y-4">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    log.success 
                      ? 'bg-emerald-100 dark:bg-emerald-900' 
                      : 'bg-red-100 dark:bg-red-900'
                  }`}>
                    {log.success ? (
                      <CheckCircle className="text-emerald-600 dark:text-emerald-400 h-5 w-5" />
                    ) : (
                      <XCircle className="text-red-600 dark:text-red-400 h-5 w-5" />
                    )}
                  </div>
                  
                  <div>
                    <p className="font-medium">
                      {log.commandName} command
                    </p>
                    <p className="text-sm text-muted-foreground">
                      by {log.username} in {log.channelName}
                    </p>
                    {!log.success && log.errorMessage && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {log.errorMessage}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-right text-sm text-muted-foreground">
                  <p>{log.executedAt ? formatDate(log.executedAt) : 'Unknown'}</p>
                  {log.responseTime && (
                    <p>{(log.responseTime / 1000).toFixed(1)}s</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No recent activity to display</p>
            <p className="text-sm mt-2">Command logs will appear here once your bots start receiving requests</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
