// Storage-related types

export interface StorageDocument {
	path: string;
	name: string;
	size: number;
	modified: string;
	url?: string;
}

export interface StorageStats {
	total_documents: number;
	total_size: number;
	storage_backend: string;
	last_updated: string;
}

export interface FileSearchDocument {
	api_url: string;
	direct_url?: string;
	signed_url?: string;
	path: string;
	filename: string;
	file_type?: string;
	size?: number;
	last_modified?: string;
}

export interface FileSearchPayload {
	documents: FileSearchDocument[];
	exact_match?: boolean;
	limit?: number;
	search_pattern?: string;
	total_found: number;
}