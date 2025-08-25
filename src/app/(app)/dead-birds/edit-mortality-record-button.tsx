
"use client";

import React, { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Loader2, User } from "lucide-react";
import { updateMortalityRecord, type FormState } from './actions';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";

type MortalityRecord = {
  id: string;
  date: string;
  shed: string;
  count: number;
  cause: string | null;
  recorded_by: string;
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

export function EditMortalityRecordButton({ record, userName }: { record: MortalityRecord, userName: string }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const initialState: FormState = { message: "", success: undefined };
  const [state, formAction] = useActionState(updateMortalityRecord, initialState);
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
                <DialogTitle>Edit Dead Birds Record</DialogTitle>
                <DialogDescription>Update the details for this record. Click save when you're done.</DialogDescription>
            </DialogHeader>
            <form action={formAction}>
                <input type="hidden" name="id" value={record.id} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                     <div className="space-y-1.5">
                        <Label htmlFor="mortalityDate-edit">Date</Label>
                        <Input id="mortalityDate-edit" name="mortalityDate" type="date" defaultValue={record.date} />
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
                        <Label htmlFor="count-edit">Number of Birds</Label>
                        <Input id="count-edit" name="count" type="number" placeholder="e.g., 2" defaultValue={record.count} />
                        {state.errors?.count && <p className="text-sm font-medium text-destructive">{state.errors.count[0]}</p>}
                    </div>
                     <div className="space-y-1.5">
                        <Label>Recorded By</Label>
                         <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted/50 px-3 py-2 text-sm">
                           <User className="mr-2 h-4 w-4 text-muted-foreground" />
                           <span>{userName} (Current User)</span>
                         </div>
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                        <Label htmlFor="cause-edit">Suspected Cause</Label>
                        <Select name="cause" defaultValue={record.cause ?? 'Unknown'}>
                            <SelectTrigger id="cause-edit">
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
