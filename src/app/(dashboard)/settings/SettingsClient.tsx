"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, User, Bell, Shield, Save, Loader2, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

interface UserSettings {
  first_name: string;
  last_name: string;
  user_email: string;
  role: string;
  phone: string;
  organization: string;
  email_notifications: boolean;
  push_notifications: boolean;
  weekly_reports: boolean;
  in_app_notifications: boolean;
  two_factor_enabled: boolean;
  session_timeout: boolean;
  dark_mode: boolean;
  compact_view: boolean;
  language: string;
}

const defaultSettings: UserSettings = {
  first_name: "",
  last_name: "",
  user_email: "",
  role: "",
  phone: "",
  organization: "",
  email_notifications: true,
  push_notifications: true,
  weekly_reports: true,
  in_app_notifications: true,
  two_factor_enabled: false,
  session_timeout: true,
  dark_mode: false,
  compact_view: false,
  language: "en",
};

export function SettingsClient() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const data = await response.json();
          setSettings({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            user_email: data.user_email || "",
            role: data.role || "",
            phone: data.phone || "",
            organization: data.organization || "",
            email_notifications: data.email_notifications ?? true,
            push_notifications: data.push_notifications ?? true,
            weekly_reports: data.weekly_reports ?? true,
            in_app_notifications: data.in_app_notifications ?? true,
            two_factor_enabled: data.two_factor_enabled ?? false,
            session_timeout: data.session_timeout ?? true,
            dark_mode: data.dark_mode ?? false,
            compact_view: data.compact_view ?? false,
            language: data.language || "en",
          });
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Update a setting
  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
    setSaveStatus("idle");
  };

  // Save settings
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: settings.first_name,
          lastName: settings.last_name,
          role: settings.role,
          phone: settings.phone,
          organization: settings.organization,
          emailNotifications: settings.email_notifications,
          pushNotifications: settings.push_notifications,
          weeklyReports: settings.weekly_reports,
          inAppNotifications: settings.in_app_notifications,
          twoFactorEnabled: settings.two_factor_enabled,
          sessionTimeout: settings.session_timeout,
          darkMode: settings.dark_mode,
          compactView: settings.compact_view,
          language: settings.language,
        }),
      });

      if (response.ok) {
        setSaveStatus("success");
        setHasChanges(false);
        // Clear success message after 3 seconds
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and platform settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === "success" && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Saved successfully
            </span>
          )}
          {saveStatus === "error" && (
            <span className="flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              Failed to save
            </span>
          )}
          <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Organization profile
              </CardTitle>
              <CardDescription>Manage organization details and plan</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/settings/organization">
                  Manage organization
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Members & access
              </CardTitle>
              <CardDescription>Invite users and manage roles</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/settings/members">
                  Manage members
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>
              Update your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={settings.first_name}
                  onChange={(e) => updateSetting("first_name", e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={settings.last_name}
                  onChange={(e) => updateSetting("last_name", e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.user_email}
                disabled
                className="bg-slate-50"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={settings.role}
                  onChange={(e) => updateSetting("role", e.target.value)}
                  placeholder="e.g., Compliance Officer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => updateSetting("phone", e.target.value)}
                  placeholder="+44 20 1234 5678"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                value={settings.organization}
                onChange={(e) => updateSetting("organization", e.target.value)}
                placeholder="Enter your organization name"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Configure how you receive updates and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>In-app Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show alerts in the notification bell
                </p>
              </div>
              <Switch
                checked={settings.in_app_notifications}
                onCheckedChange={(checked) => updateSetting("in_app_notifications", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive regulatory updates and compliance alerts via email
                </p>
              </div>
              <Switch
                checked={settings.email_notifications}
                onCheckedChange={(checked) => updateSetting("email_notifications", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get instant alerts for high-priority compliance matters
                </p>
              </div>
              <Switch
                checked={settings.push_notifications}
                onCheckedChange={(checked) => updateSetting("push_notifications", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Receive weekly compliance summary reports
                </p>
              </div>
              <Switch
                checked={settings.weekly_reports}
                onCheckedChange={(checked) => updateSetting("weekly_reports", checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Manage your account security and access controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch
                checked={settings.two_factor_enabled}
                onCheckedChange={(checked) => updateSetting("two_factor_enabled", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Session Timeout</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically log out after 30 minutes of inactivity
                </p>
              </div>
              <Switch
                checked={settings.session_timeout}
                onCheckedChange={(checked) => updateSetting("session_timeout", checked)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Change Password</Label>
              <div className="flex gap-2">
                <Input id="password" type="password" placeholder="Enter new password" className="flex-1" />
                <Button variant="outline">Update</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Platform Settings
            </CardTitle>
            <CardDescription>
              Customize your Nasara Connect experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark themes
                </p>
              </div>
              <Switch
                checked={settings.dark_mode}
                onCheckedChange={(checked) => updateSetting("dark_mode", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compact View</Label>
                <p className="text-sm text-muted-foreground">
                  Display more information in less space
                </p>
              </div>
              <Switch
                checked={settings.compact_view}
                onCheckedChange={(checked) => updateSetting("compact_view", checked)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                value={settings.language}
                onChange={(e) => updateSetting("language", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
