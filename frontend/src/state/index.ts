import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import { ApplicationSlice, createApplicationSlice } from './application'

export type StoreState = ApplicationSlice

export const useBoundStore = create<StoreState>()(
  persist(
    immer<StoreState>((...a) => ({
      ...createApplicationSlice(...a),
    })),
    {
      name: 'unruggable-state-storage-v0.1.6',
    },
  ),
)
