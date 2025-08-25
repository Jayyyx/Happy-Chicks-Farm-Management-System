
"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EggIcon } from "@/components/icons/EggIcon";
import { BirdIcon } from "@/components/icons/BirdIcon";
import { FeedIcon } from "@/components/icons/FeedIcon";
import { ListChecks, PlusCircle } from 'lucide-react';
import { EditTaskButton } from '@/app/(app)/tasks/edit-task-button';
import { DeleteTaskButton } from '@/app/(app)/tasks/delete-task-button';
import { format } from 'date-fns';

interface WorkerDashboardProps {
  tasks: any[];
  users: any[];
}

export function WorkerDashboard({ tasks, users }: WorkerDashboardProps) {

  const pendingTasks = tasks.filter(t => t.status !== 'Completed');

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-card to-card/80">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Worker Dashboard</CardTitle>
          <CardDescription className="text-base">Welcome back! Here are your quick actions and assigned tasks.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2 text-2xl">
            <PlusCircle className="h-6 w-6 text-primary" /> Quick Actions
          </CardTitle>
          <CardDescription>Quickly log daily farm activities.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button asChild variant="outline" size="lg" className="h-24 flex flex-col items-center justify-center gap-2">
            <Link href="/egg-collection">
              <EggIcon className="h-8 w-8 text-accent" />
              <span className="text-base">Record Egg Collection</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-24 flex flex-col items-center justify-center gap-2">
            <Link href="/dead-birds">
              <BirdIcon className="h-8 w-8 text-destructive" />
              <span className="text-base">Log Dead Birds</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-24 flex flex-col items-center justify-center gap-2">
            <Link href="/inventory">
               <FeedIcon className="h-8 w-8 text-blue-500" />
              <span className="text-base">Allocate Feed</span>
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2 text-2xl">
            <ListChecks className="h-6 w-6 text-primary" /> My Assigned Tasks
          </CardTitle>
          <CardDescription>Tasks assigned to you. Update the status as you work on them.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Date Assigned</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingTasks && pendingTasks.map((task) => {
                return (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium max-w-xs truncate" title={task.description ?? ''}>
                      {task.description || 'N/A'}
                    </TableCell>
                    <TableCell>{task.created_at ? format(new Date(task.created_at), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                    <TableCell>{task.due_date ? format(new Date(task.due_date + 'T00:00:00'), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <span className="text-xs text-muted-foreground">No actions</span>
                    </TableCell>
                  </TableRow>
                )
              })}
              {(!pendingTasks || pendingTasks.length === 0) && (
                 <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">You have no pending tasks. Great job!</TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
