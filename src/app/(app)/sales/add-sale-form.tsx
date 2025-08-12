
"use client";

import React, { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, PlusCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addSale, type FormState } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="bg-accent text-accent-foreground hover:bg-accent/90">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
      {pending ? "Recording..." : "Record Sale"}
    </Button>
  );
}

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

export function AddSaleForm() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const initialState: FormState = { message: "", success: undefined };
  const [state, formAction] = useActionState(addSale, initialState);
  
  const [quantity, setQuantity] = useState<number>(0);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [itemSold, setItemSold] = useState<string>('');
  const [unit, setUnit] = useState<string>('');


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
      formRef.current?.reset();
      setQuantity(0);
      setUnitPrice(0);
      setItemSold('');
      setUnit('');
    }
  }, [state, toast]);

  const today = new Date().toISOString().split('T')[0];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-primary" /> Record New Sale
        </CardTitle>
        <CardDescription>Log sales of farm produce and livestock.</CardDescription>
      </CardHeader>
      <form action={formAction} ref={formRef}>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="date">Date of Sale</Label>
            <Input id="date" name="date" type="date" defaultValue={today} />
            {state.errors?.date && <p className="text-sm font-medium text-destructive">{state.errors.date[0]}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="item_sold">Item Sold</Label>
            <Select name="item_sold" value={itemSold} onValueChange={setItemSold}>
              <SelectTrigger id="item_sold">
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
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" name="quantity" type="number" placeholder="e.g., 10" value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || 0)} min="0" />
            {state.errors?.quantity && <p className="text-sm font-medium text-destructive">{state.errors.quantity[0]}</p>}
          </div>
           <div className="space-y-1.5">
            <Label htmlFor="unit">Unit</Label>
            <Input 
              id="unit" 
              name="unit" 
              placeholder="e.g., crates, kg"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              readOnly={itemSold !== 'Other'}
              className={itemSold !== 'Other' ? 'bg-muted/50' : ''}
            />
            {state.errors?.unit && <p className="text-sm font-medium text-destructive">{state.errors.unit[0]}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="unit_price">Unit Price</Label>
            <Input id="unit_price" name="unit_price" type="number" placeholder="e.g., 30.00" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value) || 0)} min="0" step="0.01" />
            {state.errors?.unit_price && <p className="text-sm font-medium text-destructive">{state.errors.unit_price[0]}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="total_price">Total Price</Label>
            <Input id="total_price" name="total_price" type="number" value={totalPrice.toFixed(2)} readOnly className="bg-muted/50" />
            {state.errors?.total_price && <p className="text-sm font-medium text-destructive">{state.errors.total_price[0]}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customer_name">Customer Name (Optional)</Label>
            <Input id="customer_name" name="customer_name" placeholder="e.g., Local Market" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="recorded_by">Recorded By</Label>
            <Input id="recorded_by" name="recorded_by" placeholder="Your Name" />
            {state.errors?.recorded_by && <p className="text-sm font-medium text-destructive">{state.errors.recorded_by[0]}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
