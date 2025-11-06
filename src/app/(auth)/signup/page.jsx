"use client"

import Link from 'next/link'
import React from 'react'
import { useRef } from 'react'
import { register } from '@/lib/serverActions/session/sessionServerActions'
import { useRouter } from 'next/navigation'

export default function page() {

    const serverInfoRef = useRef(null)
    const submitButtonRef = useRef(null)

    const router = useRouter()

    async function handleSubmit(event) {
        event.preventDefault()

        serverInfoRef.current.classList.add("hidden")
        serverInfoRef.current.textContent = ""
        submitButtonRef.current.textContent = "Submitting..."
        submitButtonRef.current.disabled = true

        try {
            const result = await register(new FormData(event.target))

            if(result.success) {
                submitButtonRef.current.textContent = "Account created! ✅"

                let countdown = 3
                serverInfoRef.current.classList.remove("hidden")
                // serverInfoRef.current.classList.add("text-green-600")
                serverInfoRef.current.textContent = `Account created successfully! You can now sign in. Redirecting in ${countdown}`

                const intervalId = setInterval(() => {
                    countdown--
                    serverInfoRef.current.textContent = `Account created successfully! You can now sign in. Redirecting in ${countdown}`
                    if(countdown === 0) {
                        clearInterval(intervalId)
                        router.push("/signin")
                    }
                }, 1000)
            }
        }
        catch (error) {
            submitButtonRef.current.textContent = "Submit"
            submitButtonRef.current.disabled = false
            serverInfoRef.current.textContent = error.message
            serverInfoRef.current.classList.remove("hidden")
        }

    }

  return (
    <main className='max-w-md mx-auto mt-36'>
        <h1 className='text-4xl'>Sign Up</h1>
        <form
        onSubmit={handleSubmit}
        className='flex flex-col gap-4 mt-6'>
            <label className='f-label' htmlFor="username">Name<span className='text-red-500'>*</span></label>
            <input required className='f-auth-input' type="text" id="username" placeholder='Name or Pseudo' name='username' />

            <label className='f-label' htmlFor="email">Email<span className='text-red-500'>*</span></label>
            <input required className='f-auth-input' type="email" id="email" placeholder='Email' name='email' />

            <label className='f-label' htmlFor="password">Password<span className='text-red-500'>*</span></label>
            <input required className='f-auth-input' type="password" id="password" placeholder='Password' name='password' />

            <label className='f-label' htmlFor="passwordRepeat">Confirm Password<span className='text-red-500'>*</span></label>
            <input required className='f-auth-input' type="password" id="passwordRepeat" placeholder='Confirm Password' name='passwordRepeat' />

            <button
            ref={submitButtonRef}
            className='f-button-valid my-10'>
                Submit
            </button>

            <p
            ref={serverInfoRef}
            className='hidden text-center text-red-600 mb-5'>
                Potential errors from server will be displayed here.
            </p>

            <Link className='mb-5 underline text-blue-600 block text-center' href="../signin">
                Already have an account? Sign In
            </Link>
        </form>

    </main>
  )
}
