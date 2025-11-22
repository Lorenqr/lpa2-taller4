<script lang="ts">
	import { api } from '$lib/api';
	import { authStore } from '$lib/stores/auth';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { Music } from 'lucide-svelte';

	let email = $state('');
	let nombre = $state('');
	let password = $state('');
	let rol = $state<'usuario' | 'administrador'>('usuario');
	let isLoading = $state(false);
	let error = $state('');
	let success = $state('');
	let isRegisterMode = $state(false);

	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const isValidEmail = $derived(emailPattern.test(email));
	const isValidPassword = $derived(password.length >= 6);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		success = '';
		isLoading = true;

		try {
			if (isRegisterMode) {
				if (!nombre.trim()) {
					error = 'Por favor ingresa tu nombre';
					isLoading = false;
					return;
				}

				if (!isValidEmail) {
					error = 'Por favor ingresa un correo válido';
					isLoading = false;
					return;
				}

				if (!isValidPassword) {
					error = 'La contraseña debe tener al menos 6 caracteres';
					isLoading = false;
					return;
				}

				// Register new user
				await api.register(nombre, email, password, rol);
				
				// Auto-login after registration
				const loginResponse = await api.login(email, password);
				api.setToken(loginResponse.access_token);
				
				const usuario = await api.getMe();
				authStore.setUser(usuario);
				success = '¡Cuenta creada exitosamente!';
			} else {
				if (!isValidEmail) {
					error = 'Por favor ingresa un correo válido';
					isLoading = false;
					return;
				}

				if (!isValidPassword) {
					error = 'La contraseña debe tener al menos 6 caracteres';
					isLoading = false;
					return;
				}

				// Login existing user
				const loginResponse = await api.login(email, password);
				api.setToken(loginResponse.access_token);
				
				const usuario = await api.getMe();
				authStore.setUser(usuario);
				success = '¡Bienvenido de nuevo!';
			}
		} catch (err: any) {
			if (err.message.includes('404') || err.message.includes('no encontrado')) {
				error = 'Correo o contraseña incorrectos';
			} else if (err.message.includes('401') || err.message.includes('no autorizado')) {
				error = 'Credenciales inválidas';
			} else if (err.message.includes('correo ya está registrado')) {
				error = 'Este correo ya está registrado. Por favor inicia sesión.';
			} else {
				error = err.message || 'Error al procesar la solicitud';
			}
		} finally {
			isLoading = false;
		}
	}

	function toggleMode() {
		isRegisterMode = !isRegisterMode;
		error = '';
		success = '';
		nombre = '';
		password = '';
		rol = 'usuario';
	}
</script>

<div class="flex min-h-screen items-center justify-center p-4">
	<div class="w-full max-w-md space-y-8">
		<div class="text-center space-y-2">
			<div class="flex justify-center mb-4">
				<div class="rounded-full bg-primary/10 p-4">
					<Music class="h-12 w-12 text-primary" />
				</div>
			</div>
			<h1 class="text-4xl font-bold tracking-tight">Music App</h1>
			<p class="text-muted-foreground">Descubre y guarda tu música favorita</p>
		</div>

		<div class="flex gap-2 p-1 bg-muted rounded-lg">
			<button
				type="button"
				onclick={toggleMode}
				disabled={!isRegisterMode}
				class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors {!isRegisterMode ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
			>
				Iniciar sesión
			</button>
			<button
				type="button"
				onclick={toggleMode}
				disabled={isRegisterMode}
				class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors {isRegisterMode ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
			>
				Registrarse
			</button>
		</div>

		<form onsubmit={handleSubmit} class="space-y-6">
			<div class="space-y-4">
				{#if isRegisterMode}
					<div class="space-y-2">
						<Label for="nombre">Nombre completo</Label>
						<Input
							id="nombre"
							type="text"
							placeholder="Juan Pérez"
							bind:value={nombre}
							disabled={isLoading}
							required
							class="transition-all"
						/>
					</div>
				{/if}

				<div class="space-y-2">
					<Label for="email">Correo electrónico</Label>
					<Input
						id="email"
						type="email"
						placeholder="tu@email.com"
						bind:value={email}
						disabled={isLoading}
						required
						class="transition-all"
					/>
					{#if email && !isValidEmail}
						<p class="text-sm text-destructive">Ingresa un correo válido</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="password">Contraseña</Label>
					<Input
						id="password"
						type="password"
						placeholder="Mínimo 6 caracteres"
						bind:value={password}
						disabled={isLoading}
						required
						class="transition-all"
					/>
					{#if password && !isValidPassword}
						<p class="text-sm text-destructive">La contraseña debe tener al menos 6 caracteres</p>
					{/if}
				</div>

				{#if isRegisterMode}
					<div class="space-y-2">
						<Label for="rol">Tipo de cuenta</Label>
						<div class="flex gap-4">
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									name="rol"
									value="usuario"
									bind:group={rol}
									disabled={isLoading}
									class="h-4 w-4 text-primary"
								/>
								<span class="text-sm">Usuario</span>
							</label>
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									name="rol"
									value="administrador"
									bind:group={rol}
									disabled={isLoading}
									class="h-4 w-4 text-primary"
								/>
								<span class="text-sm">Administrador</span>
							</label>
						</div>
					</div>
				{/if}
			</div>

			{#if error}
				<div
					class="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive"
				>
					{error}
				</div>
			{/if}

			{#if success}
				<div
					class="rounded-lg bg-primary/10 border border-primary/20 p-3 text-sm text-primary"
				>
					{success}
				</div>
			{/if}

			<Button
				type="submit"
				disabled={!isValidEmail || !isValidPassword || isLoading || (isRegisterMode && !nombre.trim())}
				class="w-full"
			>
				{#snippet children()}
					{#if isLoading}
						<span class="flex items-center gap-2">
							<span class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
							Procesando...
						</span>
					{:else if isRegisterMode}
						Crear cuenta
					{:else}
						Iniciar sesión
					{/if}
				{/snippet}
			</Button>
		</form>

		<p class="text-center text-sm text-muted-foreground">
			{isRegisterMode 
				? 'Al registrarte, podrás guardar tus canciones favoritas' 
				: 'Inicia sesión para acceder a tu música favorita'}
		</p>
	</div>
</div>
