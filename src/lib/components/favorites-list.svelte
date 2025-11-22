<script lang="ts">
	import { api, type Cancion } from '$lib/api';
	import { authStore } from '$lib/stores/auth';
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import SongDetailModal from '$lib/components/song-detail-modal.svelte';
	import { Heart, Clock, Calendar, Music, Play } from 'lucide-svelte';

	let favoritos = $state<Cancion[]>([]);
	let isLoading = $state(true);
	let selectedSong = $state<Cancion | null>(null);

	let usuario = $state<any>(null);
	authStore.subscribe((u) => (usuario = u));

	async function loadFavoritos() {
		if (!usuario) return;
		
		isLoading = true;
		try {
			favoritos = await api.getFavoritosUsuario(usuario.id);
		} catch (err) {
			console.error('[v0] Error loading favorites:', err);
		} finally {
			isLoading = false;
		}
	}

	async function quitarFavorito(cancionId: number) {
		if (!usuario) return;

		try {
			await api.quitarFavorito(usuario.id, cancionId);
			await loadFavoritos();
		} catch (err) {
			console.error('[v0] Error removing favorite:', err);
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

	$effect(() => {
		if (usuario) {
			loadFavoritos();
		}
	});
</script>

<div class="space-y-6">
	<div class="flex items-center gap-2">
		<Heart class="h-5 w-5 text-primary" fill="currentColor" />
		<h2 class="text-2xl font-bold">Mis Favoritos</h2>
	</div>

	{#if isLoading}
		<div class="flex items-center justify-center py-12">
			<div class="flex items-center gap-2 text-muted-foreground">
				<span class="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
				Cargando favoritos...
			</div>
		</div>
	{:else if favoritos.length === 0}
		<Card class="px-12 text-center">
			<div class="flex flex-col items-center gap-4 text-muted-foreground">
				<Music class="h-12 w-12 opacity-50" />
				<div>
					<p class="font-medium">No tienes favoritos aún</p>
					<p class="text-sm">Busca canciones y márcalas como favoritas</p>
				</div>
			</div>
		</Card>
	{:else}
		<div class="space-y-4">
			<p class="text-sm text-muted-foreground">{favoritos.length} canciones guardadas</p>
			
			<div class="grid gap-4">
				{#each favoritos as cancion (cancion.id)}
					<Card class="px-4 hover:bg-secondary/50 transition-colors">
						<div class="flex items-start justify-between gap-4">
							<!-- Made song info clickable -->
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

							<!-- Added play button and favorite button -->
							<div class="flex gap-2 flex-shrink-0">
								<Button
									variant="outline"
									size="icon"
									onclick={() => openSongDetails(cancion)}
								>
									{#snippet children()}
										<Play class="h-4 w-4" />
									{/snippet}
								</Button>
								<Button
									variant="destructive"
									size="icon"
									onclick={() => quitarFavorito(cancion.id)}
								>
									{#snippet children()}
										<Heart class="h-4 w-4" fill="currentColor" />
									{/snippet}
								</Button>
							</div>
						</div>
					</Card>
				{/each}
			</div>
		</div>
	{/if}
</div>

<!-- Added modal for song details -->
{#if selectedSong}
	<SongDetailModal 
		cancion={selectedSong}
		esFavorito={true}
		onClose={() => selectedSong = null}
		onToggleFavorito={() => {
			if (selectedSong) {
				quitarFavorito(selectedSong.id);
			}
		}}
	/>
{/if}
