"use client"
import React from 'react'
import Link from 'next/link'
import NavbarDropdown from './NavbarDropdown'
import { useAuth } from '@/app/AuthContext'
import Image from 'next/image'

export default function Navbar() {

    const { isAuthenticated } = useAuth()

  return (
    <nav className='fixed z-10 w-full bg-slate-50 border-b border-b-zinc-300'>
        <div className='u-main-container flex py-4 gap-1'>
            <Link
                className='cursor-pointer mr-2 text-zinc-900'
                href="/">AXORIA
            </Link>
            <Link 
                className='cursor-pointer mx-2 text-zinc-900 mr-auto'
                href="/categories">Categories
            </Link>

            {isAuthenticated.loading && (
                <div>
                    <Image src="/icons/loader.svg" alt="" width={24} height={24} />
                </div>
            )}

            {isAuthenticated.isConnected && (
                <>
                    <Link 
                        className='cursor-pointer text-zinc-900'
                        href="/dashboard/create">Add an article 
                    </Link>📋
                    <NavbarDropdown userId={isAuthenticated.userId}/>
                </>
            )} 
            {!isAuthenticated.isConnected && !isAuthenticated.loading &&  (
                <>
                    <Link 
                        className='cursor-pointer ml-2 text-zinc-900'
                        href="/signin">Sign In
                    </Link>🔓
                    <Link 
                        className='cursor-pointer ml-2 text-zinc-900'
                        href="/signup">Sign Up
                    </Link>🔑
                </>
            )}
        </div>
    </nav>
  )
}
