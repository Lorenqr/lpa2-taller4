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
      const token = api.getToken()
      if (token) {
        try {
          const usuario = await api.getMe()
          set(usuario)
          return usuario
        } catch (error) {
          // Token invalid or expired
          api.setToken(null)
          set(null)
          return null
        }
      }
      return null
    },
  }
}

export const authStore = createAuthStore()
