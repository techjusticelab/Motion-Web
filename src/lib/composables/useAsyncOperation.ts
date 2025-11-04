import { useLoadingStateSvelte5 } from './useLoadingState.svelte';

export interface AsyncOperationOptions {
	onSuccess?: (data: any) => void;
	onError?: (error: Error) => void;
	successMessage?: string;
	errorMessage?: string;
	resetAfter?: number;
}

export function useAsyncOperation<T = any>(options: AsyncOperationOptions = {}) {
	const loadingState = useLoadingStateSvelte5();

	async function execute(
		operation: () => Promise<T>,
		operationOptions?: AsyncOperationOptions
	): Promise<T | null> {
		const opts = { ...options, ...operationOptions };
		
		try {
			loadingState.startLoading();
			const result = await operation();
			
			if (opts.successMessage) {
				loadingState.setSuccess(opts.successMessage);
			} else {
				loadingState.stopLoading();
			}
			
			if (opts.onSuccess) {
				opts.onSuccess(result);
			}

			if (opts.resetAfter) {
				setTimeout(() => loadingState.reset(), opts.resetAfter);
			}
			
			return result;
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error));
			
			if (opts.errorMessage) {
				loadingState.setError(opts.errorMessage);
			} else {
				loadingState.setError(err);
			}
			
			if (opts.onError) {
				opts.onError(err);
			} else {
				console.error('Async operation failed:', err);
			}

			if (opts.resetAfter) {
				setTimeout(() => loadingState.reset(), opts.resetAfter);
			}
			
			return null;
		}
	}

	async function executeWithRetry(
		operation: () => Promise<T>,
		retries: number = 3,
		delay: number = 1000
	): Promise<T | null> {
		let lastError: Error | null = null;
		
		for (let i = 0; i < retries; i++) {
			try {
				if (i === 0) {
					loadingState.startLoading();
				}
				
				const result = await operation();
				loadingState.stopLoading();
				return result;
			} catch (error) {
				lastError = error instanceof Error ? error : new Error(String(error));
				
				if (i < retries - 1) {
					await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
				}
			}
		}
		
		if (lastError) {
			loadingState.setError(lastError);
		}
		
		return null;
	}

	return {
		execute,
		executeWithRetry,
		isLoading: loadingState.isLoading,
		error: loadingState.error,
		successMessage: loadingState.successMessage,
		reset: loadingState.reset
	};
}

// Wrapper for common operations
export function useApiCall<T = any>(
	apiFunction: (...args: any[]) => Promise<T>,
	options?: AsyncOperationOptions
) {
	const operation = useAsyncOperation<T>(options);
	
	async function call(...args: any[]): Promise<T | null> {
		return operation.execute(() => apiFunction(...args));
	}
	
	async function callWithRetry(
		retries: number = 3,
		...args: any[]
	): Promise<T | null> {
		return operation.executeWithRetry(() => apiFunction(...args), retries);
	}
	
	return {
		call,
		callWithRetry,
		isLoading: operation.isLoading,
		error: operation.error,
		successMessage: operation.successMessage,
		reset: operation.reset
	};
}