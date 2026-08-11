import { onCLS, onINP, onLCP, type Metric } from "web-vitals";

function logMetric(metric: Metric) {
  console.log(`[Web Vitals] ${metric.name}:`, metric.value, metric);
}
export function reportWebVitals() {
  if (!import.meta.env.DEV) return;
  onCLS(logMetric);
  onINP(logMetric);
  onLCP(logMetric);
}