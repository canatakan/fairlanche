import React from 'react'

const BlockchainTxContainer = ({tx,handleAddCustomNetwork}) => {
  return (
    <div className='flex flex-col w-full mx-auto border-2 border-gray-300 rounded-xl px-8 py-6 mb-16'>
        <h1 className='text-lg font-bold text-center'>{tx}</h1>
        <button className="bg-red-500 text-white px-4 py-2 rounded mt-4" onClick={handleAddCustomNetwork} >Add Blockchain To Metamask</button>
    </div>
  )
}

export default BlockchainTxContainer