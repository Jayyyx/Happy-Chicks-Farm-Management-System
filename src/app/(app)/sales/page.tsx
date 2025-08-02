
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit3, CircleDollarSign } from "lucide-react";
import { AddSaleForm } from "./add-sale-form";
import { DeleteSaleButton } from "./delete-button";

export default async function SalesPage() {
  const supabase = createClient();
  const { data: sales, error } = await supabase
    .from('sales')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error("Supabase fetch error:", error.message);
  }

  return (
    <div className="space-y-6">
      <AddSaleForm />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><CircleDollarSign className="h-6 w-6 text-primary"/> Sales Log</CardTitle>
          <CardDescription>History of all recorded sales transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Item Sold</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Unit Price (GH₵)</TableHead>
                <TableHead>Total Price (GH₵)</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Recorded By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales && sales.map((sale: any) => (
                <TableRow key={sale.id}>
                  <TableCell>{new Date(sale.date + 'T00:00:00').toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{sale.item_sold}</TableCell>
                  <TableCell>{sale.quantity}</TableCell>
                  <TableCell>{sale.unit}</TableCell>
                  <TableCell>{Number(sale.unit_price).toFixed(2)}</TableCell>
                  <TableCell>{Number(sale.total_price).toFixed(2)}</TableCell>
                  <TableCell>{sale.customer_name || 'N/A'}</TableCell>
                  <TableCell>{sale.recorded_by}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" className="hover:text-accent" disabled><Edit3 className="h-4 w-4" /></Button>
                    <DeleteSaleButton id={sale.id} />
                  </TableCell>
                </TableRow>
              ))}
              {(!sales || sales.length === 0) && (
                 <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">No sales records yet.</TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
