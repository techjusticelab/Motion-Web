import { writable, derived, type Readable, type Writable } from 'svelte/store';

export interface LoadingState {
	isLoading: boolean;
	error: string | null;
	successMessage: string | null;
}

export interface LoadingStateActions {
	startLoading: () => void;
	stopLoading: () => void;
	setError: (error: string | Error | null) => void;
	setSuccess: (message: string | null) => void;
	reset: () => void;
}

export function useLoadingState(initialState: Partial<LoadingState> = {}) {
	const state = writable<LoadingState>({
		isLoading: false,
		error: null,
		successMessage: null,
		...initialState
	});

	const actions: LoadingStateActions = {
		startLoading: () => {
			state.update(s => ({
				...s,
				isLoading: true,
				error: null,
				successMessage: null
			}));
		},

		stopLoading: () => {
			state.update(s => ({
				...s,
				isLoading: false
			}));
		},

		setError: (error: string | Error | null) => {
			const errorMessage = error instanceof Error ? error.message : error;
			state.update(s => ({
				...s,
				isLoading: false,
				error: errorMessage,
				successMessage: null
			}));
		},

		setSuccess: (message: string | null) => {
			state.update(s => ({
				...s,
				isLoading: false,
				error: null,
				successMessage: message
			}));
		},

		reset: () => {
			state.set({
				isLoading: false,
				error: null,
				successMessage: null
			});
		}
	};

	return {
		...actions,
		subscribe: state.subscribe,
		set: state.set,
		update: state.update
	};
}

// Svelte 5 version with runes
export function useLoadingStateSvelte5() {
	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let successMessage = $state<string | null>(null);

	function startLoading() {
		isLoading = true;
		error = null;
		successMessage = null;
	}

	function stopLoading() {
		isLoading = false;
	}

	function setError(err: string | Error | null) {
		const errorMessage = err instanceof Error ? err.message : err;
		isLoading = false;
		error = errorMessage;
		successMessage = null;
	}

	function setSuccess(message: string | null) {
		isLoading = false;
		error = null;
		successMessage = message;
	}

	function reset() {
		isLoading = false;
		error = null;
		successMessage = null;
	}

	return {
		get isLoading() { return isLoading; },
		get error() { return error; },
		get successMessage() { return successMessage; },
		startLoading,
		stopLoading,
		setError,
		setSuccess,
		reset
	};
}