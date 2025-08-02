import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Save } from "lucide-react";
import type { BotConfig } from "@shared/schema";

const formSchema = z.object({
  botName: z.string().min(1, "Bot name is required"),
  aiModel: z.string().min(1, "AI model is required"),
  systemPrompt: z.string().optional(),
});

interface GeneralSettingsProps {
  botConfig: BotConfig;
}

export function GeneralSettings({ botConfig }: GeneralSettingsProps) {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      botName: botConfig.botName || "Support Bot",
      aiModel: botConfig.aiModel || "openai/gpt-4o",
      systemPrompt: botConfig.systemPrompt || "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("PATCH", `/api/bot-configs/${botConfig.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bot-configs", botConfig.id] });
      toast({
        title: "Settings Updated",
        description: "General settings have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update settings.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    updateMutation.mutate(data);
  };

  const aiModels = [
    { value: "openai/gpt-4o", label: "GPT-4o (OpenRouter)" },
    { value: "openai/gpt-4", label: "GPT-4 (OpenRouter)" },
    { value: "openai/gpt-3.5-turbo", label: "GPT-3.5 Turbo (OpenRouter)" },
    { value: "anthropic/claude-3-sonnet", label: "Claude 3 Sonnet (OpenRouter)" },
    { value: "gpt-4o", label: "GPT-4o (Direct OpenAI)" },
    { value: "gpt-4", label: "GPT-4 (Direct OpenAI)" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="botName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bot Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Support Bot" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="aiModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Model</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an AI model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {aiModels.map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt Template</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={8}
                      placeholder="Enter your custom system prompt..."
                      {...field}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground mt-2 p-3 bg-muted rounded-lg">
                    This prompt guides how the AI generates response suggestions. Include instructions about tone, format, and company-specific guidelines.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button type="submit" disabled={updateMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {updateMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
