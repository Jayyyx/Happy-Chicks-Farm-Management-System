
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { AddEggRecordForm } from "./add-egg-record-form";
import { EditEggRecordButton } from "./edit-egg-record-button";
import { DeleteEggCollectionButton } from "./delete-button";
import { format } from "date-fns";

export default async function EggCollectionPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [eggCollectionResponse, profileResponse] = await Promise.all([
      supabase.from('egg_collections').select('*').order('date', { ascending: false }),
      user ? supabase.from('profiles').select('full_name').eq('id', user.id).single() : Promise.resolve({ data: null })
  ]);
  
  const { data: eggCollectionData, error } = eggCollectionResponse;
  const userName = profileResponse.data?.full_name ?? user?.email ?? "Current User";

  if (error) {
    console.error("Supabase fetch error:", error.message);
    // You might want to render an error message to the user
  }

  return (
    <div className="space-y-6">
      <AddEggRecordForm userName={userName} />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Egg Collection Log</CardTitle>
          <CardDescription>Recent egg collection records.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Shed</TableHead>
                <TableHead>Total Eggs</TableHead>
                <TableHead>Broken Eggs</TableHead>
                <TableHead>Collected By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eggCollectionData && eggCollectionData.map((record: any) => (
                <TableRow key={record.id}>
                  <TableCell>{format(new Date(record.date + 'T00:00:00'), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{record.shed}</TableCell>
                  <TableCell>{record.total_eggs}</TableCell>
                  <TableCell>{record.broken_eggs}</TableCell>
                  <TableCell>{record.collected_by}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <EditEggRecordButton record={record} userName={userName} />
                    <DeleteEggCollectionButton id={record.id} />
                  </TableCell>
                </TableRow>
              ))}
              {(!eggCollectionData || eggCollectionData.length === 0) && (
                 <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">No egg collection records yet.</TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
