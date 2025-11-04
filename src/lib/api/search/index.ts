// Search API module exports

// Core search functionality
export { searchDocuments } from './search-core';

// Data transformers
export { transformSearchParams, transformSearchDocument } from './transformers';

// Date range operations
export { getGlobalMetadataDateRange } from './date-ranges';

// Metadata operations
export { 
  getLegalTags, 
  getMetadataFieldValues, 
  getAllFieldOptions, 
  getMetadataFields 
} from './metadata';

// Statistics and aggregations
export { getDocumentTypes, getDocumentStats } from './statistics';