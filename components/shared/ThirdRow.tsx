import React from 'react'
import WhitelistUpdate from './WhitelistUpdate'
import AuthorityUpdate from './AuthorityUpdate'

export default function ThirdRow() {
  return (
    <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2  gap-8'>
      <WhitelistUpdate />
      <AuthorityUpdate />
    </div>
  )
}
