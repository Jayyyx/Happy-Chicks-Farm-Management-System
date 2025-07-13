
"use client";

import React, { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PackagePlus, Loader2 } from "lucide-react";
import { addFeedStock, type FormState } from './actions';
import { useToast } from "@/hooks/use-toast";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="bg-accent text-accent-foreground hover:bg-accent/90">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PackagePlus className="mr-2 h-4 w-4" />}
      {pending ? "Adding..." : "Add to Stock"}
    </Button>
  );
}

export function AddFeedStockForm() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const initialState: FormState = { message: "", success: undefined };
  const [state, formAction] = useActionState(addFeedStock, initialState);

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
        <CardTitle className="font-headline flex items-center gap-2"><PackagePlus className="h-6 w-6 text-primary" /> Add New Feed Stock</CardTitle>
        <CardDescription>Record new arrivals of feed to the inventory.</CardDescription>
      </CardHeader>
      <form action={formAction} ref={formRef}>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input id="date" name="date" type="date" defaultValue={today} />
            {state.errors?.date && <p className="text-sm font-medium text-destructive">{state.errors.date[0]}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="feedType">Feed Type</Label>
            <Input id="feedType" name="feedType" placeholder="e.g., Layers Mash" />
             {state.errors?.feedType && <p className="text-sm font-medium text-destructive">{state.errors.feedType[0]}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" name="quantity" type="number" placeholder="e.g., 50" />
            {state.errors?.quantity && <p className="text-sm font-medium text-destructive">{state.errors.quantity[0]}</p>}
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
            <Label htmlFor="supplier">Supplier (Optional)</Label>
            <Input id="supplier" name="supplier" placeholder="e.g., Agro Feeds Ltd" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cost">Cost per Unit (Optional)</Label>
            <Input id="cost" name="cost" type="number" step="0.01" placeholder="e.g., 50.00" />
          </div>
          <div className="md:col-span-2 lg:col-span-3 flex justify-end pt-2">
            <SubmitButton />
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
