// Main API exports - organized by functionality

// Configuration and utilities
export { API_URL, getAuthHeaders, handleApiError } from './config';

// Type definitions
export type {
  SearchParams,
  Document,
  SearchResponse,
  MetadataField,
  DocumentStats,
  RedactionAnalysis,
  ApiResponse,
  StorageDocument,
  StorageStats
} from './types';

// Search API
export {
  searchDocuments,
  getDocumentTypes,
  getLegalTags,
  getMetadataFieldValues,
  getAllFieldOptions,
  getDocumentStats,
  getGlobalMetadataDateRange,
  getMetadataFields
} from './search';

// Documents API
export {
  categoriseDocument,
  uploadAndClassifyDocument,
  updateDocumentMetadata,
  getDocumentUrl,
  getDocumentUrlWithSearch,
  searchFilesByName,
  downloadDocument,
  getDocument
} from './documents';

// Redaction API
export {
  analyzeRedactionsOnly,
  createRedactedDocument,
  getDocumentRedactionAnalysis
} from './redaction';


// Storage Management API
export {
  listStorageDocuments,
  listStorageDocuments as getStorageDocuments, // Alias for compatibility
  getStorageDocumentsCount,
  getStorageStats,
  searchStorageDocumentsByName,
  getStorageDocumentUrl,
  downloadStorageDocument,
  checkStorageDocumentExists,
  deleteDocument
} from './storage';

// Legacy client exports have been removed. Use named exports above.
