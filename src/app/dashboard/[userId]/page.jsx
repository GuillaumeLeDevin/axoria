import React from 'react'
import Link from 'next/link'
import { getPost } from '@/lib/serverMethods/blog/postMethods'
import { getUserPostsFromUserID } from '@/lib/serverMethods/blog/postMethods'
import DeletePostButton from './components/DeletePostButton'

export default async function Page({ params }) {

  const { userId } = await params

  const posts = await getUserPostsFromUserID(userId)

  return (
    <main className='u-main-container u-padding-content-container'>
      <h1 className='text-3xl mb-5'>Dashboard - Your articles</h1>

      <ul>
        {posts.length > 0 ? (
          posts.map(post => (
            <li
            key={post._id}
            className='flex items-center mb-2 bg-slate-50 py-2 pl-4 rounded'>

              <Link href={`/article/${post.slug}`} className='mr-auto hover:underline hover:underline-offset-2 text-violet-600 text-lg'>
                {post.title}
              </Link>

              <Link href={`/dashboard/edit/${post._id}`} className='bg-indigo-500 hover:bg-indigo-700 hover:no-underline min-w-24 text-center text-white font-bold py-2 px-4 rounded mr-2'>Edit</Link>

              <DeletePostButton id={post._id.toString()}/>
            </li>
          ))
        ) : (
          <p>You haven't written any articles yet.</p>
        )}
      </ul>
    </main>
  )
}
