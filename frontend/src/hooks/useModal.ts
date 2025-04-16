import { useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useBoundStore } from 'src/state'
import { ModalType } from 'src/state/application'

export function useCloseModal(): () => void {
  const { closeModals } = useBoundStore(
    useShallow((state) => ({ closeModals: state.closeModals }))
  )
  return closeModals
}

function useModal(modalType: ModalType): [boolean, () => void] {
  const { isModalOpened, toggleModal } = useBoundStore(
    useShallow((state) => ({
      isModalOpened: state.isModalOpened,
      toggleModal: state.toggleModal,
    }))
  )

  const isOpen = isModalOpened(modalType)
  const toggle = useCallback(() => toggleModal(modalType), [modalType, toggleModal])

  return [isOpen, toggle]
}

export const useWalletConnectModal = () => useModal(ModalType.WALLET_CONNECT)

export const useL2WalletOverviewModal = () => useModal(ModalType.L2_WALLET_OVERVIEW)

export const useImportTokenModal = () => useModal(ModalType.IMPORT_TOKEN)

export const useAddTeamAllocationHolderModal = () => useModal(ModalType.ADD_TEAM_ALLOCATION_HOLDER)

export const useTransactionModal = () => useModal(ModalType.TRANSACTION)
