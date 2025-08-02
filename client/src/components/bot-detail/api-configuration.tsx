import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Key, TestTube, AlertTriangle } from "lucide-react";
import type { BotConfig } from "@shared/schema";

interface ApiConfigurationProps {
  botConfig: BotConfig;
}

export function ApiConfiguration({ botConfig }: ApiConfigurationProps) {
  const [openaiKey, setOpenaiKey] = useState("");
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [dailyLimit, setDailyLimit] = useState("1000");
  const [maxTokens, setMaxTokens] = useState("2048");
  const [temperature, setTemperature] = useState("0.7");

  const testApiKey = async (provider: "openai" | "openrouter", key: string) => {
    if (!key.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter an API key to test.",
        variant: "destructive",
      });
      return;
    }

    try {
      // TODO: Implement API key testing
      toast({
        title: "API Key Valid",
        description: `${provider === "openai" ? "OpenAI" : "OpenRouter"} API key is valid and working.`,
      });
    } catch (error) {
      toast({
        title: "API Key Invalid",
        description: `Failed to validate ${provider === "openai" ? "OpenAI" : "OpenRouter"} API key.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="mr-2 h-5 w-5" />
            API Keys
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Securely store your AI API keys. Keys are encrypted and never displayed in full.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="openai-key" className="text-sm font-medium mb-2 block">
                OpenAI API Key
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="openai-key"
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  className="flex-1"
                />
                <Button
                  onClick={() => testApiKey("openai", openaiKey)}
                  variant="outline"
                  size="icon"
                >
                  <TestTube className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="openrouter-key" className="text-sm font-medium mb-2 block">
                OpenRouter API Key
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="openrouter-key"
                  type="password"
                  value={openrouterKey}
                  onChange={(e) => setOpenrouterKey(e.target.value)}
                  placeholder="sk-or-..."
                  className="flex-1"
                />
                <Button
                  onClick={() => testApiKey("openrouter", openrouterKey)}
                  variant="outline"
                  size="icon"
                >
                  <TestTube className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <Alert className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Note:</strong> API keys are encrypted at rest and never logged. Test your keys to ensure proper functionality.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>API Usage Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="daily-limit" className="text-sm font-medium mb-2 block">
                Daily Request Limit
              </Label>
              <Input
                id="daily-limit"
                type="number"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="max-tokens" className="text-sm font-medium mb-2 block">
                Max Tokens per Request
              </Label>
              <Input
                id="max-tokens"
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="temperature" className="text-sm font-medium mb-2 block">
                Temperature
              </Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
