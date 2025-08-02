import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Bot, Brain, Clock, Hash, Eye, Edit, Settings } from "lucide-react";
import type { BotConfig } from "@shared/schema";

interface BotConfigCardProps {
  config: BotConfig;
}

export function BotConfigCard({ config }: BotConfigCardProps) {
  const [, setLocation] = useLocation();

  const formatDate = (date: Date | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="border border-border rounded-lg p-6 hover:border-indigo-300 hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <h3 className="text-lg font-semibold mr-3">{config.botName}</h3>
            {config.isActive ? (
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                <CheckCircle className="mr-1 h-3 w-3" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary">
                <PauseCircle className="mr-1 h-3 w-3" />
                Inactive
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-3 flex items-center">
            <Hash className="mr-1 h-3 w-3" />
            Available in all servers where invited
          </p>
          
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <span className="flex items-center">
              <Brain className="mr-2 h-4 w-4" />
              {config.aiModel}
            </span>
            <span className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Updated {formatDate(config.updatedAt)}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={() => setLocation(`/bot/${config.id}`)}
            variant="outline"
            size="sm"
          >
            <Eye className="mr-1 h-4 w-4" />
            View
          </Button>
          <Button
            onClick={() => setLocation(`/bot/${config.id}`)}
            size="sm"
          >
            <Settings className="mr-1 h-4 w-4" />
            Configure
          </Button>
        </div>
      </div>
    </div>
  );
}

// Import the missing icons
import { CheckCircle, PauseCircle } from "lucide-react";
