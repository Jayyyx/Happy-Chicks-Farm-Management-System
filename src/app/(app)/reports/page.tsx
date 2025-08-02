
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, Filter, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { subDays, startOfToday, format, subWeeks, subMonths } from 'date-fns';

interface ReportDataRow {
  [key: string]: string | number | undefined;
}

const reportHeaders: { [key: string]: string[] } = {
    eggCollection: ["Date", "Shed", "Total Eggs", "Broken Eggs"],
    feedUsage: ["Date", "Shed", "Feed Type", "Quantity Used"],
    brokenEggs: ["Date", "Shed", "Broken Eggs", "Percentage of Total"],
    mortality: ["Date", "Shed", "Mortality Count", "Suspected Cause"]
};

export default function ReportsPage() {
  const { toast } = useToast();
  const supabase = createClient();

  const [reportType, setReportType] = useState<string>('');
  const [reportPeriod, setReportPeriod] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedReportData, setGeneratedReportData] = useState<ReportDataRow[]>([]);
  const [currentReportHeaders, setCurrentReportHeaders] = useState<string[]>([]);

  const handleGenerateReport = async () => {
    if (!reportType || !reportPeriod) {
      toast({
        title: "Selection Missing",
        description: "Please select both a report type and a period.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setGeneratedReportData([]);
    setCurrentReportHeaders([]);

    const today = startOfToday();
    let startDate: Date;

    switch (reportPeriod) {
        case 'daily':
            startDate = subDays(today, 1);
            break;
        case 'weekly':
            startDate = subWeeks(today, 1);
            break;
        case 'monthly':
            startDate = subMonths(today, 1);
            break;
        default:
            startDate = subMonths(today, 3); // Default to a wider range
    }
    const formattedStartDate = format(startDate, 'yyyy-MM-dd');

    let data: ReportDataRow[] = [];
    let headers: string[] = [];

    try {
        switch (reportType) {
            case 'eggCollection': {
                const { data: dbData, error } = await supabase.from('egg_collections').select('*').gte('date', formattedStartDate).order('date', { ascending: false });
                if (error) throw error;
                headers = reportHeaders.eggCollection;
                data = dbData.map(d => ({ date: d.date, shed: d.shed, totaleggs: d.total_eggs, brokeneggs: d.broken_eggs }));
                break;
            }
            case 'feedUsage': {
                const { data: dbData, error } = await supabase.from('feed_allocations').select('*').gte('date', formattedStartDate).order('date', { ascending: false });
                if (error) throw error;
                headers = reportHeaders.feedUsage;
                data = dbData.map(d => ({ date: d.date, shed: d.shed, feedtype: d.feed_type, quantityused: `${d.quantity_allocated} ${d.unit}` }));
                break;
            }
            case 'mortality': {
                const { data: dbData, error } = await supabase.from('mortality_records').select('*').gte('date', formattedStartDate).order('date', { ascending: false });
                if (error) throw error;
                headers = reportHeaders.mortality;
                data = dbData.map(d => ({ date: d.date, shed: d.shed, mortalitycount: d.count, suspectedcause: d.cause || 'Unknown' }));
                break;
            }
            case 'brokenEggs': {
                const { data: dbData, error } = await supabase.from('egg_collections').select('date, shed, broken_eggs, total_eggs').gte('date', formattedStartDate).order('date', { ascending: false });
                if (error) throw error;
                headers = reportHeaders.brokenEggs;
                data = dbData.filter(d => d.broken_eggs > 0).map(d => ({
                    date: d.date,
                    shed: d.shed,
                    brokeneggs: d.broken_eggs,
                    percentageoftotal: d.total_eggs > 0 ? `${((d.broken_eggs / d.total_eggs) * 100).toFixed(1)}%` : '0.0%'
                }));
                break;
            }
        }

        setGeneratedReportData(data);
        setCurrentReportHeaders(headers);

        if (data.length > 0) {
            toast({
                title: "Report Generated",
                description: `${reportType.replace(/([A-Z])/g, ' $1').trim()} report for the selected period is ready.`,
            });
        } else {
            toast({
                title: "No Data Found",
                description: `There is no data for the selected report and period.`,
            });
        }
    } catch (err: any) {
        console.error("Report generation error:", err);
        toast({
            title: "Error Generating Report",
            description: err.message || "Could not fetch data from the database.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (generatedReportData.length === 0) {
       toast({
        title: "No Report to Download",
        description: "Please generate a report first.",
        variant: "destructive",
      });
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += currentReportHeaders.join(",") + "\r\n";
    generatedReportData.forEach(row => {
        const values = currentReportHeaders.map(header => {
            const key = header.toLowerCase().replace(/\s+/g, '');
            return row[key] ?? '';
        });
        csvContent += values.join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportType}_${reportPeriod}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Report Downloaded", description: "The report has been downloaded as a CSV file." });
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><FileText className="h-6 w-6 text-primary" /> Generate Farm Reports</CardTitle>
          <CardDescription>Select report parameters to view and download farm performance data.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5">
            <Label htmlFor="reportType">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType} disabled={isLoading}>
              <SelectTrigger id="reportType">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Production</SelectLabel>
                  <SelectItem value="eggCollection">Egg Collection</SelectItem>
                  <SelectItem value="brokenEggs">Broken Eggs</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Resources</SelectLabel>
                  <SelectItem value="feedUsage">Feed Usage</SelectItem>
                </SelectGroup>
                 <SelectGroup>
                  <SelectLabel>Health</SelectLabel>
                  <SelectItem value="mortality">Mortality</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reportPeriod">Report Period</Label>
            <Select value={reportPeriod} onValueChange={setReportPeriod} disabled={isLoading}>
              <SelectTrigger id="reportPeriod">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Last 24 hours</SelectItem>
                <SelectItem value="weekly">Last 7 days</SelectItem>
                <SelectItem value="monthly">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerateReport} className="w-full md:w-auto bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
           {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Filter className="mr-2 h-4 w-4" />}
           {isLoading ? "Generating..." : "Generate Report"}
          </Button>
        </CardContent>
      </Card>

      {generatedReportData.length > 0 && !isLoading && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline capitalize">{reportType.replace(/([A-Z])/g, ' $1').trim()} Report</CardTitle>
              <CardDescription>Generated report data for the selected period.</CardDescription>
            </div>
            <Button variant="outline" onClick={handleDownloadReport}>
              <Download className="mr-2 h-4 w-4" /> Download CSV
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {currentReportHeaders.map((header) => (
                    <TableHead key={header}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {generatedReportData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {currentReportHeaders.map((header, cellIndex) => {
                       const key = header.toLowerCase().replace(/\s+/g, '');
                       return (
                          <TableCell key={cellIndex}>
                            {row[key] ?? 'N/A'}
                          </TableCell>
                       );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
       {!isLoading && generatedReportData.length === 0 && reportType && reportPeriod && (
         <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No data available for the selected criteria. Try different options.</p>
            </CardContent>
         </Card>
       )}
    </div>
  );
}
