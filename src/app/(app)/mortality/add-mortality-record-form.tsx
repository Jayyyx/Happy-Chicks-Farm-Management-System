
"use client";

import React, { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BirdIcon } from "@/components/icons/BirdIcon";
import { PlusCircle, Loader2 } from "lucide-react";
import { addMortalityRecord, type FormState } from './actions';
import { useToast } from "@/hooks/use-toast";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Logging...
        </>
      ) : (
        <>
          <PlusCircle className="mr-2 h-4 w-4" /> Log Mortality
        </>
      )}
    </Button>
  );
}

export function AddMortalityRecordForm() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const initialState: FormState = { message: "", success: undefined };
  const [state, formAction] = useActionState(addMortalityRecord, initialState);

  useEffect(() => {
      if (state.message) {
          toast({
              title: state.success ? "Success" : "Error",
              description: state.message,
              variant: state.success ? "default" : "destructive",
          });
      }
      if (state.success) {
          formRef.current?.reset();
      }
  }, [state, toast]);

  const today = new Date().toISOString().split('T')[0];

  return (
    <Card>
      <form action={formAction} ref={formRef}>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <BirdIcon className="h-6 w-6 text-destructive" /> Record Bird Mortality
          </CardTitle>
          <CardDescription>Log instances of bird mortality and adjust shed populations.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="mortalityDate">Date</Label>
            <Input id="mortalityDate" name="mortalityDate" type="date" defaultValue={today} />
             {state.errors?.date && <p className="text-sm font-medium text-destructive">{state.errors.date[0]}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shed">Shed</Label>
            <Input id="shed" name="shed" placeholder="e.g., Shed B" />
             {state.errors?.shed && <p className="text-sm font-medium text-destructive">{state.errors.shed[0]}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="count">Number of Birds</Label>
            <Input id="count" name="count" type="number" placeholder="e.g., 2" />
             {state.errors?.count && <p className="text-sm font-medium text-destructive">{state.errors.count[0]}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="recordedBy">Recorded By</Label>
            <Input id="recordedBy" name="recordedBy" placeholder="Your Name" />
            {state.errors?.recorded_by && <p className="text-sm font-medium text-destructive">{state.errors.recorded_by[0]}</p>}
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="cause">Suspected Cause</Label>
            <Select name="cause">
                <SelectTrigger id="cause">
                    <SelectValue placeholder="Select a cause" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Natural">Natural</SelectItem>
                    <SelectItem value="Disease">Disease</SelectItem>
                    <SelectItem value="Injury">Injury</SelectItem>
                    <SelectItem value="Predator Attack">Predator Attack</SelectItem>
                    <SelectItem value="Culling">Culling</SelectItem>
                    <SelectItem value="Unknown">Unknown</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
            </Select>
             {state.errors?.cause && <p className="text-sm font-medium text-destructive">{state.errors.cause[0]}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
