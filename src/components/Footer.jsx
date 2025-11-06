import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className='text-center p-4 bg-white border-t border-t-zinc-300'>
        <Link href="#" target="_blank" rel="noopener noreferrer" className='hover:text-blue-500 hover:underline'> Axoria - All rights reserved</Link>
    </footer>
  )
}
