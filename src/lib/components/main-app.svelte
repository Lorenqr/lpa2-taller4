<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import Button from '$lib/components/ui/button/button.svelte';
	import SongSearch from './song-search.svelte';
	import FavoritesList from './favorites-list.svelte';
	import UserProfile from './user-profile.svelte';
	import AdminPanel from './admin-panel.svelte';
	import { Music, LogOut, Search, Heart, User, LayoutDashboard } from 'lucide-svelte';

	let activeTab = $state<string>($authStore?.rol === 'administrador' ? 'admin' : 'search');
	
	function handleLogout() {
		authStore.logout();
	}

	let isAdmin = $derived($authStore?.rol === 'administrador');
</script>

<div class="min-h-screen flex flex-col">
	<!-- Header -->
	<header class="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
		<div class="container mx-auto px-4 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<div class="rounded-full bg-primary/10 p-2">
						<Music class="h-6 w-6 text-primary" />
					</div>
					<div>
						<h1 class="text-xl font-bold">Music App</h1>
						{#if $authStore}
							<p class="text-sm text-muted-foreground">{$authStore.nombre}</p>
						{/if}
					</div>
				</div>

				<Button variant="ghost" onclick={handleLogout}>
					{#snippet children()}
						<LogOut class="h-5 w-5 mr-2" />
						Salir
					{/snippet}
				</Button>
			</div>
		</div>
	</header>

	<!-- Tabs -->
	<div class="border-b border-border">
		<div class="container mx-auto px-4">
			<div class="flex gap-4">
				<button
					onclick={() => (activeTab = 'search')}
					class="flex items-center gap-2 px-4 py-3 border-b-2 transition-colors {activeTab === 'search'
						? 'border-primary text-primary font-medium'
						: 'border-transparent text-muted-foreground hover:text-foreground'}"
				>
					<Search class="h-4 w-4" />
					Buscar
				</button>
				<button
					onclick={() => (activeTab = 'favorites')}
					class="flex items-center gap-2 px-4 py-3 border-b-2 transition-colors {activeTab === 'favorites'
						? 'border-primary text-primary font-medium'
						: 'border-transparent text-muted-foreground hover:text-foreground'}"
				>
					<Heart class="h-4 w-4" />
					Favoritos
				</button>
				<button
					onclick={() => (activeTab = 'profile')}
					class="flex items-center gap-2 px-4 py-3 border-b-2 transition-colors {activeTab === 'profile'
						? 'border-primary text-primary font-medium'
						: 'border-transparent text-muted-foreground hover:text-foreground'}"
				>
					<User class="h-4 w-4" />
					Mi Perfil
				</button>
				{#if isAdmin}
					<button
						onclick={() => (activeTab = 'admin')}
						class="flex items-center gap-2 px-4 py-3 border-b-2 transition-colors {activeTab === 'admin'
							? 'border-primary text-primary font-medium'
							: 'border-transparent text-muted-foreground hover:text-foreground'}"
					>
						<LayoutDashboard class="h-4 w-4" />
						Administración
					</button>
				{/if}
			</div>
		</div>
	</div>

	<!-- Content -->
	<main class="flex-1 container mx-auto px-4 py-8">
		{#if activeTab === 'search'}
			<SongSearch />
		{:else if activeTab === 'favorites'}
			<FavoritesList />
		{:else if activeTab === 'profile'}
			<UserProfile />
		{:else if activeTab === 'admin' && isAdmin}
			<AdminPanel />
		{/if}
	</main>

	<!-- Footer -->
	<footer class="border-t border-border py-6">
		<div class="container mx-auto px-4 text-center text-sm text-muted-foreground">
			<p>Music App · Conectado a API localhost:8000</p>
		</div>
	</footer>
</div>
