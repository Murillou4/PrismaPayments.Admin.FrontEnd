import type { Either, Failure } from '$core/error/Failure';
import type { DashboardRepository } from '../data/repositories/DashboardRepository';
import type { AdminDashboardFilters, AdminDashboardResponse } from '../domain/entities/AdminDashboardResponse';
import type { DashboardChartData, DashboardPeriod } from '../domain/entities/DashboardSeries';

export class DashboardService {
  constructor(private readonly repo: DashboardRepository) {}

  async getDashboard(filters?: AdminDashboardFilters): Promise<Either<Failure, AdminDashboardResponse>> {
    return this.repo.getDashboard(filters);
  }

  async getChartData(period: DashboardPeriod): Promise<Either<Failure, DashboardChartData>> {
    return this.repo.getChartData(period);
  }
}
