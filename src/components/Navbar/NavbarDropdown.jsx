"use client"

import React from 'react'
import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logout, isPrivatePage } from '@/lib/serverActions/session/sessionServerActions'
import { useAuth } from '@/app/AuthContext'

export default function NavbarDropdown({userId}) {

    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)
    const router = useRouter()

    const { setIsAuthenticated } = useAuth()

    useEffect(() => {
        function handleClickOutside(event) {
            if(!dropdownRef.current.contains(event.target)) {
                closeDropdown()
            }
        }
        document.addEventListener("click", handleClickOutside)

        return () => {
            document.removeEventListener("click", handleClickOutside)
        }
    }, [])

    function toggleDropdown() {
        setIsOpen(!isOpen)
    }

    async function handleLogOut() {
        const result = await logout()
        if(result.success) {
            setIsAuthenticated({loading: false, isConnected: false, userId: null})
            if(await isPrivatePage(window.location.pathname)) {
                router.push("/signin")
            }
        }

    }
    function closeDropdown() {
        setIsOpen(false)
    }

  return (
    <div ref={dropdownRef} className='ml-4 relative'>
        <button
        onClick={toggleDropdown}
        className='flex'>
            <Image
            src="/icons/user.svg"
            alt=""
            width={24}
            height={24}
            />
        </button>
        {isOpen && (
            <ul
            className="absolute right-0 top-10 w-[250px] border-b border-x border-zinc-300">
                <li
                onClick={closeDropdown}
                className='bg-slate-50 hover:bg-slate-200 border-b border-slate-300'>
                    <Link
                    className='block p-4'
                    href={`/dashboard/${userId}`}>
                        Dashboard
                    </Link>
                </li>
                <li className='bg-slate-50 hover:bg-slate-200 hover:underline'>
                    <button
                    onClick={handleLogOut}
                    className='w-full text-left block p-4'
                    >
                        Log Out
                    </button>
                </li>
            </ul>
        )}
    </div>
  )
}
