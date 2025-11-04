export interface ModalState<T = any> {
	isOpen: boolean;
	data?: T;
}

export function useModal<T = any>(initialData?: T) {
	let isOpen = $state(false);
	let data = $state<T | undefined>(initialData);
	let onConfirmCallback: ((data?: T) => void) | null = null;
	let onCancelCallback: (() => void) | null = null;

	function open(modalData?: T) {
		data = modalData;
		isOpen = true;
	}

	function close() {
		isOpen = false;
		onConfirmCallback = null;
		onCancelCallback = null;
	}

	function confirm() {
		if (onConfirmCallback) {
			onConfirmCallback(data);
		}
		close();
	}

	function cancel() {
		if (onCancelCallback) {
			onCancelCallback();
		}
		close();
	}

	function onConfirm(callback: (data?: T) => void) {
		onConfirmCallback = callback;
		return {
			onCancel: (cancelCallback: () => void) => {
				onCancelCallback = cancelCallback;
			}
		};
	}

	function toggle() {
		isOpen = !isOpen;
	}

	function setData(newData: T) {
		data = newData;
	}

	return {
		get isOpen() { return isOpen; },
		get data() { return data; },
		open,
		close,
		confirm,
		cancel,
		toggle,
		setData,
		onConfirm
	};
}

// Multiple modals manager
export function useModals<T extends Record<string, any> = Record<string, any>>() {
	const modals = new Map<string, ReturnType<typeof useModal>>();
	
	function getModal(name: string) {
		if (!modals.has(name)) {
			modals.set(name, useModal());
		}
		return modals.get(name)!;
	}
	
	function openModal(name: string, data?: any) {
		getModal(name).open(data);
	}
	
	function closeModal(name: string) {
		getModal(name).close();
	}
	
	function closeAll() {
		modals.forEach(modal => modal.close());
	}
	
	function isOpen(name: string) {
		return getModal(name).isOpen;
	}
	
	return {
		getModal,
		openModal,
		closeModal,
		closeAll,
		isOpen
	};
}