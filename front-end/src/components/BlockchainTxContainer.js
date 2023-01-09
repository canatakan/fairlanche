import React from 'react'

const BlockchainTxContainer = ({tx}) => {
  return (
    <div className='w-full mx-auto border rounded-md flex items-start px-8 py-6 mb-6'>
        <h1 className='text-lg'>Blockchain:{tx}</h1>
    </div>
  )
}

export default BlockchainTxContainer