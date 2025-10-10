import { API_URL, getAuthHeaders, handleApiError } from './config';
import type { Document, ApiResponse, FileSearchDocument, FileSearchPayload } from './types';

/**
 * Upload and categorize a document
 */
export async function categoriseDocument(file: File, session?: any): Promise<any> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const authHeaders = await getAuthHeaders(session);
    
    const response = await fetch(`${API_URL}/api/v1/categorise`, {
      method: 'POST',
      headers: {
        ...authHeaders
        // Don't set Content-Type for FormData - let browser set it with boundary
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const apiResponse = await response.json();
    console.log("Categorise response:", apiResponse);
    if (apiResponse.success === true && apiResponse.data) {
      return apiResponse.data;
    } else {
      throw new Error('Document categorization failed - invalid response format');
    }
  } catch (error) {
    return handleApiError(error, 'categorize document');
  }
}

/**
 * Update document metadata
 */
export async function updateDocumentMetadata(
  documentId: string, 
  metadata: any, 
  session?: any
): Promise<Document> {
  try {
    const authHeaders = await getAuthHeaders(session);
    const response = await fetch(`${API_URL}/api/v1/update-metadata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({
        document_id: documentId,
        metadata
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const apiResponse = await response.json();
    console.log("Metadata update response:", apiResponse);
    if (apiResponse.success === true && apiResponse.data) {
      return apiResponse.data;
    } else {
      throw new Error('Metadata update failed - invalid response format');
    }
  } catch (error) {
    return handleApiError(error, 'update document metadata');
  }
}

/**
 * Get document URL for viewing/downloading using new file serving endpoints
 */
export function getDocumentUrl(document: Document): string | null {
  if (!document) {
    console.warn('No document provided to getDocumentUrl');
    return null;
  }

  // Prefer API endpoint when possible; fall back to raw URLs last

  // Prefer new file serving endpoint with whatever identifier we have.
  // Backend recovers the correct Spaces key under documents/…
  if (document.file_path) {
    let cleanIdOrPath = document.file_path.startsWith('/')
      ? document.file_path.substring(1)
      : document.file_path;
    const fileUrl = `${API_URL}/api/v1/files/${cleanIdOrPath}`;
    console.log('Using /api/v1/files with file_path/id:', fileUrl);
    return fileUrl;
  }

  // For local development, use the file_url if available and valid
  if (document.file_url && document.file_url.startsWith('http')) {
    console.log('Using direct file URL:', document.file_url);
    return document.file_url;
  }

  // If only filename is available, we must search to resolve the path
  if (document.file_name) {
    console.log('File path not available; search required for file_name:', document.file_name);
    return null;
  }

  // Try using document ID if available
  if (document.id) {
    const idUrl = `${API_URL}/api/v1/files/${encodeURIComponent(document.id)}`;
    console.log('Using /api/v1/files with id:', idUrl);
    return idUrl;
  }

  // Fallback to S3 URI if available (for backward compatibility)
  if (document.s3_uri) {
    console.log('Using S3 URI:', document.s3_uri);
    return document.s3_uri;
  }

  console.warn('No valid URL found for document:', document);
  return null;
}

/**
 * Search for files by name using the new file search endpoint
 */
export async function searchFilesByName(fileName: string, session?: any): Promise<FileSearchDocument[]> {
  try {
    const authHeaders = await getAuthHeaders(session);
    const response = await fetch(`${API_URL}/api/v1/files/search?name=${encodeURIComponent(fileName)}`, {
      headers: authHeaders
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const apiResponse: ApiResponse<FileSearchPayload> = await response.json();
    console.log('File search response:', apiResponse);
    if (apiResponse.success === true && apiResponse.data && Array.isArray(apiResponse.data.documents)) {
      return apiResponse.data.documents;
    }
    return [];
  } catch (error) {
    console.error('Error searching files by name:', error);
    return [];
  }
}

/**
 * Get document URL with fallback to file search if needed
 */
export async function getDocumentUrlWithSearch(document: Document, session?: any): Promise<string | null> {
  // Per backend guidance: prefer searching by document name, then use returned api_url
  if (document.file_name) {
    console.log('Searching for file by name:', document.file_name);
    const results = await searchFilesByName(document.file_name, session);
    if (results.length > 0) {
      const exact = results.find(r => r.filename?.toLowerCase() === document.file_name!.toLowerCase()) || results[0];
      if (exact.api_url) {
        const resolved = exact.api_url.startsWith('/') ? `${API_URL}${exact.api_url}` : exact.api_url;
        console.log('Using api_url from search:', resolved);
        return resolved;
      }
      if (exact.path) {
        const constructed = `${API_URL}/api/v1/files/${exact.path.startsWith('/') ? exact.path.substring(1) : exact.path}`;
        console.log('Using constructed URL from path:', constructed);
        return constructed;
      }
      if (exact.signed_url || exact.direct_url) {
        const alt = exact.signed_url || exact.direct_url!;
        console.log('Using fallback signed/direct URL:', alt);
        return alt;
      }
    }
  }

  // Fallback: attempt to build via id/file_path
  const direct = getDocumentUrl(document);
  return direct || null;
}

/**
 * Download document as blob
 */
export async function downloadDocument(document: Document, session?: any): Promise<Blob> {
  const url = getDocumentUrl(document) || (await getDocumentUrlWithSearch(document, session));
  if (!url) {
    throw new Error('No valid URL found for document');
  }

  try {
    const authHeaders = await getAuthHeaders(session);
    const response = await fetch(url, {
      headers: authHeaders
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    return handleApiError(error, 'download document');
  }
}

/**
 * Get document by ID
 */
export async function getDocument(documentId: string, session?: any): Promise<Document> {
  try {
    const authHeaders = await getAuthHeaders(session);
    const response = await fetch(`${API_URL}/api/v1/documents/${documentId}`, {
      headers: authHeaders
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const apiResponse = await response.json();
    if (apiResponse.success === true && apiResponse.data) {
      return apiResponse.data;
    } else {
      throw new Error('Failed to get document - invalid response format');
    }
  } catch (error) {
    return handleApiError(error, 'get document');
  }
}
