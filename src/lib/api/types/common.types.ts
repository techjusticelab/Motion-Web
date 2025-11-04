// Common API types

export interface ApiResponse<T = any> {
	success: boolean;
	message?: string;
	data?: T;
	error?: ApiError;
	request_id?: string;
	timestamp: string;
}

export interface ApiError {
	code: string;
	message: string;
	details?: Record<string, any>;
	field?: string;
}