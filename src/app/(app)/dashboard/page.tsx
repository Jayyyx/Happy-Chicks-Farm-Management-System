
import { createClient } from "@/lib/supabase/server";
import { 
  subDays, 
  startOfToday, 
  format, 
  eachWeekOfInterval, 
  startOfWeek,
  endOfWeek,
  eachMonthOfInterval,
  endOfMonth,
  subMonths
} from 'date-fns';
import { DashboardClientContent } from './client'; // Import the new client component

const BIRD_START_COUNT = 5500; // Assumption for initial bird count

async function getDashboardData() {
  const supabase = createClient();
  const today = startOfToday();
  const sixWeeksAgo = subDays(today, 42);
  const sixMonthsAgo = subMonths(today, 6);

  const [
    eggCollectionData,
    mortalityData,
    feedAllocationData,
    feedStockData
  ] = await Promise.all([
    supabase.from('egg_collections').select('*').gte('date', format(sixWeeksAgo, 'yyyy-MM-dd')),
    supabase.from('mortality_records').select('*').gte('date', format(sixMonthsAgo, 'yyyy-MM-dd')),
    supabase.from('feed_allocations').select('*').order('date', { ascending: false }),
    supabase.from('feed_stock').select('*').order('date', { ascending: false })
  ]);

  if (eggCollectionData.error || mortalityData.error || feedAllocationData.error || feedStockData.error) {
    console.error("Dashboard data fetch error:", 
      eggCollectionData.error?.message || mortalityData.error?.message || feedAllocationData.error?.message || feedStockData.error?.message
    );
    // Return empty/default data to prevent crash
    return {
      kpis: {
        totalEggsToday: 'N/A',
        feedConsumption: 'N/A',
        mortalityRate: 'N/A',
        activeBirds: 'N/A',
        brokenEggs: 'N/A',
        feedInventory: 'N/A',
        eggCollectionTrend: 'N/A',
        feedConsumptionTrend: 'N/A',
        mortalityRateTrend: 'N/A',
        brokenEggsTrend: 'N/A'
      },
      charts: {
        eggCollectionTrend: [],
        feedConsumptionAnalysis: [],
        mortalityRateTrend: []
      },
      activityLog: []
    };
  }

  const eggs = eggCollectionData.data || [];
  const mortalities = mortalityData.data || [];
  const allocations = feedAllocationData.data || [];
  const stocks = feedStockData.data || [];

  // --- KPI Calculations ---
  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');
  
  const totalMortality = mortalities.reduce((acc, curr) => acc + curr.count, 0);
  const activeBirds = BIRD_START_COUNT - totalMortality;

  const eggsToday = eggs.filter(e => e.date === todayStr);
  const eggsYesterday = eggs.filter(e => e.date === yesterdayStr);
  
  const totalEggsToday = eggsToday.reduce((acc, curr) => acc + curr.total_eggs, 0);
  const totalEggsYesterday = eggsYesterday.reduce((acc, curr) => acc + curr.total_eggs, 0);

  const eggCollectionRate = activeBirds > 0 ? (totalEggsToday / activeBirds) * 100 : 0;
  const eggCollectionRateYesterday = activeBirds > 0 ? (totalEggsYesterday / activeBirds) * 100 : 0;
  const eggCollectionTrend = eggCollectionRate - eggCollectionRateYesterday;

  const feedToday = allocations.filter(a => a.date === todayStr);
  const feedYesterday = allocations.filter(a => a.date === yesterdayStr);
  const feedConsumptionToday = feedToday.reduce((acc, curr) => acc + curr.quantity_allocated, 0);
  const feedConsumptionYesterday = feedYesterday.reduce((acc, curr) => acc + curr.quantity_allocated, 0);
  const feedConsumptionTrend = feedConsumptionToday - feedConsumptionYesterday;

  const mortalityLast30Days = mortalities
    .filter(m => new Date(m.date) > subDays(today, 30))
    .reduce((acc, curr) => acc + curr.count, 0);
  const mortalityRate = activeBirds > 0 ? (mortalityLast30Days / (activeBirds + mortalityLast30Days)) * 100 : 0;
  
  const mortalityLastMonth = mortalities
    .filter(m => new Date(m.date) > subDays(today, 60) && new Date(m.date) <= subDays(today, 30))
    .reduce((acc, curr) => acc + curr.count, 0);
  const mortalityRateLastMonth = activeBirds > 0 && (activeBirds + mortalityLast30Days + mortalityLastMonth) > 0 ? (mortalityLastMonth / (activeBirds + mortalityLast30Days + mortalityLastMonth)) * 100 : 0;
  const mortalityRateTrend = mortalityRate - mortalityRateLastMonth;

  const brokenEggsToday = eggsToday.reduce((acc, curr) => acc + curr.broken_eggs, 0);
  const brokenEggsYesterday = eggsYesterday.reduce((acc, curr) => acc + curr.broken_eggs, 0);
  const brokenEggsTrend = brokenEggsToday - brokenEggsYesterday;

  const totalStock = stocks
    .filter(s => s.unit === 'bags')
    .reduce((acc, curr) => acc + curr.quantity, 0);
  const totalAllocated = allocations
    .filter(a => a.unit === 'bags')
    .reduce((acc, curr) => acc + curr.quantity_allocated, 0);
  const feedInventory = totalStock - totalAllocated;

  // --- Chart Data ---
  const weeklyEggData = eachWeekOfInterval({ start: sixWeeksAgo, end: today })
    .map((weekStart, i) => {
      const weekEnd = endOfWeek(weekStart);
      const weeklyEggs = eggs
        .filter(e => new Date(e.date + 'T00:00:00') >= weekStart && new Date(e.date + 'T00:00:00') <= weekEnd)
        .reduce((sum, e) => sum + e.total_eggs, 0);
      return { date: `W${i + 1}`, value: weeklyEggs };
    });

  const feedByShed = allocations.reduce((acc, curr) => {
    acc[curr.shed] = (acc[curr.shed] || 0) + curr.quantity_allocated;
    return acc;
  }, {} as Record<string, number>);
  const feedConsumptionAnalysis = Object.entries(feedByShed).map(([shed, total]) => ({
    category: shed,
    current: total
  }));

  const monthlyMortalityData = eachMonthOfInterval({ start: sixMonthsAgo, end: today })
    .map(monthStart => {
        const monthEnd = endOfMonth(monthStart);
        const monthlyDeaths = mortalities
            .filter(m => new Date(m.date + 'T00:00:00') >= monthStart && new Date(m.date + 'T00:00:00') <= monthEnd)
            .reduce((sum, m) => sum + m.count, 0);
        return { date: format(monthStart, 'MMM'), value: monthlyDeaths };
    });

  // --- Activity Log ---
  const latestAllocations = allocations.slice(0, 3).map(a => ({ type: 'feed_allocation', date: a.date, data: a }));
  const latestMortality = mortalities.slice(0, 3).map(m => ({ type: 'mortality', date: m.date, data: m }));
  const latestStock = stocks.slice(0, 3).map(s => ({ type: 'feed_stock', date: s.date, data: s }));
  
  const allActivities = [...latestAllocations, ...latestMortality, ...latestStock]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);


  return {
    kpis: {
      totalEggsToday: `${totalEggsToday} Eggs`,
      feedConsumption: `${feedConsumptionToday} kg/day`,
      mortalityRate: `${mortalityRate.toFixed(1)}%`,
      activeBirds: activeBirds.toLocaleString(),
      brokenEggs: `${brokenEggsToday}/day`,
      feedInventory: `${feedInventory} Bags`,
      eggCollectionTrend: `${eggCollectionTrend >= 0 ? '+' : ''}${eggCollectionTrend.toFixed(1)}% from yesterday`,
      feedConsumptionTrend: `${feedConsumptionTrend >= 0 ? '+' : ''}${feedConsumptionTrend}kg from yesterday`,
      mortalityRateTrend: `${mortalityRateTrend >= 0 ? '+' : ''}${mortalityRateTrend.toFixed(2)}% from last month`,
      brokenEggsTrend: `${brokenEggsTrend >= 0 ? '+' : ''}${brokenEggsTrend} from yesterday`
    },
    charts: {
      eggCollectionTrend: weeklyEggData,
      feedConsumptionAnalysis,
      mortalityRateTrend: monthlyMortalityData
    },
    activityLog: allActivities
  }
}

export default async function DashboardPage() {
  const dashboardData = await getDashboardData();
  
  return (
    <DashboardClientContent 
        kpis={dashboardData.kpis}
        charts={dashboardData.charts}
        activityLog={dashboardData.activityLog}
    />
  );
}
