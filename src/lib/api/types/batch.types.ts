// Batch processing types

import type { ClassificationResult } from './document.types';

export interface BatchJob {
	id: string;
	type: string;
	status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
	progress: BatchProgress;
	results?: BatchResult[];
	error?: string;
	created_at: string;
	updated_at: string;
	completed_at?: string;
	options: Record<string, any>;
}

export interface BatchProgress {
	total_documents: number;
	processed_count: number;
	success_count: number;
	error_count: number;
	skipped_count: number;
	indexed_count: number;
	index_error_count: number;
	percent_complete: number;
	estimated_duration?: string;
	// Simplified aliases
	total?: number;
	processed?: number;
}

export interface BatchResult {
	document_id: string;
	document_path: string;
	status: 'success' | 'error' | 'skipped';
	classification_result?: ClassificationResult;
	error?: string;
	indexed: boolean;
	index_error?: string;
	index_id?: string;
	processed_at: string;
}

export interface BatchClassifyRequest {
	documents: BatchDocumentInput[];
	options?: Record<string, any>;
}

export interface BatchDocumentInput {
	document_id: string;
	document_path?: string;
	text?: string;
}