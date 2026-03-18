"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  Globe,
  Mail,
  Smartphone,
  CheckCircle,
  Settings,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

interface ChannelConfig {
  id: string;
  name: string;
  type: "web" | "email" | "sms";
  icon: typeof Globe;
  enabled: boolean;
  description: string;
  configFields: { key: string; label: string; value: string; type?: string }[];
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<ChannelConfig[]>([
    {
      id: "web",
      name: "Web Chat",
      type: "web",
      icon: Globe,
      enabled: true,
      description: "Embeddable chat widget for your website. Visitors can chat with AI agents in real-time.",
      configFields: [
        { key: "widget_url", label: "Widget Script URL", value: `${process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com"}/widget.js` },
        { key: "allowed_origins", label: "Allowed Origins", value: "*" },
      ],
    },
    {
      id: "email",
      name: "Email",
      type: "email",
      icon: Mail,
      enabled: false,
      description: "Process incoming support emails. AI generates draft responses for review or auto-reply.",
      configFields: [
        { key: "inbox_address", label: "Support Inbox", value: "support@acme.com" },
        { key: "smtp_host", label: "SMTP Host", value: "smtp.example.com" },
        { key: "smtp_port", label: "SMTP Port", value: "587" },
        { key: "smtp_user", label: "SMTP User", value: "" },
        { key: "smtp_pass", label: "SMTP Password", value: "", type: "password" },
        { key: "auto_reply", label: "Auto-Reply Enabled", value: "false" },
      ],
    },
    {
      id: "sms",
      name: "SMS",
      type: "sms",
      icon: Smartphone,
      enabled: false,
      description: "Handle customer inquiries via SMS using Twilio webhooks.",
      configFields: [
        { key: "twilio_sid", label: "Twilio Account SID", value: "" },
        { key: "twilio_token", label: "Twilio Auth Token", value: "", type: "password" },
        { key: "twilio_phone", label: "Twilio Phone Number", value: "" },
        { key: "webhook_url", label: "Webhook URL", value: `${process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com"}/api/webhook/sms` },
      ],
    },
  ]);

  const [editingChannel, setEditingChannel] = useState<string | null>(null);

  const toggleChannel = (id: string) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, enabled: !ch.enabled } : ch))
    );
    const channel = channels.find((ch) => ch.id === id);
    toast.success(`${channel?.name} ${channel?.enabled ? "disabled" : "enabled"}`);
  };

  const updateField = (channelId: string, key: string, value: string) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === channelId
          ? {
              ...ch,
              configFields: ch.configFields.map((f) =>
                f.key === key ? { ...f, value } : f
              ),
            }
          : ch
      )
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Channels</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure multi-channel support: web chat, email, and SMS.
        </p>
      </div>

      <div className="space-y-6">
        {channels.map((channel) => (
          <Card key={channel.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
                    <channel.icon className="h-6 w-6 text-brand-600" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {channel.name}
                      <Badge variant={channel.enabled ? "success" : "secondary"}>
                        {channel.enabled ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
                    <p className="mt-0.5 text-sm text-gray-500">{channel.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={channel.enabled ? "destructive" : "default"}
                    size="sm"
                    onClick={() => toggleChannel(channel.id)}
                  >
                    {channel.enabled ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setEditingChannel(editingChannel === channel.id ? null : channel.id)
                    }
                  >
                    <Settings className="mr-1.5 h-3.5 w-3.5" />
                    Configure
                  </Button>
                </div>
              </div>
            </CardHeader>

            {editingChannel === channel.id && (
              <CardContent className="border-t border-gray-100">
                <div className="space-y-4 pt-4">
                  {channel.configFields.map((field) => (
                    <div key={field.key} className="flex items-end gap-2">
                      <div className="flex-1">
                        <Input
                          id={`${channel.id}-${field.key}`}
                          label={field.label}
                          type={field.type || "text"}
                          value={field.value}
                          onChange={(e) => updateField(channel.id, field.key, e.target.value)}
                        />
                      </div>
                      {(field.key === "widget_url" || field.key === "webhook_url") && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(field.value)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <Button onClick={() => {
                      setEditingChannel(null);
                      toast.success("Channel configuration saved");
                    }}>
                      Save Configuration
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
