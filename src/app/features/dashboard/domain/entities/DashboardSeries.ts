export type DashboardPeriod = 'today' | 'week' | 'month' | 'year';

export interface DashboardSeriesPoint {
  label: string;      // ex: "Seg", "01/03", "Mar", "2025"
  volume: number;     // centavos
  transactions: number;
}

export interface DashboardChartData {
  period: DashboardPeriod;
  points: DashboardSeriesPoint[];
}
