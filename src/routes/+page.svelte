<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import LoginForm from '$lib/components/login-form.svelte';
	import MainApp from '$lib/components/main-app.svelte';

	let usuario = $state<any>(null);
	let isRestoring = $state(true);
	
	authStore.subscribe((u) => (usuario = u));

	onMount(async () => {
		await authStore.restoreSession();
		isRestoring = false;
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
{:else if usuario}
	<MainApp />
{:else}
	<LoginForm />
{/if}
