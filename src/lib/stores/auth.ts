import { writable } from "svelte/store"
import type { Usuario } from "$lib/api"
import { api } from "$lib/api"

function createAuthStore() {
  const { subscribe, set } = writable<Usuario | null>(null)

  return {
    subscribe,
    setUser: (usuario: Usuario | null) => set(usuario),
    clearUser: () => {
      set(null)
      api.setToken(null)
    },
    logout: () => {
      set(null)
      api.setToken(null)
    },
    async restoreSession() {
      console.log('Starting restoreSession...');
      const token = api.getToken();
      console.log('Token found:', !!token);
      
      if (token) {
        try {
          console.log('Attempting to get user info...');
          const usuario = await api.getMe();
          console.log('User info retrieved:', usuario);
          set(usuario);
          return usuario;
        } catch (error) {
          // Token invalid or expired
          console.log('Token validation failed:', error);
          api.setToken(null);
          set(null);
          return null;
        }
      }
      console.log('No token found, skipping restore');
      return null;
    },
  }
}

export const authStore = createAuthStore()
