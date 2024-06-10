'use client'

import React, { useState } from 'react'
import { DepositWithdraw } from './DepositWithdraw'
import { PauseUnpause } from './PauseUnpause'
import YieldUpdate from './YieldUpdate'


export default function SecondRow() {
  const [active, setActive] = useState(false)

  return (
    <div className='w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3  gap-8 '>
      <DepositWithdraw />
      <PauseUnpause active={active} setActive={setActive} />
      <YieldUpdate />
    </div>
  )
}

