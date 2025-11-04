<script lang="ts">
	import { Button, LoadingSpinner } from '$lib/components/ui';
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { createEventDispatcher } from 'svelte';
	import { isValidEmail } from '$lib/utils/formatting';

	interface Props {
		type: 'login' | 'register' | 'forgot' | 'reset';
		loading?: boolean;
		error?: string | null;
		successMessage?: string | null;
		title?: string;
		subtitle?: string;
		submitText?: string;
		showRememberMe?: boolean;
		showForgotPassword?: boolean;
		class?: string;
	}

	let {
		type = 'login',
		loading = false,
		error = null,
		successMessage = null,
		title,
		subtitle,
		submitText,
		showRememberMe = false,
		showForgotPassword = false,
		class: className = ''
	}: Props = $props();

	const dispatch = createEventDispatcher<{
		submit: {
			email: string;
			password?: string;
			confirmPassword?: string;
			rememberMe?: boolean;
			token?: string;
		};
		forgotPassword: void;
		switchMode: 'login' | 'register';
	}>();

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let rememberMe = $state(false);
	let token = $state('');
	let validationError = $state('');

	// Default titles and texts based on type
	const defaultTitles = {
		login: 'Welcome back',
		register: 'Create your account',
		forgot: 'Reset your password',
		reset: 'Set new password'
	};

	const defaultSubtitles = {
		login: 'Sign in to access your documents',
		register: 'Get started with Motion-Index',
		forgot: "We'll send you a reset link",
		reset: 'Choose a new secure password'
	};

	const defaultSubmitTexts = {
		login: 'Sign In',
		register: 'Create Account',
		forgot: 'Send Reset Link',
		reset: 'Update Password'
	};

	$: displayTitle = title || defaultTitles[type];
	$: displaySubtitle = subtitle || defaultSubtitles[type];
	$: displaySubmitText = submitText || defaultSubmitTexts[type];

	function validate(): boolean {
		validationError = '';

		if (!email || !isValidEmail(email)) {
			validationError = 'Please enter a valid email address';
			return false;
		}

		if (type === 'forgot') {
			return true;
		}

		if (type === 'reset') {
			if (!token) {
				validationError = 'Reset token is required';
				return false;
			}
		}

		if (!password || password.length < 6) {
			validationError = 'Password must be at least 6 characters';
			return false;
		}

		if (type === 'register' || type === 'reset') {
			if (password !== confirmPassword) {
				validationError = "Passwords don't match";
				return false;
			}
		}

		return true;
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		
		if (!validate()) {
			return;
		}

		const data: any = { email };
		
		if (type !== 'forgot') {
			data.password = password;
		}
		
		if (type === 'register' || type === 'reset') {
			data.confirmPassword = confirmPassword;
		}
		
		if (type === 'login' && showRememberMe) {
			data.rememberMe = rememberMe;
		}
		
		if (type === 'reset') {
			data.token = token;
		}

		dispatch('submit', data);
	}

	function switchToMode(mode: 'login' | 'register') {
		validationError = '';
		dispatch('switchMode', mode);
	}
</script>

<div class="auth-form {className}" in:fly={{ y: 20, duration: 600, easing: cubicOut }}>
	<div class="text-center mb-8">
		<h1 class="text-3xl font-bold text-neutral-900 mb-2">
			{displayTitle}
		</h1>
		<p class="text-neutral-600">
			{displaySubtitle}
		</p>
	</div>

	{#if successMessage}
		<div 
			class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"
			in:fade={{ duration: 300 }}
		>
			{successMessage}
		</div>
	{/if}

	{#if error || validationError}
		<div 
			class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
			in:fade={{ duration: 300 }}
		>
			{error || validationError}
		</div>
	{/if}

	<form on:submit={handleSubmit} class="space-y-4">
		{#if type === 'reset'}
			<div>
				<label for="token" class="block text-sm font-medium text-neutral-700 mb-1">
					Reset Token
				</label>
				<input
					id="token"
					type="text"
					bind:value={token}
					required
					disabled={loading}
					class="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
					placeholder="Enter the token from your email"
				/>
			</div>
		{/if}

		<div>
			<label for="email" class="block text-sm font-medium text-neutral-700 mb-1">
				Email Address
			</label>
			<input
				id="email"
				type="email"
				bind:value={email}
				required
				disabled={loading || type === 'reset'}
				class="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
				placeholder="you@example.com"
			/>
		</div>

		{#if type !== 'forgot'}
			<div>
				<label for="password" class="block text-sm font-medium text-neutral-700 mb-1">
					Password
				</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					required
					disabled={loading}
					class="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
					placeholder={type === 'login' ? '••••••••' : 'At least 6 characters'}
				/>
			</div>
		{/if}

		{#if type === 'register' || type === 'reset'}
			<div in:slide={{ duration: 300 }}>
				<label for="confirmPassword" class="block text-sm font-medium text-neutral-700 mb-1">
					Confirm Password
				</label>
				<input
					id="confirmPassword"
					type="password"
					bind:value={confirmPassword}
					required
					disabled={loading}
					class="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
					placeholder="••••••••"
				/>
			</div>
		{/if}

		{#if type === 'login' && (showRememberMe || showForgotPassword)}
			<div class="flex items-center justify-between">
				{#if showRememberMe}
					<div class="flex items-center">
						<input
							id="remember"
							type="checkbox"
							bind:checked={rememberMe}
							disabled={loading}
							class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
						/>
						<label for="remember" class="ml-2 block text-sm text-neutral-700">
							Remember me
						</label>
					</div>
				{/if}

				{#if showForgotPassword}
					<button
						type="button"
						on:click={() => dispatch('forgotPassword')}
						disabled={loading}
						class="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
					>
						Forgot password?
					</button>
				{/if}
			</div>
		{/if}

		<Button
			type="submit"
			disabled={loading}
			loading={loading}
			class="w-full"
			size="lg"
		>
			{#if loading}
				Processing...
			{:else}
				{displaySubmitText}
			{/if}
		</Button>
	</form>

	{#if type === 'login' || type === 'register'}
		<div class="mt-6 text-center">
			<p class="text-sm text-neutral-600">
				{type === 'login' ? "Don't have an account?" : 'Already have an account?'}
				<button
					type="button"
					on:click={() => switchToMode(type === 'login' ? 'register' : 'login')}
					disabled={loading}
					class="font-medium text-primary-600 hover:text-primary-700 ml-1 disabled:opacity-50"
				>
					{type === 'login' ? 'Sign up' : 'Sign in'}
				</button>
			</p>
		</div>
	{/if}

	{#if type === 'forgot'}
		<div class="mt-6 text-center">
			<button
				type="button"
				on:click={() => switchToMode('login')}
				disabled={loading}
				class="text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
			>
				← Back to sign in
			</button>
		</div>
	{/if}
</div>

<style>
	.auth-form {
		width: 100%;
		max-width: 24rem;
		margin: 0 auto;
	}
</style>