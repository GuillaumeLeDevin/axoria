import React from 'react'

export default function Loading() {
  return (
    <div className='absolute top-0 left-0 w-full h-full flex items-center justify-center'>
        <span className='animate-spin block h-14 w-14 mb-44 border-4 border-gray-300 border-t-blue-500 rounded-full'></span>
    </div>
  )
}
