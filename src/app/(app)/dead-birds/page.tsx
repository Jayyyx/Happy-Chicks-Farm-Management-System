
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { AddMortalityRecordForm } from "./add-mortality-record-form";
import { EditMortalityRecordButton } from "./edit-mortality-record-button";
import { DeleteMortalityRecordButton } from "./delete-mortality-record-button";
import { format } from "date-fns";

export default async function DeadBirdsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [mortalityResponse, profileResponse] = await Promise.all([
    supabase.from('mortality_records').select('*').order('date', { ascending: false }),
    user ? supabase.from('profiles').select('full_name').eq('id', user.id).single() : Promise.resolve({ data: null })
  ]);
  
  const { data: mortalityData, error } = mortalityResponse;
  const userName = profileResponse.data?.full_name ?? user?.email ?? "Current User";

  if (error) {
    console.error("Supabase fetch error:", error.message);
  }

  return (
    <div className="space-y-6">
      <AddMortalityRecordForm userName={userName} />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Dead Birds Log</CardTitle>
          <CardDescription>Recent records of dead birds.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Shed</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Cause/Notes</TableHead>
                <TableHead>Recorded By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mortalityData && mortalityData.map((record: any) => (
                <TableRow key={record.id}>
                  <TableCell>{format(new Date(record.date + 'T00:00:00'), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{record.shed}</TableCell>
                  <TableCell>{record.count}</TableCell>
                  <TableCell className="max-w-xs truncate">{record.cause || 'N/A'}</TableCell>
                  <TableCell>{record.recorded_by}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <EditMortalityRecordButton record={record} userName={userName} />
                    <DeleteMortalityRecordButton id={record.id} />
                  </TableCell>
                </TableRow>
              ))}
              {(!mortalityData || mortalityData.length === 0) && (
                 <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">No records of dead birds yet.</TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
