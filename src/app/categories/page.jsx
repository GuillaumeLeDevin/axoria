import { getTags } from '@/lib/serverMethods/blog/tagMethods'
import Link from 'next/link'
import React from 'react'

export const revalidate = 60 // Revalidate this page every 60 seconds

export default async function page() {

    const tags = await getTags()

  return (
    <main className='u-main-container u-padding-content-container'>
        <h1 className='t-main-title'>All Categories</h1>
        <p className='t-main-subtitle'>Find articles sorted by category tag</p>

        <ul className='u-articles-grid'>
            {tags.length > 0 ? (
                tags.map( tag => (
                    <li
                    key={tag._id}
                    className='bg-white hover:bg-gray-50 border rounded shadow-md hover:shadow-xl'>
                        <Link
                        href={`/categories/tag/${tag.slug}`}
                        className='p-4 pb-6 flex items-baseline text-lg hover:!no-underline'>
                              <span className='font-semibold hover:underline'>#{tag.name}</span>
                            <span
                            className='ml-auto '>
                              Articles count: <span className='font-semibold'>{tag.postsCount}</span>
                            </span>
                        </Link>
                    </li>
                ))
            ) : (
                <p>No categories found.</p>
            )}
        </ul>
    </main>
  )
}
