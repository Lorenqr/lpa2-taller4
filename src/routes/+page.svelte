<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import LoginForm from '$lib/components/login-form.svelte';
	import MainApp from '$lib/components/main-app.svelte';

	let isRestoring = $state(true);

	onMount(async () => {
		console.log('Component mounted, starting session restore...');
		
		// Timeout de seguridad
		const timeout = setTimeout(() => {
			console.log('Session restore timeout - forcing complete');
			isRestoring = false;
		}, 5000);
		
		try {
			await authStore.restoreSession();
			console.log('Session restore completed');
		} catch (error) {
			console.error('Error restoring session:', error);
		} finally {
			clearTimeout(timeout);
			isRestoring = false;
			console.log('Restore process finished, isRestoring:', false);
		}
	});
</script>

<!-- Show loading while restoring session -->
{#if isRestoring}
	<div class="flex min-h-screen items-center justify-center">
		<div class="text-center space-y-4">
			<div class="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
			<p class="text-muted-foreground">Cargando...</p>
		</div>
	</div>
{:else if $authStore}
	<MainApp />
{:else}
	<LoginForm />
{/if}
