<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { api } from '$lib/api';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import { User, Mail, Shield, Save } from 'lucide-svelte';

	let nombre = $state('');
	let correo = $state('');
	let isEditing = $state(false);
	let loading = $state(false);
	let message = $state('');
	let error = $state('');

	$effect(() => {
		if ($authStore) {
			nombre = $authStore.nombre || '';
			correo = $authStore.correo || '';
		}
	});

	async function handleSave() {
		error = '';
		message = '';
		loading = true;

		try {
			message = 'Información actualizada correctamente';
			isEditing = false;
			
			if ($authStore) {
				authStore.setUser({ ...$authStore, nombre, correo });
			}
		} catch (err: any) {
			error = err.message || 'Error al actualizar información';
		} finally {
			loading = false;
		}
	}

	function handleCancel() {
		nombre = $authStore?.nombre || '';
		correo = $authStore?.correo || '';
		isEditing = false;
		error = '';
		message = '';
	}
</script>

<div class="max-w-2xl mx-auto">
	<Card>
		{#snippet children()}
			<div class="p-6 space-y-6">
				<div class="flex items-center justify-between">
					<h2 class="text-2xl font-bold">Mi Perfil</h2>
					{#if !isEditing}
						<Button onclick={() => (isEditing = true)} variant="outline" size="sm">
							{#snippet children()}
								Editar
							{/snippet}
						</Button>
					{/if}
				</div>

				{#if message}
					<div class="bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 px-4 py-3 rounded">
						{message}
					</div>
				{/if}

				{#if error}
					<div class="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded">
						{error}
					</div>
				{/if}

				<div class="space-y-4">
					<!-- Nombre -->
					<div class="space-y-2">
						<Label>
							{#snippet children()}
								<div class="flex items-center gap-2">
									<User class="h-4 w-4" />
									Nombre
								</div>
							{/snippet}
						</Label>
						{#if isEditing}
							<Input
								type="text"
								bind:value={nombre}
								placeholder="Tu nombre"
								disabled={loading}
							/>
						{:else}
							<p class="text-lg font-medium">{$authStore?.nombre}</p>
						{/if}
					</div>

					<!-- Correo -->
					<div class="space-y-2">
						<Label>
							{#snippet children()}
								<div class="flex items-center gap-2">
									<Mail class="h-4 w-4" />
									Correo electrónico
								</div>
							{/snippet}
						</Label>
						{#if isEditing}
							<Input
								type="email"
								bind:value={correo}
								placeholder="tu@correo.com"
								disabled={loading}
							/>
						{:else}
							<p class="text-lg font-medium">{$authStore?.correo}</p>
						{/if}
					</div>

					<!-- Rol -->
					<div class="space-y-2">
						<Label>
							{#snippet children()}
								<div class="flex items-center gap-2">
									<Shield class="h-4 w-4" />
									Rol
								</div>
							{/snippet}
						</Label>
						<div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {$authStore?.rol === 'administrador' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}">
							{$authStore?.rol === 'administrador' ? 'Administrador' : 'Usuario'}
						</div>
					</div>

					<!-- ID -->
					<div class="space-y-2">
						<Label>
							{#snippet children()}
								ID de usuario
							{/snippet}
						</Label>
						<p class="text-sm text-muted-foreground">#{$authStore?.id}</p>
					</div>
				</div>

				{#if isEditing}
					<div class="flex gap-3 pt-4">
						<Button onclick={handleSave} disabled={loading} class="flex-1">
							{#snippet children()}
								<Save class="h-4 w-4 mr-2" />
								{loading ? 'Guardando...' : 'Guardar cambios'}
							{/snippet}
						</Button>
						<Button onclick={handleCancel} variant="outline" disabled={loading}>
							{#snippet children()}
								Cancelar
							{/snippet}
						</Button>
					</div>
				{/if}
			</div>
		{/snippet}
	</Card>
</div>
