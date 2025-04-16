import React from 'react'

import Web3StatusContent from './Web3Status'
import { Flex } from 'antd'

export function Header() {
  return (
    <Flex justify="space-between" align="center">
      <div style={{ fontWeight: 'bold' }}>Loopr</div>
      <Web3StatusContent />
    </Flex>
  )
}
