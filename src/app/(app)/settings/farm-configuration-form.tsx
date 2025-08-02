
"use client";

import React, { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Loader2 } from "lucide-react";
import { updateFarmConfiguration, type FarmConfigFormState } from './actions';
import { useToast } from "@/hooks/use-toast";

type FarmConfig = {
  farm_name: string | null;
  shed_count: number | null;
  default_currency: string | null;
  timezone: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
       {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Farm Configuration'}
    </Button>
  );
}

export function FarmConfigurationForm({ config }: { config: FarmConfig }) {
    const { toast } = useToast();
    const initialState: FarmConfigFormState = { message: "", success: undefined };
    const [state, formAction] = useActionState(updateFarmConfiguration, initialState);

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
        <CardTitle className="font-headline text-lg flex items-center gap-2"><Users className="h-5 w-5 text-accent" /> Farm Configuration</CardTitle>
        <CardDescription>Set up farm-specific parameters. (Only managers can edit)</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="farmName">Farm Name</Label>
            <Input id="farmName" name="farmName" defaultValue={config.farm_name ?? ''} />
            {state.errors?.farmName && <p className="text-sm font-medium text-destructive">{state.errors.farmName[0]}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shedCount">Number of Sheds</Label>
            <Input id="shedCount" name="shedCount" type="number" defaultValue={config.shed_count ?? 0} />
            {state.errors?.shedCount && <p className="text-sm font-medium text-destructive">{state.errors.shedCount[0]}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="defaultCurrency">Default Currency</Label>
            <Input id="defaultCurrency" name="defaultCurrency" placeholder="e.g., GHS" defaultValue={config.default_currency ?? ''} />
            {state.errors?.defaultCurrency && <p className="text-sm font-medium text-destructive">{state.errors.defaultCurrency[0]}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="timezone">Timezone</Label>
            <Input id="timezone" name="timezone" defaultValue={config.timezone ?? ''} />
            {state.errors?.timezone && <p className="text-sm font-medium text-destructive">{state.errors.timezone[0]}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
