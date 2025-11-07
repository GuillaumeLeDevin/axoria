import React from 'react'
import Link from 'next/link'
import "./error.scss"

export default function NotFound() {
  return (
    <div className='pt-44 bg-white'>
        <h1 className='text-4xl text-center mb-4'>404 - Page Not Found</h1>
        <div className='mx-auto mb-4' >
            <img className='w-96 h-56 justify-self-center object-cover object-bottom' src="/404.gif" alt="" />
        </div>

        <Link href="/" className='block underline w-full text-center pb-6'>Go back to home</Link>
    </div>
  )
}
