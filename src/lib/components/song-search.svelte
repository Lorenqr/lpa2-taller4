<script lang="ts">
	import { api, type Cancion } from '$lib/api';
	import { authStore } from '$lib/stores/auth';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import SongDetailModal from '$lib/components/song-detail-modal.svelte';
	import { Search, Heart, Clock, Calendar, Play } from 'lucide-svelte';
	

	let searchTitulo = $state('');
	let searchArtista = $state('');
	let searchGenero = $state('');
	let canciones = $state<Cancion[]>([]);
	let favoritos = $state<Cancion[]>([]);
	let isLoading = $state(false);
	let error = $state('');
	let selectedSong = $state<Cancion | null>(null);

	let usuario = $derived($authStore);

	$effect(() => {
		if (usuario) {
			loadFavoritos();
			handleSearch();
		}
	});

	async function loadFavoritos() {
		if (!usuario) return;
		try {
			favoritos = await api.getFavoritosUsuario(usuario.id);
		} catch (err) {
			console.error('[v0] Error loading favorites:', err);
		}
	}

	async function handleSearch() {
		error = '';
		isLoading = true;

		try {
			if (!searchTitulo && !searchArtista && !searchGenero) {
				canciones = await api.getCanciones(0, 50);
			} else {
				canciones = await api.buscarCanciones(
					searchTitulo || undefined,
					searchArtista || undefined,
					searchGenero || undefined
				);
			}
		} catch (err: any) {
			error = err.message || 'Error al buscar canciones';
		} finally {
			isLoading = false;
		}
	}

	function handleKeyPress(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleSearch();
		}
	}

	async function toggleFavorito(cancion: Cancion) {
		if (!usuario) return;

		const esFavorito = favoritos.some((f) => f.id === cancion.id);

		try {
			if (esFavorito) {
				await api.quitarFavorito(usuario.id, cancion.id);
			} else {
				await api.marcarFavorito(usuario.id, cancion.id);
			}
			await loadFavoritos();
		} catch (err) {
			console.error('[v0] Error toggling favorite:', err);
		}
	}

	function formatDuration(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	function openSongDetails(cancion: Cancion) {
		selectedSong = cancion;
	}
</script>

<div class="space-y-6">
	<Card>
		{#snippet children()}
			<div class="p-6 space-y-4">
				<div class="flex items-center gap-2 mb-4">
					<Search class="h-5 w-5 text-primary" />
					<h2 class="text-xl font-semibold">Buscar Canciones</h2>
				</div>

				<!-- Fixed inputs to only search on button click or Enter key -->
				<div class="grid gap-4 md:grid-cols-3">
					<Input
						placeholder="Título..."
						bind:value={searchTitulo}
						disabled={isLoading}
						onkeypress={handleKeyPress}
					/>
					<Input
						placeholder="Artista..."
						bind:value={searchArtista}
						disabled={isLoading}
						onkeypress={handleKeyPress}
					/>
					<Input
						placeholder="Género..."
						bind:value={searchGenero}
						disabled={isLoading}
						onkeypress={handleKeyPress}
					/>
				</div>

				<Button onclick={handleSearch} disabled={isLoading} class="w-full">
					{#snippet children()}
						{#if isLoading}
							<span class="flex items-center gap-2">
								<span class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
								Buscando...
							</span>
						{:else}
							<Search class="h-4 w-4 mr-2" />
							Buscar
						{/if}
					{/snippet}
				</Button>

				{#if error}
					<div class="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
						{error}
					</div>
				{/if}
			</div>
		{/snippet}
	</Card>

	<div class="space-y-4">
		<h3 class="text-lg font-semibold">
			{canciones.length > 0 ? `${canciones.length} canciones encontradas` : 'No hay resultados'}
		</h3>

		<div class="grid gap-4">
			{#each canciones as cancion (cancion.id)}
				{@const esFavorito = favoritos.some((f) => f.id === cancion.id)}
				<Card>
					{#snippet children()}
						<div class="p-4 hover:bg-secondary/50 transition-colors">
							<div class="flex items-start justify-between gap-4">
								<button 
									onclick={() => openSongDetails(cancion)}
									class="flex-1 space-y-2 text-left hover:opacity-80 transition-opacity"
								>
									<div>
										<h4 class="font-semibold text-lg">{cancion.titulo}</h4>
										<p class="text-muted-foreground">{cancion.artista}</p>
									</div>
									
									<div class="flex flex-wrap gap-4 text-sm text-muted-foreground">
										{#if cancion.album}
											<span class="flex items-center gap-1">
												<span class="font-medium">Álbum:</span> {cancion.album}
											</span>
										{/if}
										{#if cancion.genero}
											<span class="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
												{cancion.genero}
											</span>
										{/if}
									</div>

									<div class="flex gap-4 text-sm text-muted-foreground">
										<span class="flex items-center gap-1">
											<Clock class="h-3.5 w-3.5" />
											{formatDuration(cancion.duracion)}
										</span>
										<span class="flex items-center gap-1">
											<Calendar class="h-3.5 w-3.5" />
											{cancion.año}
										</span>
									</div>
								</button>

								<div class="flex gap-2 flex-shrink-0">
									<Button
										variant="outline"
										size="icon"
										onclick={() => openSongDetails(cancion)}
										aria-label="Reproducir canción"
									>
										{#snippet children()}
											<Play class="h-4 w-4" />
										{/snippet}
									</Button>
									<Button
										variant={esFavorito ? 'default' : 'outline'}
										size="icon"
										onclick={() => toggleFavorito(cancion)}
										aria-label={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
									>
										{#snippet children()}
											<Heart class="h-4 w-4" fill={esFavorito ? 'currentColor' : 'none'} />
										{/snippet}
									</Button>
								</div>
							</div>
						</div>
					{/snippet}
				</Card>
			{/each}
		</div>
	</div>
</div>

{#if selectedSong}
	<SongDetailModal 
		cancion={selectedSong}
		esFavorito={favoritos.some(f => f.id === selectedSong?.id)}
		onClose={() => selectedSong = null}
		onToggleFavorito={() => {
			if (selectedSong) {
				toggleFavorito(selectedSong);
			}
		}}
	/>
{/if}
