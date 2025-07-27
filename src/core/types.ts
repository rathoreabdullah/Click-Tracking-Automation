/**
 * Type definitions for the DOM tagger
 */

export interface TaggerConfig {
  selectors?: string[];
  attributes?: {
    type?: string;
    action?: string;
    context?: string;
    value?: string;
  };
  debug?: boolean;
}

export interface TaggedElement {
  element: HTMLElement;
  type: string;
  action: string;
  context: string;
  value: string;
}

export interface AnalyticsData {
  action?: string;
  context?: string;  
  type?: string;
  value?: string;
}

export interface PagePerformanceMetrics {
  init_time_ms: number;
  total_elements_tagged: number;
  total_page_memory_mb: number;
  timestamp: number;
}

export interface PerformanceEvent {
  event: string;
  performance: PagePerformanceMetrics;
  timestamp: number;
}

export interface DataLayerEvent {
  event: string;
  click_object: AnalyticsData;
  timestamp: number;
}

// Extend window interface for dataLayer
declare global {
  interface Window {
    dataLayer?: any[];
  }
} 