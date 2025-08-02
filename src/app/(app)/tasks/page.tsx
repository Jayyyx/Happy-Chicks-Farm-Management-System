
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ListChecks } from "lucide-react";
import { AddTaskForm } from "./add-task-form";
import { EditTaskButton } from "./edit-task-button";
import { DeleteTaskButton } from "./delete-task-button";

export default async function TasksPage() {
  const supabase = createClient();
  
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const [tasksResponse, usersResponse, profileResponse] = await Promise.all([
    supabase
      .from('tasks')
      .select(`
        id,
        description,
        due_date,
        status,
        created_at,
        notes,
        profiles (
          id,
          full_name
        )
      `)
      .order('created_at', { ascending: false }),
    supabase
      .from('user_details')
      .select('id, full_name'),
    currentUser ? supabase.from('profiles').select('role').eq('id', currentUser.id).single() : Promise.resolve({ data: null, error: null })
  ]);

  const { data: tasks, error: tasksError } = tasksResponse;
  const { data: users, error: usersError } = usersResponse;
  const { data: profile, error: profileError } = profileResponse;
  
  if (tasksError || usersError || profileError) {
    const errorMessage = tasksError?.message || usersError?.message || profileError?.message;
    console.error("Error fetching data for tasks page:", errorMessage);
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-destructive">Error Loading Tasks</CardTitle>
                <CardDescription>
                    Could not fetch data for the tasks page. Please try again later.
                    {errorMessage && <pre className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded-md whitespace-pre-wrap">{errorMessage}</pre>}
                </CardDescription>
            </CardHeader>
        </Card>
    );
  }

  const isManager = profile?.role === 'Manager';

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Completed': return { variant: 'default', className: 'bg-green-600 text-white' };
      case 'In Progress': return { variant: 'outline', className: 'border-blue-500 text-blue-600' };
      case 'Blocked': return { variant: 'destructive', className: '' };
      case 'Pending':
      default:
        return { variant: 'secondary', className: '' };
    }
  };

  return (
    <div className="space-y-6">
      <AddTaskForm users={users ?? []} isManager={isManager} />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-primary" /> Task List
          </CardTitle>
          <CardDescription>Overview of current and past tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks && tasks.map((task) => {
                const badgeStyle = getStatusBadgeVariant(task.status);
                return (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium max-w-xs truncate" title={task.description ?? ''}>
                      {task.description || 'N/A'}
                    </TableCell>
                    <TableCell>{task.profiles?.full_name || 'Unassigned'}</TableCell>
                    <TableCell>{task.due_date ? new Date(task.due_date + 'T00:00:00').toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={badgeStyle.variant as any} className={badgeStyle.className}>
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(task.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <EditTaskButton task={task as any} users={users ?? []} isManager={isManager} />
                      <DeleteTaskButton taskId={task.id} />
                    </TableCell>
                  </TableRow>
                )
              })}
              {(!tasks || tasks.length === 0) && (
                 <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">No tasks found. Create one above!</TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
