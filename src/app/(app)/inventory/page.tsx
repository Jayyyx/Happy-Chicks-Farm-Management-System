
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CircleAlert, PackagePlus, Send } from "lucide-react";
import { AddFeedStockForm } from "./add-feed-stock-form";
import { AddFeedAllocationForm } from "./add-feed-allocation-form";
import { DeleteFeedStockButton, DeleteFeedAllocationButton } from "./delete-buttons";
import { EditFeedStockButton, EditFeedAllocationButton } from "./edit-buttons";

export default async function InventoryPage() {
  const supabase = createClient();
  
  const [stockResponse, allocationResponse] = await Promise.all([
    supabase.from('feed_stock').select('*').order('date', { ascending: false }),
    supabase.from('feed_allocations').select('*').order('date', { ascending: false })
  ]);

  const { data: feedStock, error: stockError } = stockResponse;
  const { data: feedAllocations, error: allocationError } = allocationResponse;

  if (stockError || allocationError) {
    const errorMessage = stockError?.message || allocationError?.message;
    console.error("Inventory page fetch error:", errorMessage);
    return (
        <div className="space-y-6">
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                        <CircleAlert /> Error Loading Inventory
                    </CardTitle>
                    <CardDescription>
                        Could not fetch inventory data from the database. Please try refreshing the page.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-destructive-foreground bg-destructive p-3 rounded-md">
                        Details: {errorMessage}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
  }

  const lowStockThreshold = 20; // Example: 20 bags/kg

  return (
    <div className="space-y-6">
      <AddFeedStockForm />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <PackagePlus className="h-6 w-6 text-primary" /> Current Feed Stock
          </CardTitle>
          <CardDescription>Overview of available feed inventory.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Added</TableHead>
                <TableHead>Feed Type</TableHead>
                <TableHead>Current Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Cost/Unit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedStock && feedStock.map((item: any) => (
                <TableRow key={item.id} className={item.quantity < lowStockThreshold ? 'bg-destructive/10 hover:bg-destructive/20' : ''}>
                  <TableCell>{new Date(item.date + 'T00:00:00').toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{item.feed_type}</TableCell>
                  <TableCell>
                    {item.quantity < lowStockThreshold && <CircleAlert className="h-4 w-4 inline mr-1 text-destructive" />}
                    {item.quantity}
                  </TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.supplier || 'N/A'}</TableCell>
                  <TableCell>{item.cost ? `GH₵${Number(item.cost).toFixed(2)}` : 'N/A'}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <EditFeedStockButton record={item} />
                    <DeleteFeedStockButton id={item.id} />
                  </TableCell>
                </TableRow>
              ))}
               {(!feedStock || feedStock.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">No stock items found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AddFeedAllocationForm />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Send className="h-6 w-6 text-primary" /> Feed Allocation Log
          </CardTitle>
          <CardDescription>Record of feed allocated to different sheds.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Allocated</TableHead>
                <TableHead>Shed</TableHead>
                <TableHead>Feed Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Allocated By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedAllocations && feedAllocations.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{new Date(item.date + 'T00:00:00').toLocaleDateString()}</TableCell>
                  <TableCell>{item.shed}</TableCell>
                  <TableCell className="font-medium">{item.feed_type}</TableCell>
                  <TableCell>{item.quantity_allocated}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.allocated_by}</TableCell>
                  <TableCell className="text-right space-x-1">
                     <EditFeedAllocationButton record={item} />
                    <DeleteFeedAllocationButton id={item.id} />
                  </TableCell>
                </TableRow>
              ))}
              {(!feedAllocations || feedAllocations.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">No allocation records found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
         <CardFooter className="flex justify-end">
            <Button variant="outline">View Full Allocation History</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
