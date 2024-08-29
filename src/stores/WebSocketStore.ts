import { makeAutoObservable } from 'mobx'
import { API_BASE_URL } from '../services/api'
import { RootStore } from './RootStore'

export class WebSocketStore {
  socket: WebSocket | null = null
  isConnected: boolean = false
  error: string | null = null
  rootStore: RootStore
  reconnectAttempts: number = 0
  maxReconnectAttempts: number = 5
  reconnectTimeout: number | null = null

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)
  }

  connect() {
    const wsUrl =
      `${API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://')}`.replace(
        '/api',
        '/ws',
      )
    this.socket = new WebSocket(wsUrl)

    this.socket.onopen = this.handleOpen
    this.socket.onclose = this.handleClose
    this.socket.onerror = this.handleError
    this.socket.onmessage = this.handleMessage
  }

  handleOpen = () => {
    this.socket?.send(JSON.stringify({ connected: true }))
    this.isConnected = true
    this.error = null
    this.reconnectAttempts = 0
    console.log('WebSocket connected successfully')
  }

  handleClose = (event: CloseEvent) => {
    this.isConnected = false
    console.log('WebSocket closed:', event.code, event.reason)
    this.attemptReconnect()
  }

  handleError = (event: Event) => {
    this.error = 'WebSocket error occurred'
    console.error('WebSocket error:', event)
  }

  handleMessage = (event: MessageEvent) => {
    const message = JSON.parse(event.data)
    this.handleMessageData(message)
  }

  handleMessageData(message: any) {
    console.log('WebSocket message:', message)
    // ... existing message handling logic ...
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000)
      this.reconnectTimeout = window.setTimeout(() => {
        console.log(
          `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
        )
        this.connect()
      }, delay)
    } else {
      console.error('Max reconnect attempts reached. Please refresh the page.')
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close()
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }
  }
}
