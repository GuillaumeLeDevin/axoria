"use server"

import slugify from "slugify"
import bcrypt from "bcryptjs"
import {User} from "@/lib/models/user"
import { connectToDB } from "@/lib/utils/db/connectToDB"
import { Session } from "@/lib/models/session"
import { cookies } from "next/headers"
import AppError from "@/lib/utils/errorHandlings/customError"
import { revalidateTag } from "next/cache"


export async function register(formData) {
    const {username, email, password, passwordRepeat} = Object.fromEntries(formData)

    if(typeof username !== "string" || username.trim().length < 3) {
        throw new AppError("Username must be at least 3 characters long")
    }

    if(typeof password !== "string" || password.length < 6) {
        throw new AppError("Password must be at least 6 characters long")
    }

    if(password !== passwordRepeat) {
        throw new AppError("Passwords do not match")
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if(typeof email !== "string" || !emailRegex.test(email.trim())) {
        throw new AppError("Invalid email address")
    }

    try {
        await connectToDB()

        const user = await User.findOne({
            $or: [{ username }, { email }]
        })

        if(user) {
            throw new AppError(user.username === username ? "Username already taken" : "Email already registered")
        }

        const normalizedUsername = slugify(username, {lower: true, strict: true})

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            username,
            normalizedUsername,
            email,
            password: hashedPassword
        })

        await newUser.save()

        return { success: true}
    }
    catch(error) {

        if(error instanceof AppError) {
            throw error
        }

        throw new Error("Something went wrong while registering the user")
    }
}

export async function login(formData) {
    const { username, password } = Object.fromEntries(formData)

    try {

        if(typeof username !== "string") {
            throw new AppError("Invalid input format")
        }
        
        if(typeof password !== "string") {
            throw new AppError("Invalid input format")
        }

        await connectToDB()

        const user = await User.findOne({ username: username })

        if (!user) {
            throw new Error("Invalid credentials")
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            throw new Error("Invalid email or password")
        }

        let session;
        const existingSession = await Session.findOne({
            userId: user._id,
            expiresAt: { $gt: new Date() }
        })
        if (existingSession) {
            session = existingSession
            existingSession.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Extend session by 7 days
            await existingSession.save()
        } else {
            session = new Session({
                userId: user._id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Session expires in 7 days
            })
            await session.save()
        }

        const cookieStore = await cookies()
        cookieStore.set({
            name: "sessionId",
            value: session._id.toString(),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
            sameSite: "lax",  // CSRF protection against cross-site requests
        })

        revalidateTag("auth-session")
        return { success: true, userId: user._id.toString() }
    }
    catch(err) {
        throw new Error(err.message || "Something went wrong while logging in the user")
    }
}

export async function logout() {

    const cookieStore = await cookies()
    const sessionId = cookieStore.get("sessionId")?.value

    try {
        await Session.findByIdAndDelete(sessionId)
        cookieStore.set("sessionId", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 0,
            sameSite: "strict"
        })
        revalidateTag("auth-session")
        return { success: true }

    } catch (error) {
        throw new Error(error.message || "Something went wrong while logging out the user")
    }
}

export async function isPrivatePage(pathname) {
    const privateSegments = ["/dashboard", "/settings/profile"]

    return privateSegments.some(segment => pathname.startsWith(segment))

}

export async function SAsessionInfo(){

  const cookieStore = await cookies()
  const sessionId = cookieStore.get("sessionId")?.value
  if(!sessionId) {
    return {success: false, userId: null}
  }
  
  await connectToDB()
  
  const session = await Session.findById(sessionId)
  
  if(!session || session.expiresAt < new Date()) {
    return {success: false, userId: null}
  }

  const user = await User.findById(session.userId) 

  if(!user) {
    return {success: false, userId: null}
  }

  return {success: true, userId: user._id.toString()}
}