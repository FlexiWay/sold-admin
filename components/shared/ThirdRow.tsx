import React from 'react'
import WhitelistUpdate from './WhitelistUpdate'
import AuthorityUpdate from './AuthorityUpdate'
import GateKeeperUpdate from './AuthorityUpdate'
import AdminUpdate from './AdminUpdate'
import OwnerUpdate from './OwnerUpdate'

export default function ThirdRow() {
  return (
    <>
      <div className="w-full flex items-center justify-start">
        <span className="text-xs opacity-50 uppercase">Update</span>
      </div>
      <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4  gap-8'>
        <WhitelistUpdate />
        <GateKeeperUpdate />
        {/* admin */}
        <AdminUpdate />
        {/* owner */}
        <OwnerUpdate />
      </div>
    </>
  )
}
