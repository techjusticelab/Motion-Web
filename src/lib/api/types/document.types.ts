// Document-related types and interfaces

export interface Document {
	id: string;
	file_name: string;
	file_path: string;
	file_url?: string;
	s3_uri?: string;
	text: string;
	doc_type: string;
	category?: string;
	hash?: string;
	created_at: string;
	updated_at?: string;
	metadata: DocumentMetadata;
	size?: number;
	content_type?: string;
	// Legacy fields
	title?: string;
	content?: string;
	highlight?: {
		text?: string[];
	};
}

export interface DocumentMetadata {
	// Basic Information
	document_name: string;
	subject: string;
	summary?: string;
	document_type?: DocumentType;
	
	// Case Information
	case?: CaseInfo;
	
	// Court Information
	court?: CourtInfo;
	
	// People & Parties
	parties?: Party[];
	attorneys?: Attorney[];
	judge?: Judge;
	
	// Date Fields
	filing_date?: string;
	event_date?: string;
	hearing_date?: string;
	decision_date?: string;
	served_date?: string;
	timestamp?: string;
	status?: string;
	
	// Document Properties
	language?: string;
	pages?: number;
	word_count?: number;
	
	// Legal Classification
	legal_tags?: string[];
	charges?: Charge[];
	authorities?: Authority[];
	
	// Processing Metadata
	processed_at: string;
	confidence?: number;
	ai_classified: boolean;
	classification_confidence?: number;
	
	// Document Analysis
	sensitive_terms?: string[];
	has_redactions?: boolean;
	redaction_score?: number;
	extraction_method?: string;
	file_type?: string;
	
	// Legacy fields
	case_name?: string;
	case_number?: string;
	author?: string;
}

export interface CaseInfo {
	case_number: string;
	case_name: string;
	case_type?: string;
	chapter?: string;
	docket?: string;
	nature_of_suit?: string;
}

export interface CourtInfo {
	court_id: string;
	court_name: string;
	jurisdiction: string;
	level: string;
	district?: string;
	division?: string;
	county?: string;
}

export interface Party {
	name: string;
	role: string;
	party_type?: string;
	date?: string;
}

export interface Attorney {
	name: string;
	bar_number?: string;
	role: string;
	organization?: string;
	contact_info?: string;
}

export interface Judge {
	name: string;
	title?: string;
	judge_id?: string;
}

export interface Charge {
	statute: string;
	description: string;
	grade?: string;
	class?: string;
	count?: number;
}

export interface Authority {
	citation: string;
	case_title?: string;
	type: string;
	precedent: boolean;
	page?: string;
}

export type DocumentType = 
	| 'motion_to_suppress'
	| 'motion_to_dismiss'
	| 'motion_to_compel'
	| 'motion_in_limine'
	| 'motion_summary_judgment'
	| 'motion_to_strike'
	| 'motion_for_reconsideration'
	| 'motion_to_amend'
	| 'motion_for_continuance'
	| 'order'
	| 'ruling'
	| 'judgment'
	| 'sentence'
	| 'injunction'
	| 'brief'
	| 'complaint'
	| 'answer'
	| 'plea'
	| 'reply'
	| 'docket_entry'
	| 'notice'
	| 'stipulation'
	| 'correspondence'
	| 'transcript'
	| 'evidence'
	| 'other'
	| 'unknown';

export interface DocumentStats {
	total_documents: number;
	document_types: Record<string, number>;
	recent_uploads: number;
	storage_size?: string;
	index_size?: string;
	type_counts?: TypeCount[];
	tag_counts?: TagCount[];
	last_updated?: string;
	field_stats?: Record<string, FieldStat>;
	date_range?: {
		oldest: string;
		newest: string;
	};
}

export interface TypeCount {
	type: string;
	count: number;
}

export interface TagCount {
	tag: string;
	count: number;
}

export interface FieldStat {
	unique_values: number;
	total_values: number;
}

export interface FieldValue {
	value: string;
	count: number;
	last_seen?: string;
}

export interface MetadataField {
	id: string;
	name: string;
	type: string;
}

export interface MetadataFieldValuesResponse {
	field: string;
	total: number;
	values: FieldValue[];
}

export interface LegalTagsResponse {
	document_types: Array<{
		type: string;
		label: string;
		count: number;
		subcategories?: Array<{
			type: string;
			label: string;
			count: number;
		}>;
	}>;
	practice_areas: Array<{
		area: string;
		label: string;
		count: number;
	}>;
}

export interface DocumentTypesResponse {
	types: Array<{
		id: string;
		name: string;
		description: string;
		count: number;
		common_subtypes?: string[];
		typical_length?: string;
		filing_requirements?: string;
	}>;
}

export interface FieldOptionsResponse {
	filterable_fields: Array<{
		field: string;
		type: string;
		values?: string[];
		searchable?: boolean;
		description: string;
	}>;
	sortable_fields: Array<{
		field: string;
		default?: boolean;
		description: string;
	}>;
}

export interface RedactionAnalysis {
	redactions_found: number;
	sensitive_terms: string[];
	confidence_scores: Record<string, number>;
	redaction_areas: Array<{
		page: number;
		x: number;
		y: number;
		width: number;
		height: number;
	}>;
}

export interface ClassificationResult {
	document_type: string;
	legal_category?: string;
	subject?: string;
	summary?: string;
	confidence: number;
	success: boolean;
	error?: string;
	filing_date?: string;
	event_date?: string;
	hearing_date?: string;
	decision_date?: string;
	served_date?: string;
	legal_tags?: string[];
	case_number?: string;
	case_name?: string;
	court?: string;
	judge?: string;
	parties?: Party[];
	attorneys?: Attorney[];
}