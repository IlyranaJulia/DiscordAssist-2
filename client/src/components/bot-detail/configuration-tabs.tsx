import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "./general-settings";
import { PolicyManagement } from "./policy-management";
import { ApiConfiguration } from "./api-configuration";
import { Permissions } from "./permissions";
import { LogsAnalytics } from "./logs-analytics";
import { Settings, FileText, Key, Shield, BarChart3 } from "lucide-react";
import type { BotConfig } from "@shared/schema";

interface ConfigurationTabsProps {
  botConfig: BotConfig;
}

export function ConfigurationTabs({ botConfig }: ConfigurationTabsProps) {
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="general" className="flex items-center">
          <Settings className="mr-2 h-4 w-4" />
          General
        </TabsTrigger>
        <TabsTrigger value="policy" className="flex items-center">
          <FileText className="mr-2 h-4 w-4" />
          Policy
        </TabsTrigger>
        <TabsTrigger value="api" className="flex items-center">
          <Key className="mr-2 h-4 w-4" />
          API Keys
        </TabsTrigger>
        <TabsTrigger value="permissions" className="flex items-center">
          <Shield className="mr-2 h-4 w-4" />
          Permissions
        </TabsTrigger>
        <TabsTrigger value="logs" className="flex items-center">
          <BarChart3 className="mr-2 h-4 w-4" />
          Logs
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="mt-6">
        <GeneralSettings botConfig={botConfig} />
      </TabsContent>

      <TabsContent value="policy" className="mt-6">
        <PolicyManagement botConfig={botConfig} />
      </TabsContent>

      <TabsContent value="api" className="mt-6">
        <ApiConfiguration botConfig={botConfig} />
      </TabsContent>

      <TabsContent value="permissions" className="mt-6">
        <Permissions botConfig={botConfig} />
      </TabsContent>

      <TabsContent value="logs" className="mt-6">
        <LogsAnalytics botConfig={botConfig} />
      </TabsContent>
    </Tabs>
  );
}
