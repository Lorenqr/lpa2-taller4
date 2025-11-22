<script lang="ts">
	import { type Cancion } from '$lib/api';
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import { X, Play, Pause, Heart, Clock, Calendar, Disc, Music2, User } from 'lucide-svelte';

	let { 
		cancion,
		esFavorito = false,
		onClose,
		onToggleFavorito
	}: {
		cancion: Cancion;
		esFavorito?: boolean;
		onClose: () => void;
		onToggleFavorito?: () => void;
	} = $props();

	let audioElement: HTMLAudioElement | null = $state(null);
	let isPlaying = $state(false);
	let currentTime = $state(0);
	let duration = $state(cancion.duracion);
	let intervalId: number | null = null;

	const hasRealAudio = cancion.url_audio && cancion.url_audio.trim() !== '' && 
		(cancion.url_audio.includes('.mp3') || cancion.url_audio.includes('.wav') || 
		 cancion.url_audio.includes('.ogg') || cancion.url_audio.includes('.m4a'));

	function formatDuration(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	function togglePlay() {
		if (hasRealAudio && audioElement) {
			if (isPlaying) {
				audioElement.pause();
				isPlaying = false;
			} else {
				audioElement.play();
				isPlaying = true;
			}
		} else {
			// Simulation mode
			if (isPlaying) {
				if (intervalId) {
					clearInterval(intervalId);
					intervalId = null;
				}
				isPlaying = false;
			} else {
				intervalId = window.setInterval(() => {
					currentTime += 1;
					if (currentTime >= duration) {
						if (intervalId) {
							clearInterval(intervalId);
							intervalId = null;
						}
						currentTime = 0;
						isPlaying = false;
					}
				}, 1000);
				isPlaying = true;
			}
		}
	}

	function handleAudioTimeUpdate() {
		if (audioElement) {
			currentTime = Math.floor(audioElement.currentTime);
			duration = Math.floor(audioElement.duration) || cancion.duracion;
		}
	}

	function handleAudioEnded() {
		isPlaying = false;
		currentTime = 0;
	}

	function handleAudioError() {
		console.error('[v0] Error loading audio');
		isPlaying = false;
	}

	function seekTo(percentage: number) {
		const newTime = Math.floor((percentage / 100) * duration);
		if (hasRealAudio && audioElement) {
			audioElement.currentTime = newTime;
		} else {
			currentTime = newTime;
		}
	}

	function handleProgressClick(e: MouseEvent) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const percentage = ((e.clientX - rect.left) / rect.width) * 100;
		seekTo(percentage);
	}

	// Cleanup on unmount
	$effect(() => {
		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
			if (audioElement) {
				audioElement.pause();
				audioElement.src = '';
			}
		};
	});

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
		}
	}
</script>

<!-- Audio element only for direct audio files -->
{#if hasRealAudio}
	<audio
		bind:this={audioElement}
		src={cancion.url_audio}
		ontimeupdate={handleAudioTimeUpdate}
		onended={handleAudioEnded}
		onerror={handleAudioError}
		preload="metadata"
	></audio>
{/if}

<div 
	class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
	onclick={handleBackdropClick}
	onkeydown={handleKeyDown}
	role="dialog"
	aria-modal="true"
	aria-labelledby="song-detail-modal-title"
	tabindex="-1"
>
	<Card class="w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
		{#snippet children()}
			<div class="p-6">
				<div class="flex items-start justify-between mb-6 sticky top-0 bg-card z-10 pb-4 border-b">
					<div class="flex items-center gap-2">
						<Music2 class="h-6 w-6 text-primary" />
						<h2 class="text-2xl font-bold" id="song-detail-modal-title">Detalles de la Canción</h2>
					</div>
					<Button variant="ghost" size="icon" onclick={onClose} aria-label="Cerrar">
						{#snippet children()}
							<X class="h-5 w-5" />
						{/snippet}
					</Button>
				</div>

				<div class="space-y-6">
					<div class="space-y-2">
						<h3 class="text-3xl font-bold">{cancion.titulo}</h3>
						<p class="text-xl text-muted-foreground flex items-center gap-2">
							<User class="h-5 w-5" />
							{cancion.artista}
						</p>
						<!-- Show audio type indicator -->
						{#if hasRealAudio}
							<p class="text-sm text-primary flex items-center gap-1">
								<Music2 class="h-3.5 w-3.5" />
								Audio real disponible
							</p>
						{:else}
							<p class="text-sm text-muted-foreground flex items-center gap-1">
								<Music2 class="h-3.5 w-3.5" />
								Modo simulación (sin audio real)
							</p>
						{/if}
					</div>

					<div class="space-y-4 bg-secondary/30 rounded-lg p-6">
						<div class="flex items-center justify-center gap-4">
							<Button 
								size="lg" 
								onclick={togglePlay}
								class="h-16 w-16 rounded-full"
								aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
							>
								{#snippet children()}
									{#if isPlaying}
										<Pause class="h-8 w-8" />
									{:else}
										<Play class="h-8 w-8 ml-1" />
									{/if}
								{/snippet}
							</Button>
						</div>

						<div class="space-y-2">
							<button 
								class="w-full bg-secondary rounded-full h-2 overflow-hidden cursor-pointer hover:h-3 transition-all"
								onclick={handleProgressClick}
								type="button"
								aria-label="Buscar en la reproducción"
							>
								<div 
									class="bg-primary h-full transition-all duration-300"
									style="width: {duration > 0 ? (currentTime / duration) * 100 : 0}%"
								></div>
							</button>
							<div class="flex justify-between text-sm text-muted-foreground">
								<span>{formatDuration(currentTime)}</span>
								<span>{formatDuration(duration)}</span>
							</div>
						</div>
					</div>

					<div class="grid gap-4">
						{#if cancion.album}
							<div class="flex items-start gap-3 p-4 rounded-lg bg-secondary/20">
								<Disc class="h-5 w-5 text-primary mt-0.5" />
								<div class="flex-1">
									<p class="text-sm font-medium text-muted-foreground">Álbum</p>
									<p class="text-base font-semibold">{cancion.album}</p>
								</div>
							</div>
						{/if}

						{#if cancion.genero}
							<div class="flex items-start gap-3 p-4 rounded-lg bg-secondary/20">
								<Music2 class="h-5 w-5 text-primary mt-0.5" />
								<div class="flex-1">
									<p class="text-sm font-medium text-muted-foreground">Género</p>
									<span class="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary mt-1">
										{cancion.genero}
									</span>
								</div>
							</div>
						{/if}

						<div class="flex items-start gap-3 p-4 rounded-lg bg-secondary/20">
							<Calendar class="h-5 w-5 text-primary mt-0.5" />
							<div class="flex-1">
								<p class="text-sm font-medium text-muted-foreground">Año de lanzamiento</p>
								<p class="text-base font-semibold">{cancion.año}</p>
							</div>
						</div>

						<div class="flex items-start gap-3 p-4 rounded-lg bg-secondary/20">
							<Clock class="h-5 w-5 text-primary mt-0.5" />
							<div class="flex-1">
								<p class="text-sm font-medium text-muted-foreground">Duración</p>
								<p class="text-base font-semibold">{formatDuration(duration)}</p>
							</div>
						</div>

						<div class="flex items-start gap-3 p-4 rounded-lg bg-secondary/20">
							<Music2 class="h-5 w-5 text-primary mt-0.5" />
							<div class="flex-1">
								<p class="text-sm font-medium text-muted-foreground">ID</p>
								<p class="text-base font-mono">{cancion.id}</p>
							</div>
						</div>
					</div>

					{#if onToggleFavorito}
						<Button 
							variant={esFavorito ? 'default' : 'outline'} 
							class="w-full"
							onclick={onToggleFavorito}
							aria-label={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
						>
							{#snippet children()}
								<Heart class="h-5 w-5 mr-2" fill={esFavorito ? 'currentColor' : 'none'} />
								{esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
							{/snippet}
						</Button>
					{/if}
				</div>
			</div>
		{/snippet}
	</Card>
</div>
