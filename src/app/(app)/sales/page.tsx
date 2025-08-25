
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CircleDollarSign } from "lucide-react";
import { AddSaleForm } from "./add-sale-form";
import { EditSaleButton } from "./edit-sale-button";
import { DeleteSaleButton } from "./delete-button";
import { format } from "date-fns";

export default async function SalesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [salesResponse, profileResponse] = await Promise.all([
    supabase.from('sales').select('*').order('date', { ascending: false }),
    user ? supabase.from('profiles').select('full_name').eq('id', user.id).single() : Promise.resolve({ data: null })
  ]);
  
  const { data: sales, error } = salesResponse;
  const userName = profileResponse.data?.full_name ?? user?.email ?? "Current User";

  if (error) {
    console.error("Supabase fetch error:", error.message);
  }

  return (
    <div className="space-y-6">
      <AddSaleForm userName={userName} />

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
                  <TableCell>{format(new Date(sale.date + 'T00:00:00'), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="font-medium">{sale.item_sold}</TableCell>
                  <TableCell>{sale.quantity}</TableCell>
                  <TableCell>{sale.unit}</TableCell>
                  <TableCell>{Number(sale.unit_price).toFixed(2)}</TableCell>
                  <TableCell>{Number(sale.total_price).toFixed(2)}</TableCell>
                  <TableCell>{sale.customer_name || 'N/A'}</TableCell>
                  <TableCell>{sale.recorded_by}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <EditSaleButton record={sale} userName={userName} />
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
