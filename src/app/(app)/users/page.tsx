
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { AddUserButton } from "./add-user-button";
import { EditUserButton } from "./edit-user-button";
import { DeleteUserButton } from "./delete-user-button";
import { format } from "date-fns";

export default async function UserManagementPage() {
  const supabase = createClient();
  
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // Fetch from the 'profiles' table directly, which is accessible via RLS policies.
  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name');
    
  // The current user's role is still needed from the profiles table
  const { data: profile } = currentUser 
    ? await supabase.from('profiles').select('role').eq('id', currentUser.id).single()
    : { data: null };

  const isManager = profile?.role === 'Manager';

  if (error) {
    console.error("Error fetching users:", error.message);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Users</CardTitle>
          <CardDescription>Could not fetch user data. Please check the console or try again later.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive-foreground bg-destructive p-3 rounded-md">{error.message}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-headline flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" /> User Management
            </CardTitle>
            <CardDescription>Manage users, roles, and permissions within Happy Chicks.</CardDescription>
          </div>
          <div className="mt-4 sm:mt-0">
             {isManager && <AddUserButton />}
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">User List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned Shed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users && users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                  <TableCell className="hidden sm:table-cell">{user.email || 'Invited'}</TableCell>
                  <TableCell>
                     <Badge variant={user.role === 'Manager' ? 'default' : 'secondary'}>
                        {user.role}
                     </Badge>
                  </TableCell>
                  <TableCell>{user.assigned_shed || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Active' ? 'outline' : 'destructive'} className={user.status === 'Active' ? 'border-green-500 text-green-600' : ''}>
                      {user.status || 'Invited'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.last_sign_in_at ? format(new Date(user.last_sign_in_at), "dd/MM/yyyy HH:mm") : 'Never'}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {isManager && currentUser?.id !== user.id ? (
                        <>
                            <EditUserButton user={user} />
                            <DeleteUserButton userId={user.id} userName={user.full_name} />
                        </>
                    ) : (
                        <span className="text-xs text-muted-foreground">No actions</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {(!users || users.length === 0) && (
                 <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">No users found.</TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
         <CardFooter className="text-sm text-muted-foreground">
            Total users: {users?.length ?? 0}
        </CardFooter>
      </Card>
    </div>
  );
}
