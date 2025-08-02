import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Bot, Brain, ServerCog, Shield, CheckCircle, Terminal, Info } from "lucide-react";

export default function LandingPage() {
  const { isAuthenticated, login, isLoggingIn } = useAuth();
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Responses",
      description: "Generate contextual reply suggestions using OpenAI or OpenRouter APIs with custom prompts and company policies."
    },
    {
      icon: ServerCog,
      title: "Multi-Tenant Management", 
      description: "Manage multiple Discord servers with unique configurations, policies, and API keys per guild."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Discord OAuth authentication with encrypted API key storage and guild-specific permissions."
    }
  ];

  const keyFeatures = [
    "Custom policy document upload and editing",
    "FAISS vector search for policy retrieval", 
    "OpenAI and OpenRouter API support",
    "Customizable AI prompt templates",
    "Channel and role permissions",
    "Usage analytics and error logging",
    "User feedback and review system"
  ];

  const commands = [
    { command: "/reply", description: "Generate AI response suggestion" },
    { command: "/setpolicy", description: "Quick policy update" },
    { command: "/config", description: "Bot configuration commands" },
    { command: "/status", description: "Check bot health and stats" },
    { command: "/review", description: "Rate AI response quality" }
  ];

  const steps = [
    { number: 1, title: "Connect Discord", description: "Authenticate with Discord OAuth and select your servers" },
    { number: 2, title: "Configure Bot", description: "Set up API keys, upload policies, customize prompts" },
    { number: 3, title: "Deploy & Use", description: "Invite bot to server and start using /reply commands" },
    { number: 4, title: "Monitor & Improve", description: "Track usage, review feedback, optimize responses" }
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="gradient-hero text-white rounded-2xl p-12 mb-12 shadow-xl">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">
              <Bot className="inline mr-4 h-12 w-12" />
              Discord Support Bot Dashboard
            </h1>
            <p className="text-xl mb-8 opacity-95 leading-relaxed">
              Manage AI-powered customer support bots for your Discord servers with advanced policy integration and analytics
            </p>
            
            {!isAuthenticated ? (
              <Button
                onClick={() => login()}
                disabled={isLoggingIn}
                size="lg"
                className="bg-white text-indigo-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold shadow-lg"
              >
                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0190 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                </svg>
                {isLoggingIn ? "Connecting..." : "Get Started with Discord"}
              </Button>
            ) : (
              <Button
                onClick={() => setLocation("/dashboard")}
                size="lg"
                className="bg-white text-indigo-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold shadow-lg"
              >
                <ServerCog className="mr-3 h-5 w-5" />
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => (
          <Card key={index} className="feature-card">
            <CardContent className="p-8 text-center">
              <feature.icon className="h-10 w-10 text-indigo-600 mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How It Works */}
      <Card className="p-10 mb-16">
        <CardContent>
          <h2 className="text-3xl font-bold mb-10 text-center">How It Works</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="bg-indigo-100 dark:bg-indigo-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold text-2xl">{step.number}</span>
                </div>
                <h4 className="font-semibold mb-3 text-lg">{step.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features & Commands */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-8">
          <CardContent>
            <h3 className="text-2xl font-semibold mb-6 flex items-center">
              <CheckCircle className="text-indigo-600 mr-3 h-6 w-6" />
              Key Features
            </h3>
            <ul className="space-y-3">
              {keyFeatures.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="text-emerald-500 mr-3 h-4 w-4 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="p-8">
          <CardContent>
            <h3 className="text-2xl font-semibold mb-6 flex items-center">
              <Terminal className="text-indigo-600 mr-3 h-6 w-6" />
              Admin Commands
            </h3>
            <div className="space-y-3">
              {commands.map((cmd, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <code className="bg-muted px-3 py-1 rounded-md font-mono text-sm flex-shrink-0">
                    {cmd.command}
                  </code>
                  <span className="text-muted-foreground text-sm">{cmd.description}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground flex items-center">
                <Info className="mr-2 h-4 w-4" />
                All commands support ephemeral responses (admin-only visibility)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
