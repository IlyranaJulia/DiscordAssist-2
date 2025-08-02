import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, Bot, Settings, Server } from "lucide-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const testAuth = async () => {
    setIsLoading(true);
    setAuthStatus('loading');
    setError(null);
    
    try {
      // Get Discord OAuth URL
      const response = await fetch('/api/auth/discord', {
        method: 'GET',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.authUrl) {
        // Open Discord OAuth in a popup window
        const popup = window.open(data.authUrl, 'discord-auth', 'width=500,height=600');
        
        // Listen for the OAuth result
        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'DISCORD_AUTH_SUCCESS') {
            setAuthStatus('success');
            popup?.close();
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              setLocation('/dashboard');
            }, 2000);
            window.removeEventListener('message', handleMessage);
          } else if (event.data.type === 'DISCORD_AUTH_ERROR') {
            setAuthStatus('error');
            setError(event.data.error || 'Discord authentication failed');
            popup?.close();
            window.removeEventListener('message', handleMessage);
          }
        };
        
        window.addEventListener('message', handleMessage);
      } else {
        setAuthStatus('error');
        setError('Failed to get Discord authentication URL');
      }
    } catch (error) {
      setAuthStatus('error');
      setError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <Bot className="mr-3 h-10 w-10 text-indigo-600" />
            DiscordAssist
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-powered Discord bot for intelligent customer support and server management
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Features */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-indigo-600" />
                  Smart AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Advanced AI-powered responses with customizable policies and behavior patterns.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="mr-2 h-5 w-5 text-indigo-600" />
                  Easy Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Simple invite link to add the bot to your Discord server with just one click.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="mr-2 h-5 w-5 text-indigo-600" />
                Quick Start
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Click the button below to authenticate and access the dashboard:
              </p>
              
              <Button 
                onClick={testAuth} 
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting to Discord...
                  </>
                ) : (
                  'Login with Discord'
                )}
              </Button>
              
              {authStatus === 'success' && (
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">
                      Authentication successful!
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-green-700">
                    Redirecting to dashboard...
                  </p>
                </div>
              )}
              
              {authStatus === 'error' && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center">
                    <XCircle className="mr-2 h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-800">
                      Authentication failed
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-red-700">
                    {error}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500">
          <p>Powered by advanced AI technology for seamless Discord integration</p>
        </div>
      </div>
    </div>
  );
}
