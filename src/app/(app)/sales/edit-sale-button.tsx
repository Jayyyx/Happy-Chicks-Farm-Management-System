
"use client";

import React, { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Loader2, User } from "lucide-react";
import { updateSale, type FormState } from './actions';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SaleRecord = {
  id: string;
  date: string;
  item_sold: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  customer_name: string | null;
  recorded_by: string;
};

const saleItems = [
    "Table Eggs (Crates)",
    "Table Eggs (Dozens)",
    "Pullets (Young Hens)",
    "Old Layers (Culled Birds)",
    "Poultry Manure (Bags)",
    "Broiler Chicken (Live)",
    "Broiler Chicken (Dressed)",
    "Other"
];

const unitMap: { [key: string]: string } = {
    "Table Eggs (Crates)": "crates",
    "Table Eggs (Dozens)": "dozens",
    "Pullets (Young Hens)": "birds",
    "Old Layers (Culled Birds)": "birds",
    "Poultry Manure (Bags)": "bags",
    "Broiler Chicken (Live)": "birds",
    "Broiler Chicken (Dressed)": "kg",
    "Other": ""
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

export function EditSaleButton({ record, userName }: { record: SaleRecord, userName: string }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const initialState: FormState = { message: "", success: undefined };
  const [state, formAction] = useActionState(updateSale, initialState);
  
  const [quantity, setQuantity] = useState<number>(record.quantity);
  const [unitPrice, setUnitPrice] = useState<number>(record.unit_price);
  const [totalPrice, setTotalPrice] = useState<number>(record.total_price);
  const [itemSold, setItemSold] = useState<string>(record.item_sold);
  const [unit, setUnit] = useState<string>(record.unit);

  useEffect(() => {
    if (itemSold in unitMap) {
        setUnit(unitMap[itemSold]);
    }
  }, [itemSold]);

  useEffect(() => {
    setTotalPrice(quantity * unitPrice);
  }, [quantity, unitPrice]);

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
                <DialogTitle>Edit Sale Record</DialogTitle>
                <DialogDescription>Update the details for this sale. Click save when you're done.</DialogDescription>
            </DialogHeader>
            <form action={formAction}>
                <input type="hidden" name="id" value={record.id} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="date_edit">Date of Sale</Label>
                        <Input id="date_edit" name="date" type="date" defaultValue={record.date} />
                        {state.errors?.date && <p className="text-sm font-medium text-destructive">{state.errors.date[0]}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="item_sold_edit">Item Sold</Label>
                        <Select name="item_sold" value={itemSold} onValueChange={setItemSold}>
                        <SelectTrigger id="item_sold_edit">
                            <SelectValue placeholder="Select an item" />
                        </SelectTrigger>
                        <SelectContent>
                            {saleItems.map((item) => (
                            <SelectItem key={item} value={item}>{item}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        {state.errors?.item_sold && <p className="text-sm font-medium text-destructive">{state.errors.item_sold[0]}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="quantity_edit">Quantity</Label>
                        <Input id="quantity_edit" name="quantity" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || 0)} min="0" />
                        {state.errors?.quantity && <p className="text-sm font-medium text-destructive">{state.errors.quantity[0]}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="unit_edit">Unit</Label>
                        <Input 
                            id="unit_edit" 
                            name="unit" 
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            readOnly={itemSold !== 'Other'}
                            className={itemSold !== 'Other' ? 'bg-muted/50' : ''}
                        />
                        {state.errors?.unit && <p className="text-sm font-medium text-destructive">{state.errors.unit[0]}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="unit_price_edit">Unit Price</Label>
                        <Input id="unit_price_edit" name="unit_price" type="number" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value) || 0)} min="0" step="0.01" />
                        {state.errors?.unit_price && <p className="text-sm font-medium text-destructive">{state.errors.unit_price[0]}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="total_price_edit">Total Price</Label>
                        <Input id="total_price_edit" name="total_price" type="number" value={totalPrice.toFixed(2)} readOnly className="bg-muted/50" />
                        {state.errors?.total_price && <p className="text-sm font-medium text-destructive">{state.errors.total_price[0]}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="customer_name_edit">Customer Name (Optional)</Label>
                        <Input id="customer_name_edit" name="customer_name" defaultValue={record.customer_name ?? ''} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Recorded By</Label>
                        <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted/50 px-3 py-2 text-sm">
                            <User className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{userName} (Current User)</span>
                        </div>
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
