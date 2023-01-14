import React from 'react'

const BlockchainTxContainer = ({tx,handleAddCustomNetwork}) => {
  return (
    <div className='w-full mx-auto border rounded-md flex justify-between items-center px-8 py-6 mb-6'>
        <h1 className='text-lg'>Blockchain:{tx}</h1>
        <button className="bg-red-500 text-white px-4 py-2 rounded mt-4" onClick={handleAddCustomNetwork} >Add Custom Network</button>
    </div>
  )
}

export default BlockchainTxContainer