import React, { useCallback } from 'react'
import { useDisconnect, useNetwork } from '@starknet-react/core'
import { Button, Modal } from 'antd'

import { useCloseModal, useL2WalletOverviewModal } from 'src/hooks/useModal'
import Portal from '../common/Portal'

interface WalletOverviewModalProps {
  open: boolean
  chainLabel?: string
  onDisconnect: () => void
  onClose: () => void
}

function WalletOverviewModal({
  open,
  chainLabel = 'StarkNet',
  onDisconnect,
  onClose,
}: WalletOverviewModalProps) {
  const handleDisconnect = useCallback(() => {
    onDisconnect()
    onClose()
  }, [onDisconnect, onClose])

  return (
    <Portal>
      <Modal
        title={`${chainLabel} Wallet`}
        open={open}
        onCancel={onClose}
        footer={null}
      >
        <Button danger onClick={handleDisconnect}>
          Disconnect
        </Button>
      </Modal>
    </Portal>
  )
}

export function L2WalletOverviewModal() {
  const [isOpen, close] = useL2WalletOverviewModal()
  const { disconnect } = useDisconnect()
  const { chain } = useNetwork()

  if (!isOpen) return null

  return (
    <WalletOverviewModal
      open={isOpen}
      chainLabel={chain?.name}
      onDisconnect={disconnect}
      onClose={close}
    />
  )
}
