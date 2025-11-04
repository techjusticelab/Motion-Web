import type { Document, SearchParams, SearchResponse } from '../types';
import { API_URL, handleApiError } from '../config';
import { transformSearchParams, transformSearchDocument } from './transformers';

/**
 * Compute global date range using metadata date fields (not created_at).
 * Scans across: filing_date, event_date, hearing_date, decision_date, served_date
 * by executing lightweight searches to find oldest/newest values.
 */
export async function getGlobalMetadataDateRange(session?: any): Promise<{ oldest: string; newest: string } | null> {
  const dateFields = [
    'metadata.filing_date',
    'metadata.event_date',
    'metadata.hearing_date',
    'metadata.decision_date',
    'metadata.served_date'
  ];

  function extract(doc: Document, fieldPath: string): string | null {
    const key = fieldPath.replace('metadata.', '') as keyof Document['metadata'];
    const value = doc?.metadata?.[key];
    return typeof value === 'string' && value ? value : null;
  }

  // Internal lightweight search function to avoid circular dependency
  async function lightweightSearch(params: SearchParams): Promise<SearchResponse> {
    const transformedParams = transformSearchParams(params);
    const response = await fetch(`${API_URL}/api/v1/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transformedParams)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const raw = await response.json();
    
    // Simple response handling for date range queries
    const searchResult = raw?.data || raw;
    const documents = searchResult?.documents || raw?.documents || [];
    const transformedHits = documents.map(transformSearchDocument);
    
    return {
      total: Number(searchResult?.total_hits || transformedHits.length),
      hits: transformedHits,
      aggregations: searchResult?.aggregations
    };
  }

  try {
    const oldestPromises = dateFields.map((field) =>
      lightweightSearch({ size: 5, sort_by: field, sort_order: 'asc', include_highlights: false } as any)
        .then((res) => {
          const hit = res.hits.find((h: any) => extract(h, field));
          return hit ? extract(hit as any, field) : null;
        })
        .catch(() => null)
    );

    const newestPromises = dateFields.map((field) =>
      lightweightSearch({ size: 5, sort_by: field, sort_order: 'desc', include_highlights: false } as any)
        .then((res) => {
          const hit = res.hits.find((h: any) => extract(h, field));
          return hit ? extract(hit as any, field) : null;
        })
        .catch(() => null)
    );

    const [oldestValues, newestValues] = await Promise.all([
      Promise.all(oldestPromises),
      Promise.all(newestPromises)
    ]);

    const parsedOldest = oldestValues
      .filter((v): v is string => !!v)
      .map((v) => ({ v, t: Date.parse(v) }))
      .filter(({ t }) => !Number.isNaN(t));

    const parsedNewest = newestValues
      .filter((v): v is string => !!v)
      .map((v) => ({ v, t: Date.parse(v) }))
      .filter(({ t }) => !Number.isNaN(t));

    if (parsedOldest.length === 0 && parsedNewest.length === 0) {
      return null;
    }

    const oldest = parsedOldest.sort((a, b) => a.t - b.t)[0]?.v || parsedNewest.sort((a, b) => a.t - b.t)[0]?.v;
    const newest = parsedNewest.sort((a, b) => b.t - a.t)[0]?.v || parsedOldest.sort((a, b) => b.t - a.t)[0]?.v;

    return oldest && newest ? { oldest, newest } : null;
  } catch (error) {
    console.warn('Failed to compute global metadata date range:', error);
    return null;
  }
}