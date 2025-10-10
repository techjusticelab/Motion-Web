import { API_URL, getAuthHeaders, handleApiError } from './config';
import type {
  SearchParams,
  SearchResponse,
  SearchResult,
  SearchDocument,
  MetadataField,
  DocumentStats,
  ApiResponse,
  LegalTagsResponse,
  DocumentTypesResponse,
  FieldOptionsResponse,
  MetadataFieldValuesResponse
} from './types';
import type { Document } from './types';

/**
 * Transform UI search params into backend SearchRequest
 */
function transformSearchParams(params: SearchParams): any {
  const transformed: any = {
    query: params.query,
    doc_type: params.doc_type,
    case_number: params.case_number,
    case_name: params.case_name,
    judge: params.judge,
    court: params.court,
    author: params.author,
    status: params.status,
    legal_tags: params.legal_tags || params.tags, // Support legacy tags
    legal_tags_match_all: params.legal_tags_match_all || false,
    date_range: params.date_range,
    size: params.size || params.limit || 20,
    from: params.from || ((params.page ? params.page - 1 : 0) * (params.size || params.limit || 20)),
    sort_by: params.sort_by || 'relevance',
    sort_order: params.sort_order || 'desc',
    include_highlights: params.include_highlights !== false,
    fuzzy_search: params.fuzzy_search || params.use_fuzzy || false
  };

  // Pass chosen date field for the date_range via filters.date_field (backend-agnostic)
  if (params.date_field_type) {
    const df = params.date_field_type === 'created_at'
      ? 'created_at'
      : `metadata.${params.date_field_type}`; // e.g., metadata.filing_date
    transformed.filters = { ...(params.filters || {}), date_field: df };
  }

  // Remove undefined values
  Object.keys(transformed).forEach(key => {
    if (transformed[key] === undefined) {
      delete transformed[key];
    }
  });

  return transformed;
}

/**
 * Transform backend search document to frontend document format
 */
function transformSearchDocument(searchDoc: SearchDocument): any {
  const document = searchDoc.document;
  
  // Handle nested metadata structure properly
  let transformedDoc = {
    id: searchDoc.id,
    score: searchDoc.score,
    file_name: document.file_name,
    file_path: document.file_path,
    file_url: document.file_url,
    s3_uri: document.s3_uri,
    text: document.text,
    doc_type: document.doc_type,
    category: document.category,
    hash: document.hash,
    created_at: document.created_at,
    updated_at: document.updated_at,
    size: document.size,
    content_type: document.content_type,
    metadata: document.metadata,
    highlight: searchDoc.highlights ? { text: Object.values(searchDoc.highlights).flat() } : undefined
  };

  // Handle legacy flat structure for backward compatibility
  if (!document.metadata && document.document_name) {
    transformedDoc.metadata = {
      document_name: document.document_name,
      subject: document.subject || '',
      summary: document.summary,
      status: document.status,
      timestamp: document.timestamp,
      case_name: document.case_name,
      case_number: document.case_number,
      author: document.author,
      judge: document.judge,
      legal_tags: document.legal_tags,
      court: document.court,
      ai_classified: document.ai_classified || false,
      authorities: document.authorities,
      confidence: document.confidence,
      language: document.language,
      processed_at: document.processed_at || new Date().toISOString(),
      word_count: document.word_count,
      page_count: document.page_count || document.pages,
      file_type: document.file_type,
      classification_confidence: document.classification_confidence,
      extraction_method: document.extraction_method,
      redaction_score: document.redaction_score,
      has_redactions: document.has_redactions,
      sensitive_terms: document.sensitive_terms
    };
  }

  return transformedDoc;
}

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

  try {
    const oldestPromises = dateFields.map((field) =>
      searchDocuments({ size: 5, sort_by: field, sort_order: 'asc', include_highlights: false } as any)
        .then((res) => {
          const hit = res.hits.find((h: any) => extract(h, field));
          return hit ? extract(hit as any, field) : null;
        })
        .catch(() => null)
    );

    const newestPromises = dateFields.map((field) =>
      searchDocuments({ size: 5, sort_by: field, sort_order: 'desc', include_highlights: false } as any)
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

/**
 * Get document type statistics
 */
export async function getDocumentTypes(): Promise<Record<string, number>> {
  try {
    console.log('Fetching document types from:', `${API_URL}/api/v1/document-types`);
    
    const response = await fetch(`${API_URL}/api/v1/document-types`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const apiResponse = await response.json();
    console.log('Raw document types response:', apiResponse);
    
    // Expected format: may be {status: 'success', data: [...]}
    if (apiResponse.status === 'success' && apiResponse.data) {
      const docTypesArray = apiResponse.data;
      const docTypesMap: Record<string, number> = {};
      
      // Convert array format to object format
      docTypesArray.forEach((item: any) => {
        docTypesMap[item.type] = item.count;
      });
      
      console.log('Converted document types:', docTypesMap);
      return docTypesMap;
    } else {
      throw new Error('Failed to get document types - invalid response format');
    }
  } catch (error) {
    console.error('Error fetching document types:', error);
    return handleApiError(error, 'get document types');
  }
}

/**
 * Get available legal tags
 */
export async function getLegalTags(session?: any): Promise<string[]> {
  try {
    console.log('Fetching legal tags from:', `${API_URL}/api/v1/legal-tags`);
    
    const response = await fetch(`${API_URL}/api/v1/legal-tags`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const apiResponse = await response.json();
    console.log('Raw legal tags response:', apiResponse);
    
    // Handle the actual API response format: {data: [...], status: "success"}
    if (apiResponse.status === 'success' && apiResponse.data) {
      // Extract tags from the array
      const tags: string[] = apiResponse.data.map((item: any) => item.tag);
      
      console.log('Converted legal tags:', tags);
      return tags;
    } else {
      throw new Error('Failed to get legal tags - invalid response format');
    }
  } catch (error) {
    console.error('Error fetching legal tags:', error);
    return handleApiError(error, 'get legal tags');
  }
}

/**
 * Get metadata field values with optional prefix filtering
 */
export async function getMetadataFieldValues(
  field: string, 
  prefix?: string, 
  size: number = 20, 
  session?: any
): Promise<string[]> {
  try {
    const params = new URLSearchParams({ 
      search: prefix || '',
      limit: size.toString()
    });
    
    const url = `${API_URL}/api/v1/metadata-fields/${field}?${params}`;
    console.log('Fetching metadata field values from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const apiResponse = await response.json();
    console.log('Raw metadata field values response:', apiResponse);
    
    if (apiResponse.data) {
      const values = apiResponse.data.values.map(item => item.value);
      console.log('Converted metadata field values:', values);
      return values;
    } else {
      console.error('Invalid metadata field values response format:', apiResponse);
      throw new Error('Failed to get metadata field values - response missing data field');
    }
  } catch (error) {
    console.error('Error fetching metadata field values:', error);
    return handleApiError(error, 'get metadata field values');
  }
}

/**
 * Get all field options for search filters
 */
export async function getAllFieldOptions(session?: any): Promise<Record<string, string[]>> {
  try {
    console.log('Fetching field options from:', `${API_URL}/api/v1/field-options`);
    
    const response = await fetch(`${API_URL}/api/v1/field-options`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const apiResponse = await response.json();
    console.log('Raw field options response:', apiResponse);
    
    // Handle the actual API response format: {data: {...}} (no success wrapper)
    const data = apiResponse.data ?? apiResponse; // accept wrapped or raw
    if (data) {
      const fieldOptions: Record<string, string[]> = {};
      
      // Convert the structured response to simple string arrays
      if (data.doc_types) {
        fieldOptions['doc_type'] = data.doc_types.map((item: any) => item.value);
      }
      if (data.legal_tags) {
        fieldOptions['legal_tags'] = data.legal_tags.map((item: any) => item.value);
      }
      if (data.courts) {
        fieldOptions['court'] = data.courts.map((item: any) => item.value);
      }
      if (data.judges) {
        fieldOptions['judge'] = data.judges.map((item: any) => item.value);
      }
      if (data.statuses) {
        fieldOptions['status'] = data.statuses.map((item: any) => item.value);
      }
      if (data.authors) {
        fieldOptions['author'] = data.authors.map((item: any) => item.value);
      }
      
      console.log('Converted field options:', fieldOptions);
      return fieldOptions;
    } else {
      console.error('Invalid field options response format:', apiResponse);
      throw new Error('Failed to get field options - response missing data field');
    }
  } catch (error) {
    console.error('Error fetching field options:', error);
    return handleApiError(error, 'get field options');
  }
}

/**
 * Get document statistics
 */
export async function getDocumentStats(session?: any): Promise<DocumentStats> {
  try {
    console.log('Fetching document stats from:', `${API_URL}/api/v1/document-stats`);
    const response = await fetch(`${API_URL}/api/v1/document-stats`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const raw = await response.json();
    console.log('Raw document stats response:', raw);
    const data = raw?.data ?? raw; // accept APIResponse<T> or raw T
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid document stats payload');
    }

    const stats: DocumentStats = {
      total_documents: Number(data.total_documents ?? 0),
      document_types: {},
      recent_uploads: 0,
      storage_size: data.index_size ?? data.total_size,
      index_size: data.index_size,
      type_counts: data.type_counts,
      tag_counts: data.tag_counts,
      last_updated: data.last_updated,
      field_stats: data.field_stats
    };

    if (Array.isArray(data.type_counts)) {
      data.type_counts.forEach((tc: any) => {
        if (tc?.type) stats.document_types[tc.type] = Number(tc.count || 0);
      });
    }

    console.log('Converted document stats:', stats);
    return stats;
  } catch (error) {
    console.error('Error fetching document stats:', error);
    return handleApiError(error, 'get document statistics');
  }
}

/**
 * Get available metadata fields
 */
export async function getMetadataFields(session?: any): Promise<{ fields: MetadataField[] }> {
  try {
    console.log('Fetching metadata fields from:', `${API_URL}/api/v1/metadata-fields`);
    
    const response = await fetch(`${API_URL}/api/v1/metadata-fields`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const apiResponse = await response.json();
    console.log('Raw metadata fields response:', apiResponse);
    
    // Handle the actual API response format: {data: {...}} (no success wrapper)
    if (apiResponse.data) {
      const fields = apiResponse.data.fields || [];
      console.log('Converted metadata fields:', fields);
      return { fields };
    } else {
      console.error('Invalid metadata fields response format:', apiResponse);
      throw new Error('Failed to get metadata fields - response missing data field');
    }
  } catch (error) {
    console.error('Error fetching metadata fields:', error);
    return handleApiError(error, 'get metadata fields');
  }
}
