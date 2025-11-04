import { API_URL, handleApiError } from '../config';
import type { SearchParams, SearchResponse, SearchResult, SearchDocument } from '../types';
import { transformSearchParams, transformSearchDocument } from './transformers';

/**
 * Search documents with given parameters
 */
export async function searchDocuments(params: SearchParams, session?: any): Promise<SearchResponse> {
  try {
    console.log('Searching documents with params:', params);
    
    const transformedParams = transformSearchParams(params);
    console.log('Transformed search params:', transformedParams);
    
    const response = await fetch(`${API_URL}/api/v1/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transformedParams)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const raw = await response.json();
    console.log('Raw search response:', raw);

    // Case 1: Standard APIResponse<SearchResult>
    if (raw && raw.success === true && raw.data) {
      const searchResult = raw.data as SearchResult;
      const transformedHits = searchResult.documents.map(transformSearchDocument);
      const transformedResults: SearchResponse = {
        total: Number(searchResult.total_hits),
        hits: transformedHits,
        aggregations: searchResult.aggregations
      };
      console.log('Converted search results (wrapped):', transformedResults);
      return transformedResults;
    }

    // Case 2: Wrapper without success flag but with data.documents
    if (raw && raw.data && Array.isArray(raw.data.documents)) {
      const searchResult = raw.data as unknown as SearchResult;
      const transformedHits = searchResult.documents.map(transformSearchDocument);
      const transformedResults: SearchResponse = {
        total: Number(searchResult.total_hits ?? transformedHits.length),
        hits: transformedHits,
        aggregations: searchResult.aggregations
      };
      console.log('Converted search results (data.documents):', transformedResults);
      return transformedResults;
    }

    // Case 3: Back-compat wrapper with root documents/total
    if (raw && Array.isArray(raw.documents)) {
      const transformedHits = raw.documents.map((d: any) =>
        // When API returns full documents, normalize to expected frontend type
        d.document ? transformSearchDocument(d as SearchDocument) : d
      );
      const transformedResults: SearchResponse = {
        total: Number(raw.total || transformedHits.length),
        hits: transformedHits,
        aggregations: raw.aggregations
      };
      console.log('Converted search results (root documents):', transformedResults);
      return transformedResults;
    }

    // Case 4: Unwrapped SearchResult directly
    if (raw && typeof raw.total_hits !== 'undefined' && Array.isArray(raw.documents)) {
      const searchResult = raw as SearchResult;
      const transformedHits = searchResult.documents.map(transformSearchDocument);
      const transformedResults: SearchResponse = {
        total: Number(searchResult.total_hits),
        hits: transformedHits,
        aggregations: searchResult.aggregations
      };
      console.log('Converted search results (unwrapped):', transformedResults);
      return transformedResults;
    }

    console.error('Invalid search response format:', raw);
    throw new Error('Search request failed - response missing expected fields');
  } catch (error) {
    console.error('Error searching documents:', error);
    return handleApiError(error, 'search documents');
  }
}