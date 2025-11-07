"use client"
import { useRef } from "react"
import { login } from "@/lib/serverActions/session/sessionServerActions"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/AuthContext"

export default function Page() {
  const { setIsAuthenticated } = useAuth()
  const serverInfoRef = useRef()
  const submitButtonRef = useRef()

  const router = useRouter()

  async function handleSubmit(e) {
    event.preventDefault()
    serverInfoRef.current.textContent = ""
    submitButtonRef.current.disabled = true
    submitButtonRef.current.textContent = "Loading..."

    try {
        const result = await login(new FormData(e.target))
        console.log(result)
        if(result.success) {
          setIsAuthenticated({loading: false, isConnected: true, userId: result.userId})
            router.push("/")
        }
    }
    catch(err) {
        serverInfoRef.current.textContent = err.message
        submitButtonRef.current.disabled = false
        submitButtonRef.current.textContent = "Submit"
    }

  }

  return (
    <main className='max-w-md mx-auto mt-36'>
      <h1 className='text-4xl'>Sign In</h1>
      <form
      onSubmit={handleSubmit}
      className='flex flex-col gap-4 mt-6'
      >
        <label
        className='f-label'
        htmlFor="username"
        >
          Pseudo
        </label>
        <input required className='f-auth-input' type="text" id="username" name="username" placeholder='Your pseudo'/>

        <label
        className='f-label'
        htmlFor="password"
        >
          Password
        </label>
        <input required className='f-auth-input'type="password" id="password" name="password" placeholder='Your password'/>


        <button
        ref={submitButtonRef}
        className='f-button-valid mt-6 mb-10'>
            Submit
        </button>

        <p
        ref={serverInfoRef}
        className=' text-center text-red-600 mb-5'>
        </p>
      </form>
    </main>
  )
}
