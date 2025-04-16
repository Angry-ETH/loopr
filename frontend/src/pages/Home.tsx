import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAccount } from '@starknet-react/core'
import { Flex, Layout } from 'antd'

import { useEffect, useMemo } from 'react'
import { isValidL2Address } from 'src/utils/address' // 你之前定义的地址校验工具

import { Header as CustomHeader } from '../components/Header'
import { SublimateCard } from '../components/SublimateCard'
import { UserCard } from '../components/UserCard'

const { Header, Footer, Content } = Layout

const layoutStyle = { borderRadius: 8, overflow: 'hidden' }
const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#fff',
  height: 64,
  paddingInline: 48,
  lineHeight: '64px',
}
const contentStyle: React.CSSProperties = {
  textAlign: 'center',
  lineHeight: '120px',
  color: '#fff',
  maxWidth: '1200px',
  margin: '10px auto',
}
const footerStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#fff',
}

export default function HomePage() {
  const navigate = useNavigate()
  const { address: currentAddress } = useAccount()
  const { address: targetParam } = useParams()

  const isValid = !targetParam || isValidL2Address(targetParam)
  const targetAddress = useMemo(() => targetParam || currentAddress, [targetParam, currentAddress])

  useEffect(() => {
    if (targetParam && !isValidL2Address(targetParam)) {
      navigate('/')
    }
  }, [targetParam, navigate])

  return (
    <Layout style={layoutStyle}>
      <Header style={headerStyle}><CustomHeader /></Header>
      <Content>
        <Flex vertical style={contentStyle}>
          {targetAddress && isValid && <UserCard target={targetAddress} />}
          <SublimateCard />
        </Flex>
      </Content>
      <Footer style={footerStyle}>Footer</Footer>
    </Layout>
  )
}
