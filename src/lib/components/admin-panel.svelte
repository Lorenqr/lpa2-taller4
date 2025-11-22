<script lang="ts">
	import { run } from 'svelte/legacy';

	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import type { Usuario, Cancion } from '$lib/api';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import { Pencil, Trash2, Plus, Search, Users, Music } from 'lucide-svelte';

	let usuarios: Usuario[] = $state([]);
	let canciones: Cancion[] = $state([]);
	let loading = $state(false);
	let error = $state('');
	let success = $state('');

	let subView = $state('usuarios');

	// Usuario form
	let userFormMode: 'create' | 'edit' | null = $state(null);
	let editingUserId: number | null = null;
	let userNombre = $state('');
	let userCorreo = $state('');
	let userContraseña = $state('');
	let userRol: 'usuario' | 'administrador' = $state('usuario');

	// Cancion form
	let cancionFormMode: 'create' | 'edit' | null = $state(null);
	let editingCancionId: number | null = null;
	let cancionTitulo = $state('');
	let cancionArtista = $state('');
	let cancionAlbum = $state('');
	let cancionDuracion = $state(0);
	let cancionAño = $state(new Date().getFullYear());
	let cancionGenero = $state('');
	let cancionUrlAudio = $state('');

	// Search
	let searchQuery = $state('');

	onMount(() => {
		loadUsuarios();
		loadCanciones();
	});

	async function loadUsuarios() {
		try {
			loading = true;
			usuarios = await api.getUsuarios();
		} catch (err: any) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	async function loadCanciones() {
		try {
			loading = true;
			canciones = await api.getCanciones();
		} catch (err: any) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	function openUserForm(mode: 'create' | 'edit', user?: Usuario) {
		userFormMode = mode;
		if (mode === 'edit' && user) {
			editingUserId = user.id;
			userNombre = user.nombre;
			userCorreo = user.correo;
			userRol = user.rol;
			userContraseña = '';
		} else {
			editingUserId = null;
			userNombre = '';
			userCorreo = '';
			userContraseña = '';
			userRol = 'usuario';
		}
		error = '';
		success = '';
	}

	function cancelUserForm() {
		userFormMode = null;
		editingUserId = null;
		userNombre = '';
		userCorreo = '';
		userContraseña = '';
		userRol = 'usuario';
	}

	async function saveUser() {
		error = '';
		success = '';

		if (!userNombre || !userCorreo) {
			error = 'Nombre y correo son obligatorios';
			return;
		}

		if (userFormMode === 'create' && !userContraseña) {
			error = 'La contraseña es obligatoria para crear un usuario';
			return;
		}

		try {
			loading = true;
			if (userFormMode === 'create') {
				await api.crearUsuario(userNombre, userCorreo, userContraseña, userRol);
				success = 'Usuario creado exitosamente';
			} else if (userFormMode === 'edit' && editingUserId) {
				await api.actualizarUsuario(editingUserId, userNombre, userCorreo, userRol, undefined);
				success = 'Usuario actualizado exitosamente';
			}
			await loadUsuarios();
			cancelUserForm();
			setTimeout(() => (success = ''), 3000);
		} catch (err: any) {
			error = err.message || 'Error al guardar el usuario';
		} finally {
			loading = false;
		}
	}

	async function deleteUser(id: number) {
		const user = usuarios.find((u) => u.id === id);
		if (!user) return;

		const confirmMessage = `¿Eliminar a ${user.nombre}?\n\nEsta acción no se puede deshacer.`;

		if (!confirm(confirmMessage)) return;

		error = '';
		success = '';
		try {
			loading = true;
			await api.eliminarUsuario(id);
			success = `Usuario eliminado correctamente`;
			await loadUsuarios();
			setTimeout(() => (success = ''), 3000);
		} catch (err: any) {
			error = err.message || 'Error al eliminar el usuario';
		} finally {
			loading = false;
		}
	}

	function openCancionForm(mode: 'create' | 'edit', cancion?: Cancion) {
		cancionFormMode = mode;
		if (mode === 'edit' && cancion) {
			editingCancionId = cancion.id;
			cancionTitulo = cancion.titulo;
			cancionArtista = cancion.artista;
			cancionAlbum = cancion.album || '';
			cancionDuracion = cancion.duracion;
			cancionAño = cancion.año;
			cancionGenero = cancion.genero || '';
			cancionUrlAudio = cancion.url_audio || '';
		} else {
			editingCancionId = null;
			cancionTitulo = '';
			cancionArtista = '';
			cancionAlbum = '';
			cancionDuracion = 0;
			cancionAño = new Date().getFullYear();
			cancionGenero = '';
			cancionUrlAudio = '';
		}
		error = '';
		success = '';
	}

	function cancelCancionForm() {
		cancionFormMode = null;
		editingCancionId = null;
		cancionTitulo = '';
		cancionArtista = '';
		cancionAlbum = '';
		cancionDuracion = 0;
		cancionAño = new Date().getFullYear();
		cancionGenero = '';
		cancionUrlAudio = '';
	}

	async function saveCancion() {
		error = '';
		success = '';

		if (!cancionTitulo || !cancionArtista || cancionDuracion <= 0) {
			error = 'Título, artista y duración son obligatorios';
			return;
		}

		try {
			loading = true;
			if (cancionFormMode === 'create') {
				await api.crearCancion(
					cancionTitulo,
					cancionArtista,
					cancionAlbum,
					cancionDuracion,
					cancionAño,
					cancionGenero,
					cancionUrlAudio || undefined
				);
				success = 'Canción creada exitosamente';
			} else if (cancionFormMode === 'edit' && editingCancionId) {
				await api.actualizarCancion(
					editingCancionId,
					cancionTitulo,
					cancionArtista,
					cancionAlbum,
					cancionDuracion,
					cancionAño,
					cancionGenero,
					cancionUrlAudio || undefined
				);
				success = 'Canción actualizada exitosamente';
			}
			await loadCanciones();
			cancelCancionForm();
			setTimeout(() => (success = ''), 3000);
		} catch (err: any) {
			error = err.message || 'Error al guardar la canción';
		} finally {
			loading = false;
		}
	}

	async function deleteCancion(id: number) {
		const cancion = canciones.find((c) => c.id === id);
		if (!cancion) return;

		const confirmMessage = `¿Eliminar "${cancion.titulo}"?\n\nEsta acción no se puede deshacer.`;

		if (!confirm(confirmMessage)) return;

		error = '';
		success = '';
		try {
			loading = true;
			await api.eliminarCancion(id);
			success = `Canción eliminada correctamente`;
			await loadCanciones();
			setTimeout(() => (success = ''), 3000);
		} catch (err: any) {
			error = err.message || 'Error al eliminar la canción';
		} finally {
			loading = false;
		}
	}

	function handleSearch() {
		if (subView === 'usuarios') {
			const query = searchQuery.toLowerCase();
			usuarios = usuarios.filter(
				(u) => u.nombre.toLowerCase().includes(query) || u.correo.toLowerCase().includes(query)
			);
		} else {
			const query = searchQuery.toLowerCase();
			canciones = canciones.filter(
				(c) =>
					c.titulo.toLowerCase().includes(query) ||
					c.artista.toLowerCase().includes(query) ||
					(c.genero && c.genero.toLowerCase().includes(query))
			);
		}
	}

	function resetSearch() {
		searchQuery = '';
		if (subView === 'usuarios') {
			loadUsuarios();
		} else {
			loadCanciones();
		}
	}

	run(() => {
		if (subView === 'usuarios') {
			loadUsuarios();
		} else {
			loadCanciones();
		}
	});
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-bold">Panel de Administración</h2>
	</div>

	{#if error}
		<div class="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
			<p class="text-red-500 text-sm">{error}</p>
		</div>
	{/if}

	{#if success}
		<div class="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
			<p class="text-green-500 text-sm">{success}</p>
		</div>
	{/if}

	<div class="flex gap-2">
		<Button
			variant={subView === 'usuarios' ? 'default' : 'outline'}
			onclick={() => (subView = 'usuarios')}
			class="gap-2"
		>
			<Users class="w-4 h-4" />
			Usuarios
		</Button>
		<Button
			variant={subView === 'canciones' ? 'default' : 'outline'}
			onclick={() => (subView = 'canciones')}
			class="gap-2"
		>
			<Music class="w-4 h-4" />
			Canciones
		</Button>
	</div>

	{#if subView === 'usuarios'}
		<div class="space-y-4">
			<div class="flex gap-2">
				<Input bind:value={searchQuery} placeholder="Buscar usuario..." class="flex-1" />
				<Button onclick={handleSearch} variant="outline" class="gap-2">
					<Search class="w-4 h-4" />
					Buscar
				</Button>
				{#if searchQuery}
					<Button onclick={resetSearch} variant="outline">Limpiar</Button>
				{/if}
				<Button onclick={() => openUserForm('create')} class="gap-2">
					<Plus class="w-4 h-4" />
					Nuevo Usuario
				</Button>
			</div>

			{#if userFormMode}
				<Card class="p-6 border-primary/50">
					<h3 class="text-lg font-semibold mb-4">
						{userFormMode === 'create' ? 'Crear Usuario' : 'Editar Usuario'}
					</h3>
					<div class="space-y-4">
						<div>
							<Label for="user-nombre">Nombre</Label>
							<Input id="user-nombre" bind:value={userNombre} placeholder="Nombre completo" />
						</div>
						<div>
							<Label for="user-correo">Correo</Label>
							<Input id="user-correo" type="email" bind:value={userCorreo} placeholder="correo@ejemplo.com" />
						</div>
						{#if userFormMode === 'create'}
							<div>
								<Label for="user-contraseña">Contraseña</Label>
								<Input
									id="user-contraseña"
									type="password"
									bind:value={userContraseña}
									placeholder="Contraseña"
								/>
							</div>
						{/if}
						<div>
							<Label for="user-rol">Rol</Label>
							<select
								id="user-rol"
								bind:value={userRol}
								class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							>
								<option value="usuario">Usuario</option>
								<option value="administrador">Administrador</option>
							</select>
						</div>
						<div class="flex gap-2">
							<Button onclick={saveUser} disabled={loading}>
								{loading ? 'Guardando...' : 'Guardar'}
							</Button>
							<Button variant="outline" onclick={cancelUserForm}>Cancelar</Button>
						</div>
					</div>
				</Card>
			{/if}

			<div class="space-y-2">
				{#if loading && usuarios.length === 0}
					<p class="text-muted-foreground text-center py-8">Cargando usuarios...</p>
				{:else if usuarios.length === 0}
					<p class="text-muted-foreground text-center py-8">No hay usuarios</p>
				{:else}
					{#each usuarios as usuario (usuario.id)}
						<Card class="p-4">
							<div class="flex items-center justify-between">
								<div class="flex-1">
									<h4 class="font-semibold">{usuario.nombre}</h4>
									<p class="text-sm text-muted-foreground">{usuario.correo}</p>
									<p class="text-xs text-muted-foreground mt-1">
										Rol: {usuario.rol === 'administrador' ? 'Administrador' : 'Usuario'} •
										{usuario.activo ? 'Activo' : 'Inactivo'}
									</p>
								</div>
								<div class="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onclick={() => openUserForm('edit', usuario)}
										class="gap-2"
									>
										<Pencil class="w-4 h-4" />
										Editar
									</Button>
									<Button
										variant="outline"
										size="sm"
										onclick={() => deleteUser(usuario.id)}
										class="gap-2 text-red-500 hover:text-red-600"
									>
										<Trash2 class="w-4 h-4" />
										Eliminar
									</Button>
								</div>
							</div>
						</Card>
					{/each}
				{/if}
			</div>
		</div>
	{:else}
		<div class="space-y-4">
			<div class="flex gap-2">
				<Input bind:value={searchQuery} placeholder="Buscar canción..." class="flex-1" />
				<Button onclick={handleSearch} variant="outline" class="gap-2">
					<Search class="w-4 h-4" />
					Buscar
				</Button>
				{#if searchQuery}
					<Button onclick={resetSearch} variant="outline">Limpiar</Button>
				{/if}
				<Button onclick={() => openCancionForm('create')} class="gap-2">
					<Plus class="w-4 h-4" />
					Nueva Canción
				</Button>
			</div>

			{#if cancionFormMode}
				<Card class="p-6 border-primary/50">
					<h3 class="text-lg font-semibold mb-4">
						{cancionFormMode === 'create' ? 'Crear Canción' : 'Editar Canción'}
					</h3>
					<div class="space-y-4">
						<div class="grid grid-cols-2 gap-4">
							<div>
								<Label for="cancion-titulo">Título *</Label>
								<Input id="cancion-titulo" bind:value={cancionTitulo} placeholder="Título de la canción" />
							</div>
							<div>
								<Label for="cancion-artista">Artista *</Label>
								<Input id="cancion-artista" bind:value={cancionArtista} placeholder="Nombre del artista" />
							</div>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<Label for="cancion-album">Álbum</Label>
								<Input id="cancion-album" bind:value={cancionAlbum} placeholder="Nombre del álbum" />
							</div>
							<div>
								<Label for="cancion-genero">Género</Label>
								<Input id="cancion-genero" bind:value={cancionGenero} placeholder="Ej: Rock, Pop" />
							</div>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<Label for="cancion-duracion">Duración (segundos) *</Label>
								<Input
									id="cancion-duracion"
									type="number"
									bind:value={cancionDuracion}
									placeholder="180"
									min="1"
								/>
							</div>
							<div>
								<Label for="cancion-año">Año *</Label>
								<Input id="cancion-año" type="number" bind:value={cancionAño} placeholder="2024" min="1900" />
							</div>
						</div>
						<div>
							<Label for="cancion-url">URL de Audio (opcional)</Label>
							<Input
								id="cancion-url"
								bind:value={cancionUrlAudio}
								placeholder="https://ejemplo.com/audio.mp3"
							/>
							<p class="text-xs text-muted-foreground mt-1">
								Solo URLs directas a archivos MP3. YouTube no es compatible.
							</p>
						</div>
						<div class="flex gap-2">
							<Button onclick={saveCancion} disabled={loading}>
								{loading ? 'Guardando...' : 'Guardar'}
							</Button>
							<Button variant="outline" onclick={cancelCancionForm}>Cancelar</Button>
						</div>
					</div>
				</Card>
			{/if}

			<div class="space-y-2">
				{#if loading && canciones.length === 0}
					<p class="text-muted-foreground text-center py-8">Cargando canciones...</p>
				{:else if canciones.length === 0}
					<p class="text-muted-foreground text-center py-8">No hay canciones</p>
				{:else}
					{#each canciones as cancion (cancion.id)}
						<Card class="p-4">
							<div class="flex items-center justify-between">
								<div class="flex-1">
									<h4 class="font-semibold">{cancion.titulo}</h4>
									<p class="text-sm text-muted-foreground">{cancion.artista}</p>
									<p class="text-xs text-muted-foreground mt-1">
										{cancion.album || 'Sin álbum'} • {cancion.genero || 'Sin género'} • {cancion.año}
									</p>
								</div>
								<div class="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onclick={() => openCancionForm('edit', cancion)}
										class="gap-2"
									>
										<Pencil class="w-4 h-4" />
										Editar
									</Button>
									<Button
										variant="outline"
										size="sm"
										onclick={() => deleteCancion(cancion.id)}
										class="gap-2 text-red-500 hover:text-red-600"
									>
										<Trash2 class="w-4 h-4" />
										Eliminar
									</Button>
								</div>
							</div>
						</Card>
					{/each}
				{/if}
			</div>
		</div>
	{/if}
</div>
