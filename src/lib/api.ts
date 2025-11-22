const API_BASE_URL = "http://localhost:8000"

export interface Usuario {
  id: number
  nombre: string
  correo: string
  rol: "usuario" | "administrador"
  activo: boolean
}

export interface LoginResponse {
  access_token: string
  token_type: string
  rol: string
}

export interface Cancion {
  id: number
  titulo: string
  artista: string
  album?: string
  duracion: number
  año: number
  genero?: string
  url_audio?: string
}

export interface Favorito {
  id: number
  id_usuario: number
  id_cancion: number
}

export interface ApiError {
  detail: string
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    // Try to load token from localStorage
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth_token", token)
      } else {
        localStorage.removeItem("auth_token")
      }
    }
  }

  getToken(): string | null {
    return this.token
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      if (this.token) {
        headers["Authorization"] = `Bearer ${this.token}`
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options?.headers,
        },
      })

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }))
        throw new Error(error.detail || `HTTP ${response.status}`)
      }

      if (response.status === 204) {
        return {} as T
      }

      return response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Error de conexión con el servidor")
    }
  }

  async register(
    nombre: string,
    correo: string,
    contraseña: string,
    rol: "usuario" | "administrador" = "usuario",
  ): Promise<Usuario> {
    return this.request<Usuario>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ nombre, correo, contraseña, rol }),
    })
  }

  async login(correo: string, contraseña: string): Promise<LoginResponse> {
    return this.request<LoginResponse>("/api/auth/login-json", {
      method: "POST",
      body: JSON.stringify({ correo, contraseña }),
    })
  }

  async getMe(): Promise<Usuario> {
    return this.request<Usuario>("/api/auth/me")
  }

  async verifyToken(): Promise<{ valido: boolean; usuario_id: number; correo: string; rol: string; activo: boolean }> {
    return this.request("/api/auth/verify")
  }

  // Usuarios
  async getUsuarios(skip = 0, limit = 100): Promise<Usuario[]> {
    return this.request<Usuario[]>(`/api/usuarios?skip=${skip}&limit=${limit}`)
  }

  async crearUsuario(
    nombre: string,
    correo: string,
    contraseña: string,
    rol: "usuario" | "administrador" = "usuario",
  ): Promise<Usuario> {
    return this.request<Usuario>("/api/usuarios", {
      method: "POST",
      body: JSON.stringify({ nombre, correo, contraseña, rol }),
    })
  }

  async getUsuarioById(id: number): Promise<Usuario> {
    return this.request<Usuario>(`/api/usuarios/${id}`)
  }

  // Admin endpoints for user management
  async actualizarUsuario(
    id: number,
    nombre?: string,
    correo?: string,
    rol?: "usuario" | "administrador",
    activo?: boolean,
  ): Promise<Usuario> {
    return this.request<Usuario>(`/api/usuarios/${id}`, {
      method: "PUT",
      body: JSON.stringify({ nombre, correo, rol, activo }),
    })
  }

  async eliminarUsuario(id: number): Promise<void> {
    return this.request<void>(`/api/usuarios/${id}`, { method: "DELETE" })
  }

  // Canciones
  async getCanciones(skip = 0, limit = 100): Promise<Cancion[]> {
    return this.request<Cancion[]>(`/api/canciones?skip=${skip}&limit=${limit}`)
  }

  async buscarCanciones(titulo?: string, artista?: string, genero?: string): Promise<Cancion[]> {
    const params = new URLSearchParams()
    if (titulo) params.append("titulo", titulo)
    if (artista) params.append("artista", artista)
    if (genero) params.append("genero", genero)

    const query = params.toString()
    return this.request<Cancion[]>(`/api/canciones/buscar${query ? `?${query}` : ""}`)
  }

  async getCancionById(id: number): Promise<Cancion> {
    return this.request<Cancion>(`/api/canciones/${id}`)
  }

  // Admin endpoints for song management
  async crearCancion(
    titulo: string,
    artista: string,
    album: string,
    duracion: number,
    año: number,
    genero: string,
    url_audio?: string,
  ): Promise<Cancion> {
    return this.request<Cancion>("/api/canciones", {
      method: "POST",
      body: JSON.stringify({ titulo, artista, album, duracion, año, genero, url_audio }),
    })
  }

  async actualizarCancion(
    id: number,
    titulo?: string,
    artista?: string,
    album?: string,
    duracion?: number,
    año?: number,
    genero?: string,
    url_audio?: string,
  ): Promise<Cancion> {
    return this.request<Cancion>(`/api/canciones/${id}`, {
      method: "PUT",
      body: JSON.stringify({ titulo, artista, album, duracion, año, genero, url_audio }),
    })
  }

  async eliminarCancion(id: number): Promise<void> {
    return this.request<void>(`/api/canciones/${id}`, { method: "DELETE" })
  }

  // Favoritos
  async getFavoritosUsuario(usuarioId: number): Promise<Cancion[]> {
    return this.request<Cancion[]>(`/api/usuarios/${usuarioId}/favoritos`)
  }

  async marcarFavorito(usuarioId: number, cancionId: number): Promise<Favorito> {
    return this.request<Favorito>(`/api/usuarios/${usuarioId}/favoritos/${cancionId}`, { method: "POST" })
  }

  async quitarFavorito(usuarioId: number, cancionId: number): Promise<void> {
    return this.request<void>(`/api/usuarios/${usuarioId}/favoritos/${cancionId}`, { method: "DELETE" })
  }
}

export const api = new ApiClient(API_BASE_URL)
