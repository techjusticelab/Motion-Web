// Search-related types and interfaces

export interface SearchParams {
	query?: string;
	doc_type?: string;
	case_number?: string;
	case_name?: string;
	judge?: string[];
	court?: string[];
	author?: string;
	status?: string;
	legal_tags?: string[];
	legal_tags_match_all?: boolean;
	date_range?: DateRange;
	date_field_type?: 'created_at' | 'filing_date' | 'event_date' | 'hearing_date' | 'decision_date' | 'served_date';
	size?: number;
	from?: number;
	sort_by?: string;
	sort_order?: 'asc' | 'desc';
	include_highlights?: boolean;
	fuzzy_search?: boolean;
	filters?: SearchFilters;
	sort?: SortOptions;
	highlight?: HighlightOptions;
	// Legacy support
	page?: number;
	limit?: number;
	tags?: string[];
	use_fuzzy?: boolean;
}

export interface SearchFilters {
	doc_type?: string[];
	court?: string[];
	judge?: string[];
	author?: string[];
	status?: string[];
	legal_tags?: string[];
	date_range?: DateRange;
	custom_filters?: Record<string, any>;
}

export interface SortOptions {
	field: string;
	order: 'asc' | 'desc';
}

export interface HighlightOptions {
	fields: string[];
}

export interface DateRange {
	from?: string;
	to?: string;
	// Backward-compatible field names
	start?: string;
	end?: string;
}

// Frontend-consumed search response
export interface SearchResponse {
	total: number;
	hits: Document[];
	aggregations?: Record<string, any>;
}

// Backend search result payload
export interface SearchResult {
	total_hits: number;
	max_score?: number;
	documents: SearchDocument[];
	aggregations?: Record<string, any>;
	took_ms: number;
	timed_out: boolean;
}

export interface SearchDocument {
	id: string;
	score?: number;
	document: Record<string, any>;
	highlights?: Record<string, string[]>;
}

import type { Document } from './document.types';