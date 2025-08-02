
"use client";

import { KpiCard } from "@/components/dashboard/KpiCard";
import { SampleBarChart } from "@/components/charts/SampleBarChart";
import { SampleLineChart } from "@/components/charts/SampleLineChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, Activity } from "lucide-react";
import { BirdIcon } from "@/components/icons/BirdIcon";
import { EggIcon } from "@/components/icons/EggIcon";
import { FeedIcon } from "@/components/icons/FeedIcon";
import { format } from 'date-fns';

// This is the client component that will render the dashboard UI.
// It receives all data as props from the server component.

export function DashboardClientContent({ kpis, charts, activityLog }: { kpis: any, charts: any, activityLog: any[] }) {
    
  const ActivityIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'feed_allocation': return <FeedIcon className="h-5 w-5 text-blue-500 mr-3" />;
      case 'mortality': return <AlertTriangle className="h-5 w-5 text-destructive mr-3" />;
      case 'feed_stock': return <Package className="h-5 w-5 text-green-500 mr-3" />;
      default: return <Activity className="h-5 w-5 text-gray-500 mr-3" />;
    }
  };
  
  const activityText = (item: any) => {
    switch(item.type) {
      case 'feed_allocation':
        return `${item.data.quantity_allocated} ${item.data.unit} of ${item.data.feed_type} allocated to ${item.data.shed} by ${item.data.allocated_by}.`;
      case 'mortality':
        return `${item.data.count} mortalities recorded in ${item.data.shed}. Cause: ${item.data.cause || 'Unknown'}.`;
      case 'feed_stock':
        return `${item.data.quantity} ${item.data.unit} of ${item.data.feed_type} added to stock from ${item.data.supplier || 'supplier'}.`;
      default:
        return 'An activity was logged.';
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          title="Total Eggs Collected"
          value={kpis.totalEggsToday}
          icon={<EggIcon className="h-6 w-6 text-accent" />}
          description="Total eggs collected today"
          trend={kpis.eggCollectionTrend}
          trendColor={kpis.eggCollectionTrend.startsWith('+') ? 'text-green-600' : 'text-red-600'}
        />
        <KpiCard
          title="Feed Consumption"
          value={kpis.feedConsumption}
          icon={<FeedIcon className="h-6 w-6 text-accent" />}
          description="Total daily feed usage"
          trend={kpis.feedConsumptionTrend}
          trendColor={kpis.feedConsumptionTrend.startsWith('-') ? 'text-green-600' : 'text-red-600'}
        />
        <KpiCard
          title="Mortality Rate"
          value={kpis.mortalityRate}
          icon={<BirdIcon className="h-6 w-6 text-destructive" />}
          description="Average over last 30 days"
          trend={kpis.mortalityRateTrend}
          trendColor={kpis.mortalityRateTrend.startsWith('+') ? 'text-red-600' : 'text-green-600'}
        />
        <KpiCard
          title="Active Birds"
          value={kpis.activeBirds}
          icon={<BirdIcon className="h-6 w-6 text-accent" />}
          description="Total birds currently active"
        />
        <KpiCard
          title="Broken Eggs"
          value={kpis.brokenEggs}
          icon={<EggIcon className="h-6 w-6 text-destructive" />}
          description="Daily broken eggs"
          trend={kpis.brokenEggsTrend}
          trendColor={kpis.brokenEggsTrend.startsWith('-') ? 'text-green-600' : 'text-red-600'}
        />
         <KpiCard
          title="Feed Inventory"
          value={kpis.feedInventory}
          icon={<Package className="h-6 w-6 text-accent" />}
          description="Remaining bags in stock"
          trend={Number(String(kpis.feedInventory).split(' ')[0]) < 20 ? "Low stock alert" : "Stock is sufficient"}
          trendColor={Number(String(kpis.feedInventory).split(' ')[0]) < 20 ? "text-red-600" : "text-green-600"}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <SampleLineChart
          title="Egg Collection Trend"
          description="Total eggs collected over the last 6 weeks."
          data={charts.eggCollectionTrend}
          dataKeys={{x: "date", y: "value"}}
          config={{ value: { label: "Total Eggs", color: "hsl(var(--chart-1))" } }}
          yAxisFormatter={(value) => `${value}`}
          yAxisDomain={['auto', 'auto']}
        />
        <SampleBarChart
          title="Feed Consumption Analysis"
          description="Total feed consumption per shed (units)."
          data={charts.feedConsumptionAnalysis}
          dataKeys={{x: "category", y1: "current"}}
          config={{
            desktop: { label: "Allocated", color: "hsl(var(--chart-2))" }
          }}
        />
      </div>
       <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
         <SampleLineChart
          title="Mortality Trend"
          description="Total mortalities recorded over the last 6 months."
          data={charts.mortalityRateTrend}
          dataKeys={{x: "date", y: "value"}}
          config={{ value: { label: "Mortalities", color: "hsl(var(--chart-5))" } }}
          yAxisFormatter={(value) => `${value}`}
          yAxisDomain={[0, 'auto']}
        />
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="font-headline">Farm Activity Log</CardTitle>
            <CardDescription>Recent activities and alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
             {activityLog.length === 0 && <p className="text-muted-foreground text-sm">No recent activities found.</p>}
             {activityLog.map((item: any, index) => (
                <div key={index} className="flex items-start p-2 rounded-md bg-muted/50">
                    <ActivityIcon type={item.type} />
                    <div className="flex-1">
                        <p className="text-sm font-medium">{activityText(item)}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(item.date + 'T00:00:00'), 'PP')}</p>
                    </div>
                </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
