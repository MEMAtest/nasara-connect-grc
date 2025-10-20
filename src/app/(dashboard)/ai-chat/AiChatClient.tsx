"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Bot, Lock } from "lucide-react";

export function AiChatClient() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
          <p className="text-muted-foreground">
            Get instant regulatory guidance and support
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Lock className="h-3 w-3" />
          Premium Feature
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Chat Sessions
            </CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No sessions yet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Queries Resolved
            </CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Ready to help
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Response Time
            </CardTitle>
            <Badge variant="secondary">Instant</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">&lt;1s</div>
            <p className="text-xs text-muted-foreground">
              Average response
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Compliance Assistant
          </CardTitle>
          <CardDescription>
            Ask questions about regulations, compliance requirements, or get guidance on FCA matters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-6 text-center">
            <Lock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
            <p className="text-muted-foreground mb-4">
              The AI Assistant is currently in development and will be available soon as part of our premium features.
            </p>
            <Button disabled>
              Upgrade to Premium
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Ask about FCA regulations, compliance requirements..."
              disabled
              className="flex-1"
            />
            <Button disabled>
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            Examples: &ldquo;What are the latest Consumer Duty requirements?&rdquo; or &ldquo;How do I implement SMCR controls?&rdquo;
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
