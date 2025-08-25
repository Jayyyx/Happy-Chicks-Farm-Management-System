
"use client";

import React, { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ListChecks, PlusCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addTask, type TaskFormState } from './actions';

interface AddTaskFormProps {
  users: { id: string; full_name: string | null }[];
  isManager: boolean;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="bg-accent text-accent-foreground hover:bg-accent/90">
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding Task...</> : <><PlusCircle className="mr-2 h-4 w-4" /> Add Task</>}
    </Button>
  );
}

export function AddTaskForm({ users, isManager }: AddTaskFormProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const initialState: TaskFormState = { message: "", success: false };
  const [state, formAction] = useActionState(addTask, initialState);

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
    }
  }, [state, toast]);

  return (
    <Card>
      <form action={formAction} ref={formRef}>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-primary" /> Create New Task
          </CardTitle>
          <CardDescription>Assign and manage farm tasks and activities.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="description">Task Description</Label>
            <Textarea id="description" name="description" placeholder="e.g., Inspect water system in Shed B" required />
            {state.errors?.description && <p className="text-sm font-medium text-destructive">{state.errors.description[0]}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="assigned_to_id">Assign To</Label>
            <Select name="assigned_to_id" defaultValue="unassigned" disabled={!isManager}>
              <SelectTrigger id="assigned_to_id"><SelectValue placeholder="Select user" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isManager && <p className="text-xs text-muted-foreground">Only managers can assign tasks to other users.</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="due_date">Due Date (Optional)</Label>
            <Input id="due_date" name="due_date" type="date" />
          </div>
          
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea id="notes" name="notes" placeholder="Any additional details or comments" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
