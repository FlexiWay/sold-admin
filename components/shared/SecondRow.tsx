'use client'

import React, { useState } from 'react'
import { DepositWithdraw } from './DepositWithdraw'
import { PauseUnpause } from './PauseUnpause'


export default function SecondRow() {
  const [active, setActive] = useState(false)

  return (
    <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2  gap-8 '>
      <DepositWithdraw />
      <PauseUnpause active={active} setActive={setActive} />
    </div>
  )
}
