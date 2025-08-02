import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function TestAuth() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    user?: any;
  } | null>(null);

  const testAuth = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/auth/test', {
        method: 'GET',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult({
          success: true,
          message: 'Authentication successful!',
          user: data.user
        });
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          setLocation('/dashboard');
        }, 2000);
      } else {
        setResult({
          success: false,
          message: data.error || 'Authentication failed'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            🔐 Test Authentication
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Click the button below to authenticate with the test account:
          </p>
          
          <Button 
            onClick={testAuth} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Authenticate with Test Account'
            )}
          </Button>
          
          {result && (
            <div className={`p-4 rounded-lg border ${
              result.success 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center">
                {result.success ? (
                  <CheckCircle className="mr-2 h-4 w-4" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                <span className="font-medium">
                  {result.success ? 'Success!' : 'Error'}
                </span>
              </div>
              <p className="mt-1 text-sm">
                {result.message}
              </p>
              {result.success && result.user && (
                <p className="mt-2 text-sm">
                  User: {result.user.username}
                </p>
              )}
              {result.success && (
                <p className="mt-2 text-sm font-medium">
                  Redirecting to dashboard...
                </p>
              )}
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t">
            <h3 className="font-medium mb-2">Next Steps:</h3>
            <ol className="text-sm text-muted-foreground space-y-1">
              <li>1. Click the "Authenticate" button above</li>
              <li>2. If successful, you'll be redirected to the dashboard</li>
              <li>3. You can then configure bot policies and get the invite link</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 