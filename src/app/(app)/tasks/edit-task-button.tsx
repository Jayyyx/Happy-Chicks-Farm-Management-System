
"use client";

import React, { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { Edit3, Loader2 } from "lucide-react";
import { updateTask, type TaskFormState } from './actions';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Task = {
  id: string;
  description: string | null;
  due_date: string | null;
  status: string;
  notes: string | null;
  profiles: {
    id: string;
    full_name: string | null;
  } | null;
};

interface EditTaskButtonProps {
  task: Task;
  users: { id: string; full_name: string | null }[];
  isManager: boolean;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="bg-accent text-accent-foreground hover:bg-accent/90">
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Edit3 className="mr-2 h-4 w-4" /> Save Changes</>}
    </Button>
  );
}

export function EditTaskButton({ task, users, isManager }: EditTaskButtonProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const initialState: TaskFormState = { message: "", success: undefined };
  const [state, formAction] = useActionState(updateTask, initialState);

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
        <Button variant="ghost" size="icon" className="hover:text-accent"><Edit3 className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>Update the details for this task. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="id" value={task.id} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="description_edit">Task Description</Label>
              <Textarea id="description_edit" name="description" defaultValue={task.description ?? ''} required />
              {state.errors?.description && <p className="text-sm font-medium text-destructive">{state.errors.description[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="assigned_to_id_edit">Assign To</Label>
              <Select name="assigned_to_id" defaultValue={task.profiles?.id ?? 'unassigned'} disabled={!isManager}>
                <SelectTrigger id="assigned_to_id_edit"><SelectValue placeholder="Select user" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
               {!isManager && <p className="text-xs text-muted-foreground">Only managers can assign tasks.</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="due_date_edit">Due Date (Optional)</Label>
              <Input id="due_date_edit" name="due_date" type="date" defaultValue={task.due_date ?? ''} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status_edit">Status</Label>
              <Select name="status" defaultValue={task.status}>
                <SelectTrigger id="status_edit"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
               {state.errors?.status && <p className="text-sm font-medium text-destructive">{state.errors.status[0]}</p>}
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="notes_edit">Notes (Optional)</Label>
              <Textarea id="notes_edit" name="notes" placeholder="Any additional details or comments" defaultValue={task.notes ?? ''}/>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
