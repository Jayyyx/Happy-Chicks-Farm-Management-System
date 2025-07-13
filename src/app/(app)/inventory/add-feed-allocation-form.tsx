
"use client";

import React, { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Loader2 } from "lucide-react";
import { addFeedAllocation, type FormState } from './actions';
import { useToast } from "@/hooks/use-toast";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
      {pending ? "Allocating..." : "Allocate Feed"}
    </Button>
  );
}

export function AddFeedAllocationForm() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const initialState: FormState = { message: "", success: undefined };
  const [state, formAction] = useActionState(addFeedAllocation, initialState);

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
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><Send className="h-6 w-6 text-primary" /> Allocate Feed to Sheds</CardTitle>
          <CardDescription>Record feed being moved from main stock to a specific shed for consumption.</CardDescription>
        </CardHeader>
        <form action={formAction} ref={formRef}>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="date">Allocation Date</Label>
                    <Input id="date" name="date" type="date" defaultValue={today} />
                    {state.errors?.date && <p className="text-sm font-medium text-destructive">{state.errors.date[0]}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="shed">Shed</Label>
                    <Input id="shed" name="shed" placeholder="e.g., Shed A" />
                    {state.errors?.shed && <p className="text-sm font-medium text-destructive">{state.errors.shed[0]}</p>}
                </div>
                 <div className="space-y-1.5">
                    <Label htmlFor="feedType">Feed Type</Label>
                    <Input id="feedType" name="feedType" placeholder="e.g., Layers Mash" />
                    {state.errors?.feedType && <p className="text-sm font-medium text-destructive">{state.errors.feedType[0]}</p>}
                </div>
                 <div className="space-y-1.5">
                    <Label htmlFor="quantityAllocated">Quantity Allocated</Label>
                    <Input id="quantityAllocated" name="quantityAllocated" type="number" placeholder="e.g., 5" />
                    {state.errors?.quantityAllocated && <p className="text-sm font-medium text-destructive">{state.errors.quantityAllocated[0]}</p>}
                </div>
                 <div className="space-y-1.5">
                    <Label htmlFor="unit">Unit</Label>
                    <Select name="unit" defaultValue="bags">
                        <SelectTrigger id="unit"><SelectValue placeholder="Select unit" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="bags">Bags</SelectItem>
                            <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        </SelectContent>
                    </Select>
                     {state.errors?.unit && <p className="text-sm font-medium text-destructive">{state.errors.unit[0]}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="allocatedBy">Allocated By</Label>
                    <Input id="allocatedBy" name="allocatedBy" placeholder="e.g., John Doe" />
                    {state.errors?.allocatedBy && <p className="text-sm font-medium text-destructive">{state.errors.allocatedBy[0]}</p>}
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <SubmitButton />
            </CardFooter>
        </form>
    </Card>
  );
}
