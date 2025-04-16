import { Connector, useConnect } from '@starknet-react/core'
import { Image } from 'antd'
import React from 'react'

import * as styles from './Option.css'

interface OptionProps {
  connection: Connector
  activate: () => void
}

function Option({ connection, activate }: OptionProps) {
  const icon = connection.icon.dark
  const isSvg = icon?.startsWith('<svg')

  return (
    <div className={styles.option} onClick={activate}>
      <div className={styles.icon}>
        {isSvg ? (
          <div
            dangerouslySetInnerHTML={{ __html: icon ?? '' }}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <Image
            width={32}
            height={32}
            preview={false}
            src={icon}
            style={{ borderRadius: 4 }}
          />
        )}
      </div>
      <div className={styles.name}>{connection.name}</div>
    </div>
  )
}

interface L2OptionProps {
  connection: Connector
}

export function L2Option({ connection }: L2OptionProps) {
  const { connect } = useConnect()
  const activate = () => connect({ connector: connection })

  return <Option connection={connection} activate={activate} />
}
