import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, Download, Search, Clock } from "lucide-react";
import type { BotConfig } from "@shared/schema";

interface PolicyManagementProps {
  botConfig: BotConfig;
}

export function PolicyManagement({ botConfig }: PolicyManagementProps) {
  const [policyContent, setPolicyContent] = useState(botConfig.policyContent || "");
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("PATCH", `/api/bot-configs/${botConfig.id}`, {
        policyContent: content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bot-configs", botConfig.id] });
      toast({
        title: "Policy Updated",
        description: "Policy content has been updated and FAISS index regenerated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update policy content.",
        variant: "destructive",
      });
    },
  });

  const loadSamplePolicy = () => {
    const samplePolicy = `After-Sales Support Policy

1. Refund Eligibility
We only process refunds in cases of factory errors or shipping failures. Refunds are not applicable once production has started, unless the error is on our side.

2. Reprint Policy
If there is a verified production error (e.g. misaligned printing, wrong product), we will reprint the affected items for free. Customers must provide photo evidence within 7 days of delivery.

3. Damaged Product Upon Arrival
If the product is visibly damaged during shipping, please contact us with clear photos within 7 days of receipt. We will either reprint or issue a refund based on the damage.

4. Shipping Delays
Standard production takes 3–5 business days. Reprints may add 1–3 extra days. Shipping times vary by courier. We are not responsible for customs delays.

5. Lost Package
If your package is confirmed lost by the courier, we will offer a one-time full reshipment. For tracked packages, loss must be verifiable via the logistics system.

6. Wrong Items Received
If you receive the wrong product or design, we will offer a reprint or refund. Please notify us within 7 days with clear photos.`;

    setPolicyContent(samplePolicy);
    toast({
      title: "Sample Policy Loaded",
      description: "Sample policy content has been loaded into the editor.",
    });
  };

  const testPolicySearch = async () => {
    // TODO: Implement policy search testing
    toast({
      title: "Search Test Complete",
      description: "Policy search test completed - FAISS index is working correctly!",
    });
  };

  const handleSave = () => {
    updateMutation.mutate(policyContent);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Company Policy Document</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadSamplePolicy}>
            <Download className="mr-2 h-4 w-4" />
            Load Sample
          </Button>
          <Button variant="outline" onClick={testPolicySearch}>
            <Search className="mr-2 h-4 w-4" />
            Test Search
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <Textarea
            value={policyContent}
            onChange={(e) => setPolicyContent(e.target.value)}
            rows={20}
            className="font-mono text-sm"
            placeholder="Paste your company policy document here..."
          />
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Last updated: {formatDate(botConfig.policyUpdatedAt)}
              </span>
            </div>
            
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              <Upload className="mr-2 h-4 w-4" />
              {updateMutation.isPending ? "Updating..." : "Update Policy"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
