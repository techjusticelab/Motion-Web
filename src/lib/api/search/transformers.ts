import type { SearchParams, SearchDocument, Document } from '../types';

/**
 * Transform UI search params into backend SearchRequest
 */
export function transformSearchParams(params: SearchParams): any {
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
export function transformSearchDocument(searchDoc: SearchDocument): any {
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