
"use client";

import React, { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Loader2 } from "lucide-react";
import { updateEggCollection, type FormState } from './actions';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type EggCollectionRecord = {
  id: string;
  date: string;
  shed: string;
  total_eggs: number;
  broken_eggs: number;
  collected_by: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="bg-accent text-accent-foreground hover:bg-accent/90">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving Changes...
        </>
      ) : (
        <>
          <Edit className="mr-2 h-4 w-4" /> Save Changes
        </>
      )}
    </Button>
  );
}

export function EditEggRecordButton({ record }: { record: EggCollectionRecord }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const initialState: FormState = { message: "", success: undefined };
  const [state, formAction] = useActionState(updateEggCollection, initialState);
  const sheds = ["Shed A", "Shed B", "Shed C", "Shed D", "Shed E"];

  useEffect(() => {
      if (state.message) {
          toast({
              title: state.success ? "Success" : "Error",
              description: state.message,
              variant: state.success ? "default" : "destructive",
          });
      }
      if (state.success) {
          setOpen(false);
      }
  }, [state, toast]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:text-accent">
                <Edit className="h-4 w-4" />
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
                <DialogTitle>Edit Egg Collection Record</DialogTitle>
                <DialogDescription>Update the details for this record. Click save when you're done.</DialogDescription>
            </DialogHeader>
            <form action={formAction}>
                <input type="hidden" name="id" value={record.id} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                     <div className="space-y-1.5">
                        <Label htmlFor="collectionDate-edit">Date</Label>
                        <Input id="collectionDate-edit" name="collectionDate" type="date" defaultValue={record.date} />
                        {state.errors?.date && <p className="text-sm font-medium text-destructive">{state.errors.date[0]}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="shed-edit">Shed</Label>
                        <Select name="shed" defaultValue={record.shed}>
                          <SelectTrigger id="shed-edit">
                            <SelectValue placeholder="Select a shed" />
                          </SelectTrigger>
                          <SelectContent>
                            {sheds.map((shed) => (
                              <SelectItem key={shed} value={shed}>{shed}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {state.errors?.shed && <p className="text-sm font-medium text-destructive">{state.errors.shed[0]}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="totalEggs-edit">Total Eggs Collected</Label>
                        <Input id="totalEggs-edit" name="totalEggs" type="number" placeholder="e.g., 400" defaultValue={record.total_eggs} />
                        {state.errors?.total_eggs && <p className="text-sm font-medium text-destructive">{state.errors.total_eggs[0]}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="brokenEggs-edit">Broken Eggs</Label>
                        <Input id="brokenEggs-edit" name="brokenEggs" type="number" placeholder="e.g., 5" defaultValue={record.broken_eggs}/>
                        {state.errors?.broken_eggs && <p className="text-sm font-medium text-destructive">{state.errors.broken_eggs[0]}</p>}
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                        <Label htmlFor="collectedBy-edit">Collected By</Label>
                        <Input id="collectedBy-edit" name="collectedBy" placeholder="e.g., John Doe" defaultValue={record.collected_by} />
                        {state.errors?.collected_by && <p className="text-sm font-medium text-destructive">{state.errors.collected_by[0]}</p>}
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <SubmitButton />
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
  );
}
