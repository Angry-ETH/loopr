import React from 'react'
import { useAccount } from '@starknet-react/core'
import { Button } from 'antd'

import { useWalletConnectModal, useL2WalletOverviewModal } from 'src/hooks/useModal'
import { shortenL2Address } from 'src/utils/address'

import * as Icons from '../theme/Icons'
import WalletConnectModal from './WalletModal/Connect'
import { L2WalletOverviewModal } from './WalletModal/Overview'

function Web3StatusContent() {
  const { address: l2Account } = useAccount()

  const [, toggleWalletConnectModal] = useWalletConnectModal()
  const [, toggleL2WalletOverviewModal] = useL2WalletOverviewModal()

  const isConnected = !!l2Account

  return isConnected ? (
    <Button onClick={toggleL2WalletOverviewModal} icon={<Icons.Starknet />}>
      {shortenL2Address(l2Account)}
    </Button>
  ) : (
    <Button type="primary" onClick={toggleWalletConnectModal}>
      Connect Wallet
    </Button>
  )
}

export default function Web3Status() {
  return (
    <>
      <Web3StatusContent />
      <WalletConnectModal />
      <L2WalletOverviewModal />
    </>
  )
}
