
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private timers: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(label: string): void {
    this.timers.set(label, performance.now());
    console.time(label);
  }

  endTimer(label: string): number {
    const startTime = this.timers.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      console.timeEnd(label);
      this.timers.delete(label);
      return duration;
    }
    return 0;
  }

  measureApiCall<T>(label: string, apiCall: () => Promise<T>): Promise<T> {
    this.startTimer(`API: ${label}`);
    return apiCall().finally(() => {
      this.endTimer(`API: ${label}`);
    });
  }

  logMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log('Memory Usage:', {
        used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)} MB`
      });
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
