"use client";

import React, { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Loader2 } from "lucide-react";
import { updateNotificationPreferences, type NotificationFormState } from './actions';
import { useToast } from "@/hooks/use-toast";

type Profile = {
  enable_low_stock_alerts: boolean | null;
  enable_high_mortality_alerts: boolean | null;
  enable_daily_summary: boolean | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Notification Preferences'}
    </Button>
  );
}

export function NotificationSettingsForm({ profile }: { profile: Profile }) {
  const { toast } = useToast();
  const initialState: NotificationFormState = { message: "", success: undefined };
  const [state, formAction] = useActionState(updateNotificationPreferences, initialState);
  
  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Success" : "Error",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
    }
  }, [state, toast]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center gap-2"><Bell className="h-5 w-5 text-accent" /> Notifications</CardTitle>
        <CardDescription>Configure your notification preferences.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2 p-2 rounded-md border">
            <Label htmlFor="lowStockAlerts" className="flex flex-col space-y-1">
              <span>Low Stock Alerts</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Receive notifications for low feed inventory.
              </span>
            </Label>
            <Switch id="lowStockAlerts" name="lowStockAlerts" defaultChecked={profile.enable_low_stock_alerts ?? true} />
          </div>
          <div className="flex items-center justify-between space-x-2 p-2 rounded-md border">
            <Label htmlFor="highMortalityAlerts" className="flex flex-col space-y-1">
              <span>High Mortality Alerts</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Get alerted for unusual spikes in mortality rates.
              </span>
            </Label>
            <Switch id="highMortalityAlerts" name="highMortalityAlerts" defaultChecked={profile.enable_high_mortality_alerts ?? false} />
          </div>
          <div className="flex items-center justify-between space-x-2 p-2 rounded-md border">
            <Label htmlFor="dailySummary" className="flex flex-col space-y-1">
              <span>Daily Summary Email</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Receive a daily summary of farm operations.
              </span>
            </Label>
            <Switch id="dailySummary" name="dailySummary" defaultChecked={profile.enable_daily_summary ?? true} />
          </div>
        </CardContent>
        <CardFooter>
            <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
