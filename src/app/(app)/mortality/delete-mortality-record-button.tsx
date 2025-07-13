
"use client";

import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { deleteMortalityRecord } from './actions';
import { useToast } from "@/hooks/use-toast";
import React from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button variant="ghost" size="icon" className="hover:text-destructive" type="submit" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}

export function DeleteMortalityRecordButton({ id }: { id: string }) {
    const { toast } = useToast();
    const deleteActionWithId = deleteMortalityRecord.bind(null, id);

    return (
        <form action={async () => {
            const result = await deleteActionWithId();
            toast({
                title: result.success ? "Success" : "Error",
                description: result.message,
                variant: result.success ? "default" : "destructive",
            });
        }}>
            <SubmitButton />
        </form>
    );
}
