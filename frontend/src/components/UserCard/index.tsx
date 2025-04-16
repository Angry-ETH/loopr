
import React from 'react'
import { useAccount } from '@starknet-react/core'
import { Avatar, Card, Flex, Button, Typography, Space } from 'antd'
import './style.css'
import { useERC20Balance } from 'src/hooks/useSSBT'
import { useFolloweesCount, useIsFollowing, useFollow } from 'src/hooks/useSocial'

export function UserCard({ target }: { target: string }) {
  const { address: current } = useAccount()
  const { Meta } = Card
  const { Text } = Typography

  const { balance } = useERC20Balance()
  const { count } = useFolloweesCount(target)
  const { isFollowing } = useIsFollowing(target)
  const { write, isPending } = useFollow(target)

  const isSelf = current?.toLowerCase() === target.toLowerCase()

  const handleFollow = async () => {
    if (!isFollowing && !isPending) {
      await write?.()
    }
  }
  const avatarUrl = `https://api.dicebear.com/7.x/miniavs/svg?seed=${target.toLowerCase()}`

  return (
    <Card className='base'>
      <Flex justify="space-between" align="middle">
        <Meta
          avatar={<Avatar size={64} src={avatarUrl} />}
          title={target}
          description={`${balance} LOOPR`}
          style={{ textAlign: 'left', marginRight: '10px' }}
        />
        {!isSelf && !isFollowing && (
          <Button type="primary" loading={isPending} onClick={handleFollow}>
            Follow
          </Button>
        )}
      </Flex>
      <Space align="start" className='base'>
        <div><Text strong>{count}</Text> following</div>
        <div><Text strong>-</Text> followers</div> {/* todo */}
      </Space>
    </Card>
  )
}
