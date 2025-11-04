// File size formatting
export function formatFileSize(bytes: number | undefined): string {
	if (!bytes || bytes === 0) return '0 Bytes';
	
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	
	return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// Date formatting
export function formatDate(
	date: string | Date | undefined,
	options?: Intl.DateTimeFormatOptions
): string {
	if (!date) return 'Unknown date';
	
	try {
		const dateObj = typeof date === 'string' ? new Date(date) : date;
		
		const defaultOptions: Intl.DateTimeFormatOptions = {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			...options
		};
		
		return dateObj.toLocaleDateString('en-US', defaultOptions);
	} catch {
		return 'Invalid date';
	}
}

export function formatDateTime(
	date: string | Date | undefined,
	options?: Intl.DateTimeFormatOptions
): string {
	if (!date) return 'Unknown date';
	
	try {
		const dateObj = typeof date === 'string' ? new Date(date) : date;
		
		const defaultOptions: Intl.DateTimeFormatOptions = {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			...options
		};
		
		return dateObj.toLocaleString('en-US', defaultOptions);
	} catch {
		return 'Invalid date';
	}
}

export function formatRelativeTime(date: string | Date): string {
	const dateObj = typeof date === 'string' ? new Date(date) : date;
	const now = new Date();
	const diffMs = now.getTime() - dateObj.getTime();
	const diffSecs = Math.floor(diffMs / 1000);
	const diffMins = Math.floor(diffSecs / 60);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);
	
	if (diffSecs < 60) return 'Just now';
	if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
	if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
	if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
	
	return formatDate(date);
}

// Status color mapping
export function getStatusColor(status?: string): string {
	if (!status) return 'neutral';
	
	const statusLower = status.toLowerCase();
	
	const statusMap: Record<string, string> = {
		'complete': 'green',
		'completed': 'green',
		'success': 'green',
		'active': 'green',
		'processed': 'green',
		'approved': 'green',
		
		'error': 'red',
		'failed': 'red',
		'rejected': 'red',
		'cancelled': 'red',
		'expired': 'red',
		
		'pending': 'yellow',
		'processing': 'yellow',
		'in_progress': 'yellow',
		'review': 'yellow',
		'warning': 'yellow',
		
		'draft': 'gray',
		'archived': 'gray',
		'inactive': 'gray'
	};
	
	for (const [key, color] of Object.entries(statusMap)) {
		if (statusLower.includes(key)) {
			return color;
		}
	}
	
	return 'blue';
}

export function getStatusClasses(status?: string): string {
	const color = getStatusColor(status);
	
	const classMap: Record<string, string> = {
		'green': 'bg-green-100 text-green-800 border-green-200',
		'red': 'bg-red-100 text-red-800 border-red-200',
		'yellow': 'bg-yellow-100 text-yellow-800 border-yellow-200',
		'blue': 'bg-blue-100 text-blue-800 border-blue-200',
		'gray': 'bg-neutral-100 text-neutral-800 border-neutral-200',
		'neutral': 'bg-neutral-100 text-neutral-800 border-neutral-200'
	};
	
	return classMap[color] || classMap['neutral'];
}

// File type detection
export function getFileIcon(type: string): string {
	if (type.includes('pdf')) return 'pdf';
	if (type.includes('word') || type.includes('docx')) return 'word';
	if (type.includes('excel') || type.includes('xlsx')) return 'excel';
	if (type.includes('image')) return 'image';
	if (type.includes('text')) return 'text';
	if (type.includes('video')) return 'video';
	if (type.includes('audio')) return 'audio';
	return 'generic';
}

export function getFileExtension(filename: string): string {
	return filename.split('.').pop()?.toLowerCase() || '';
}

// Number formatting
export function formatNumber(num: number, decimals: number = 0): string {
	return new Intl.NumberFormat('en-US', {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals
	}).format(num);
}

export function formatPercentage(value: number, decimals: number = 1): string {
	return `${(value * 100).toFixed(decimals)}%`;
}

// String utilities
export function truncate(str: string, length: number = 100): string {
	if (str.length <= length) return str;
	return str.substring(0, length) + '...';
}

export function pluralize(count: number, singular: string, plural?: string): string {
	return count === 1 ? singular : (plural || `${singular}s`);
}

export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Validation utilities
export function isValidEmail(email: string): boolean {
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(email);
}

export function isValidUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}