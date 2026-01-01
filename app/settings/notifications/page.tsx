"use client";

import { NotificationSettings } from "@/components/notifications/notification-center";
import { useNotificationSettings } from "@/hooks/use-notifications";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Save, Loader2 } from "lucide-react";
import { useState } from "react";

export default function NotificationSettingsPage() {
  const { settings, loading, updateSettings } = useNotificationSettings();
  const [saving, setSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
    updateSettings(localSettings);
    setSaving(false);
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(localSettings);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Notification Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage how and when you receive notifications
            </p>
          </div>
        </div>

        {hasChanges && (
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        )}
      </div>

      {/* Settings Card */}
      <NotificationSettings settings={localSettings} onUpdate={setLocalSettings} />

      {/* Email Digest Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-1">Email Digest</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Receive a summary of notifications via email
        </p>

        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="digest"
              value="none"
              defaultChecked
              className="text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="font-medium">Never</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Don't send email digests
              </div>
            </div>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="digest"
              value="daily"
              className="text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="font-medium">Daily</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Receive a daily summary at 9:00 AM
              </div>
            </div>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="digest"
              value="weekly"
              className="text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="font-medium">Weekly</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Receive a weekly summary every Monday
              </div>
            </div>
          </label>
        </div>
      </Card>

      {/* Quiet Hours */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-1">Quiet Hours</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Pause notifications during specific hours
        </p>

        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="font-medium">Enable quiet hours</span>
          </label>

          <div className="grid grid-cols-2 gap-4 ml-6">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                From
              </label>
              <input
                type="time"
                defaultValue="22:00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                To
              </label>
              <input
                type="time"
                defaultValue="08:00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
