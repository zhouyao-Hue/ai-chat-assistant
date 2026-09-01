import { onCLS, onINP, onLCP, type Metric } from "web-vitals";

/**
 * 开发环境打印 Web Vitals 指标到控制台。
 * @param metric - web-vitals 指标对象
 */
function logMetric(metric: Metric) {
  console.log(`[Web Vitals] ${metric.name}:`, metric.value, metric);
}

/** 注册 CLS / INP / LCP 采集（仅 DEV）。 */
export function reportWebVitals() {
  if (!import.meta.env.DEV) return;
  onCLS(logMetric);
  onINP(logMetric);
  onLCP(logMetric);
}
