import React from 'react'
import { getPostsByTag } from '@/lib/serverMethods/blog/postMethods';
import BlogCard from '@/components/BlogCard';

export const revalidate = 60 // Revalidate this page every 60 seconds

export default async function page({params}) {
    const {tag} = await params
    const posts = await getPostsByTag(tag)
    console.log("post from tag:", posts)

  return (
    <main className='u-main-container u-padding-content-container'>
        <h1 className='t-main-title'>🏷️ Posts tagged with: #{tag}</h1>
        <p className='t-main-subtitle'>All posts tagged with it</p>
        <p className='mr-4 text-md text-zinc-900'>Latest articles</p>
        <ul className='u-articles-grid'>
            {posts.length > 0 ? (
                posts.map( post => (
                    <BlogCard
                        key={post._id}
                        post={post}
                    />
                ))
            ) : (
                <p>No posts found for this tag.</p>
            )}
        </ul>
    </main>
  )
}