// src/stores/StoreContext.ts
import React from 'react'
import { RootStore } from './RootStore'

export const StoreContext = React.createContext<RootStore | null>(null)

export const StoreProvider: React.FC<{
  store: RootStore
  children: React.ReactNode
}> = ({ store, children }) => {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}
