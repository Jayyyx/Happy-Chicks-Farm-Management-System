
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CircleAlert, Edit } from "lucide-react";
import { AddFeedStockForm } from "./add-feed-stock-form";
import { AddFeedAllocationForm } from "./add-feed-allocation-form";
import { DeleteFeedStockButton, DeleteFeedAllocationButton } from "./delete-buttons";

export default async function InventoryPage() {
  const supabase = createClient();
  const { data: feedStock, error: stockError } = await supabase.from('feed_stock').select('*').order('date', { ascending: false });
  const { data: feedAllocations, error: allocationError } = await supabase.from('feed_allocations').select('*').order('date', { ascending: false });

  if (stockError) console.error("Supabase stock fetch error:", stockError.message);
  if (allocationError) console.error("Supabase allocation fetch error:", allocationError.message);

  const lowStockThreshold = 20; // Example: 20 bags/kg

  return (
    <div className="space-y-6">
      <AddFeedStockForm />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Current Feed Stock</CardTitle>
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
                  <TableCell>{item.cost ? `$${Number(item.cost).toFixed(2)}` : 'N/A'}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" className="hover:text-accent" disabled> {/* TODO: Edit functionality */}
                      <Edit className="h-4 w-4" />
                    </Button>
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
          <CardTitle className="font-headline">Feed Allocation Log</CardTitle>
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
                     <Button variant="ghost" size="icon" className="hover:text-accent" disabled> {/* TODO: Edit functionality */}
                        <Edit className="h-4 w-4" />
                     </Button>
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
            <Button variant="outline" disabled>View Full Allocation History</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
