import React from 'react'
import { Card, Flex, Typography, Button, Progress } from 'antd'
import { useSSBTBalance, useSublimate, useIsCooldownFinished } from 'src/hooks/useSSBT'

export function SublimateCard() {
  const { Title } = Typography

  const { balance, loading: loadingSSBT } = useSSBTBalance()
  const { isReady, isLoading: loadingCooldown } = useIsCooldownFinished()
  const { write, isPending } = useSublimate()

  const handleClick = () => {
    if (isReady) write()
  }

  return (
    <Card>
      <Flex justify="space-between" align="middle">
        <Title level={4} style={{ margin: 0 }}>
          {loadingSSBT ? 'Loading...' : `${balance.toString()} SSBT`}
        </Title>
        <Button type="primary" onClick={handleClick} loading={isPending} disabled={!isReady}>
          {isReady ? 'Sublimate' : 'Cooling...'}
        </Button>
      </Flex>
      <Progress
        percent={isReady ? 100 : 50}
        percentPosition={{ align: 'start', type: 'inner' }}
        size={['100%', 20]}
        strokeColor="#B7EB8F"
        className="base"
      />
    </Card>
  )
}
