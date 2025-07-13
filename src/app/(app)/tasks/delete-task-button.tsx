
"use client";

import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { deleteTask } from './actions';
import { useToast } from "@/hooks/use-toast";
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <AlertDialogAction asChild>
      <Button
        type="submit"
        disabled={pending}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Yes, delete task"}
      </Button>
    </AlertDialogAction>
  );
}

export function DeleteTaskButton({ taskId }: { taskId: string }) {
    const { toast } = useToast();
    const deleteTaskWithId = deleteTask.bind(null, taskId);

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <form action={async () => {
                    const result = await deleteTaskWithId();
                    toast({
                        title: result.success ? "Success" : "Error",
                        description: result.message,
                        variant: result.success ? "default" : "destructive",
                    });
                }}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the task.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <SubmitButton />
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
