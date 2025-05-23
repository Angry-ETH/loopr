import { StateCreator } from 'zustand'
import { StoreState } from './index'

export enum ModalType {
  WALLET_CONNECT,
  L2_WALLET_OVERVIEW,
  IMPORT_TOKEN,
  ADD_TEAM_ALLOCATION_HOLDER,
  TRANSACTION,
}

export type ApplicationSlice = ApplicationState & ApplicationActions

interface ApplicationState {
  modal: ModalType | null
}

interface ApplicationActions {
  isModalOpened: (modal: ModalType) => boolean

  openModal: (modal: ModalType) => void

  closeModals: () => void

  toggleModal: (modal: ModalType) => void
}

export const createApplicationSlice: StateCreator<
  StoreState,
  [['zustand/immer', never]],
  [],
  ApplicationSlice
> = (set, get) => ({
  modal: null,

  isModalOpened: (modal) => get().modal === modal,

  openModal: (modal) => set({ modal }),

  closeModals: () => set({ modal: null }),

  toggleModal: (modal) =>
    set((state) => ({
      modal: state.modal === modal ? null : modal,
    })),
})
