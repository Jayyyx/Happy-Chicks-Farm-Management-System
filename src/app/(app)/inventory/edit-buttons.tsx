
"use client";

import React, { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Loader2 } from "lucide-react";
import { updateFeedStock, updateFeedAllocation, type FormState } from './actions';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FeedStockRecord = {
  id: string;
  date: string;
  feed_type: string;
  quantity: number;
  unit: string;
  supplier: string | null;
  cost: number | null;
};

type FeedAllocationRecord = {
  id: string;
  date: string;
  shed: string;
  feed_type: string;
  quantity_allocated: number;
  unit: string;
  allocated_by: string;
}

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

export function EditFeedStockButton({ record }: { record: FeedStockRecord }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const initialState: FormState = { message: "", success: undefined };
  const [state, formAction] = useActionState(updateFeedStock, initialState);

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
        <DialogContent className="sm:max-w-xl">
            <DialogHeader>
                <DialogTitle>Edit Feed Stock Record</DialogTitle>
                <DialogDescription>Update the details for this stock item. Click save when you're done.</DialogDescription>
            </DialogHeader>
            <form action={formAction}>
                <input type="hidden" name="id" value={record.id} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                     <div className="space-y-1.5">
                        <Label htmlFor="date-edit">Date</Label>
                        <Input id="date-edit" name="date" type="date" defaultValue={record.date} />
                        {state.errors?.date && <p className="text-sm font-medium text-destructive">{state.errors.date[0]}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="feedType-edit">Feed Type</Label>
                        <Input id="feedType-edit" name="feedType" defaultValue={record.feed_type} />
                        {state.errors?.feedType && <p className="text-sm font-medium text-destructive">{state.errors.feedType[0]}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="quantity-edit">Quantity</Label>
                        <Input id="quantity-edit" name="quantity" type="number" defaultValue={record.quantity} />
                        {state.errors?.quantity && <p className="text-sm font-medium text-destructive">{state.errors.quantity[0]}</p>}
                    </div>
                     <div className="space-y-1.5">
                        <Label htmlFor="unit-edit">Unit</Label>
                        <Select name="unit" defaultValue={record.unit}>
                            <SelectTrigger id="unit-edit"><SelectValue placeholder="Select unit" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bags">Bags</SelectItem>
                                <SelectItem value="kg">Kilograms (kg)</SelectItem>
                            </SelectContent>
                        </Select>
                        {state.errors?.unit && <p className="text-sm font-medium text-destructive">{state.errors.unit[0]}</p>}
                    </div>
                     <div className="space-y-1.5">
                        <Label htmlFor="supplier-edit">Supplier (Optional)</Label>
                        <Input id="supplier-edit" name="supplier" defaultValue={record.supplier ?? ''} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="cost-edit">Cost per Unit (Optional)</Label>
                        <Input id="cost-edit" name="cost" type="number" step="0.01" defaultValue={record.cost ?? ''} />
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

export function EditFeedAllocationButton({ record }: { record: FeedAllocationRecord }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const initialState: FormState = { message: "", success: undefined };
  const [state, formAction] = useActionState(updateFeedAllocation, initialState);
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
        <DialogContent className="sm:max-w-xl">
            <DialogHeader>
                <DialogTitle>Edit Feed Allocation</DialogTitle>
                <DialogDescription>Update the details for this allocation record. Click save when you're done.</DialogDescription>
            </DialogHeader>
            <form action={formAction}>
                <input type="hidden" name="id" value={record.id} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="date-alloc-edit">Allocation Date</Label>
                        <Input id="date-alloc-edit" name="date" type="date" defaultValue={record.date} />
                        {state.errors?.date && <p className="text-sm font-medium text-destructive">{state.errors.date[0]}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="shed-alloc-edit">Shed</Label>
                         <Select name="shed" defaultValue={record.shed}>
                          <SelectTrigger id="shed-alloc-edit">
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
                        <Label htmlFor="feedType-alloc-edit">Feed Type</Label>
                        <Input id="feedType-alloc-edit" name="feedType" defaultValue={record.feed_type} />
                        {state.errors?.feedType && <p className="text-sm font-medium text-destructive">{state.errors.feedType[0]}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="quantityAllocated-edit">Quantity Allocated</Label>
                        <Input id="quantityAllocated-edit" name="quantityAllocated" type="number" defaultValue={record.quantity_allocated} />
                        {state.errors?.quantityAllocated && <p className="text-sm font-medium text-destructive">{state.errors.quantityAllocated[0]}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="unit-alloc-edit">Unit</Label>
                        <Select name="unit" defaultValue={record.unit}>
                            <SelectTrigger id="unit-alloc-edit"><SelectValue placeholder="Select unit" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bags">Bags</SelectItem>
                                <SelectItem value="kg">Kilograms (kg)</SelectItem>
                            </SelectContent>
                        </Select>
                        {state.errors?.unit && <p className="text-sm font-medium text-destructive">{state.errors.unit[0]}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="allocatedBy-edit">Allocated By</Label>
                        <Input id="allocatedBy-edit" name="allocatedBy" defaultValue={record.allocated_by} />
                        {state.errors?.allocatedBy && <p className="text-sm font-medium text-destructive">{state.errors.allocatedBy[0]}</p>}
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
