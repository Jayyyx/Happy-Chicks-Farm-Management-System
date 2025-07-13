
"use client";

import React, { useState } from 'react';
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Lightbulb, Loader2, AlertTriangle } from "lucide-react";
import { optimizeFarmOperations, type OptimizeFarmOperationsInput, type OptimizeFarmOperationsOutput } from '@/ai/flows/optimize-farm-operations';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  eggProductionRate: z.coerce.number().min(0, "Cannot be negative").max(100, "Cannot exceed 100%"),
  feedConsumption: z.coerce.number().min(0, "Cannot be negative"),
  mortalityRate: z.coerce.number().min(0, "Cannot be negative").max(100, "Cannot exceed 100%"),
  numberOfBirds: z.coerce.number().int().min(1, "Must be at least 1 bird"),
});

export default function OptimizePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<OptimizeFarmOperationsInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eggProductionRate: 0,
      feedConsumption: 0,
      mortalityRate: 0,
      numberOfBirds: 1,
    },
  });

  const onSubmit: SubmitHandler<OptimizeFarmOperationsInput> = async (data) => {
    setIsLoading(true);
    setAiSuggestions(null);
    setError(null);
    try {
      const result: OptimizeFarmOperationsOutput = await optimizeFarmOperations(data);
      setAiSuggestions(result.suggestions);
      toast({
        title: "Optimization Suggestions Ready!",
        description: "AI has provided tips to improve your farm operations.",
      });
    } catch (e: any) {
      console.error("AI Optimization Error:", e);
      setError(e.message || "An unexpected error occurred while fetching suggestions.");
      toast({
        title: "Error",
        description: "Could not fetch optimization suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><Lightbulb className="h-6 w-6 text-primary" /> AI Farm Optimizer</CardTitle>
          <CardDescription>Enter your current farm data to get AI-powered suggestions for improving efficiency and productivity.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="eggProductionRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Egg Production Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 85" {...field} />
                    </FormControl>
                    <FormDescription>Current average egg production rate.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="feedConsumption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feed Consumption (kg/day)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 500" {...field} />
                    </FormControl>
                    <FormDescription>Total daily feed consumed by all birds.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mortalityRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mortality Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 1.5" {...field} />
                    </FormControl>
                    <FormDescription>Current average mortality rate.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numberOfBirds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Birds</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 5400" {...field} />
                    </FormControl>
                    <FormDescription>Total number of birds currently in the farm.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-4 w-4" /> Get Optimization Tips
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {error && (
        <Card className="max-w-2xl mx-auto border-destructive">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-6 w-6" /> Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground bg-destructive p-3 rounded-md">{error}</p>
          </CardContent>
        </Card>
      )}

      {aiSuggestions && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-primary">Optimization Suggestions</CardTitle>
            <CardDescription>Here are some AI-driven tips based on your data:</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              value={aiSuggestions}
              className="min-h-[200px] bg-muted/50 text-foreground"
              aria-label="AI Suggestions"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
