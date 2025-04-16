import React, { useEffect } from 'react'
import { useAccount, useConnect } from '@starknet-react/core'
import { Modal, Button } from 'antd'

import { useWalletConnectModal } from 'src/hooks/useModal'
import Portal from '../common/Portal'
import { L2Option } from './Option'

function WalletConnectModalContent({
  isOpen,
  toggle,
}: {
  isOpen: boolean
  toggle: () => void
}) {
  const { address: l2Account } = useAccount()
  const { connectors } = useConnect()

  useEffect(() => {
    if (l2Account && isOpen) {
      toggle()
    }
  }, [l2Account, isOpen, toggle])

  return (
    <Modal
      title="Connect Wallet"
      open={isOpen}
      onOk={toggle}
      onCancel={toggle}
      footer={null}
    >
      {connectors
        .filter((connector) => connector.available())
        .map((connector) => (
          <L2Option key={connector.id} connection={connector} />
        ))}

      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Button type="primary" onClick={toggle}>
          Cancel
        </Button>
      </div>
    </Modal>
  )
}

export default function WalletConnectModal() {
  const [isOpen, toggle] = useWalletConnectModal()

  if (!isOpen) return null

  return (
    <Portal>
      <WalletConnectModalContent isOpen={isOpen} toggle={toggle} />
    </Portal>
  )
}
