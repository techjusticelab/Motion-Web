import { API_URL, handleApiError } from '../config';
import type { DocumentStats } from '../types';

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