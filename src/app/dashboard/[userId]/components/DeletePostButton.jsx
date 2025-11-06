"use client"
import React from 'react'
import { deletePost } from '@/lib/serverActions/blog/postServerActions'

export default function DeletePostButton({id}) {
  return (
    <button
    onClick={() => deletePost(id)}
    className='bg-red-600 hover:bg-red-700 text-white min-w-24 font-bold py-2 px-4 mr-2 rounded'>
        Delete
    </button>
  )
}
