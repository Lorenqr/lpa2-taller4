import { writable } from "svelte/store"
import type { Cancion } from "$lib/api"

interface PlayerState {
  currentSong: Cancion | null
  isPlaying: boolean
  currentTime: number
  volume: number
}

function createPlayerStore() {
  const { subscribe, set, update } = writable<PlayerState>({
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    volume: 70,
  })

  return {
    subscribe,
    playSong: (song: Cancion) => {
      update((state) => ({
        ...state,
        currentSong: song,
        isPlaying: true,
        currentTime: 0,
      }))
    },
    togglePlayPause: () => {
      update((state) => ({
        ...state,
        isPlaying: !state.isPlaying,
      }))
    },
    pause: () => {
      update((state) => ({
        ...state,
        isPlaying: false,
      }))
    },
    setCurrentTime: (time: number) => {
      update((state) => ({
        ...state,
        currentTime: time,
      }))
    },
    setVolume: (volume: number) => {
      update((state) => ({
        ...state,
        volume,
      }))
    },
    stop: () => {
      set({
        currentSong: null,
        isPlaying: false,
        currentTime: 0,
        volume: 70,
      })
    },
  }
}

export const playerStore = createPlayerStore()
