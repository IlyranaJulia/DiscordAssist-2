import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Hash, Users, Shield } from "lucide-react";
import type { BotConfig } from "@shared/schema";

interface PermissionsProps {
  botConfig: BotConfig;
}

export function Permissions({ botConfig }: PermissionsProps) {
  const [selectedChannels, setSelectedChannels] = useState<string[]>(
    botConfig.allowedChannels || []
  );
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    botConfig.allowedRoles || []
  );
  const [adminOnly, setAdminOnly] = useState(botConfig.adminOnly || false);

  // Mock data - in a real app, these would be fetched from Discord API
  const availableChannels = [
    { id: "general", name: "#general" },
    { id: "support", name: "#support" },
    { id: "help-desk", name: "#help-desk" },
  ];

  const availableRoles = [
    { id: "admin", name: "@Admin" },
    { id: "moderator", name: "@Moderator" },
    { id: "support-staff", name: "@Support Staff" },
  ];

  const handleChannelChange = (channelId: string, checked: boolean) => {
    if (checked) {
      setSelectedChannels([...selectedChannels, channelId]);
    } else {
      setSelectedChannels(selectedChannels.filter(id => id !== channelId));
    }
  };

  const handleRoleChange = (roleId: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles([...selectedRoles, roleId]);
    } else {
      setSelectedRoles(selectedRoles.filter(id => id !== roleId));
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Hash className="mr-2 h-5 w-5" />
            Channel Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Control which channels the bot can respond to commands in.
          </p>
          
          <div className="space-y-4">
            {availableChannels.map((channel) => (
              <div key={channel.id} className="flex items-center space-x-2">
                <Checkbox
                  id={channel.id}
                  checked={selectedChannels.includes(channel.id)}
                  onCheckedChange={(checked) => 
                    handleChannelChange(channel.id, checked as boolean)
                  }
                />
                <Label htmlFor={channel.id} className="text-sm font-normal">
                  {channel.name}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Role Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Specify which roles can use bot commands.
          </p>
          
          <div className="space-y-4">
            {availableRoles.map((role) => (
              <div key={role.id} className="flex items-center space-x-2">
                <Checkbox
                  id={role.id}
                  checked={selectedRoles.includes(role.id)}
                  onCheckedChange={(checked) => 
                    handleRoleChange(role.id, checked as boolean)
                  }
                />
                <Label htmlFor={role.id} className="text-sm font-normal">
                  {role.name}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <h4 className="font-medium">Admin Only Mode</h4>
                <p className="text-sm text-muted-foreground">
                  Restrict all commands to server administrators only
                </p>
              </div>
            </div>
            <Switch
              checked={adminOnly}
              onCheckedChange={setAdminOnly}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
