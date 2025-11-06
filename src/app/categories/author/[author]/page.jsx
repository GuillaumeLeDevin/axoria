import React from 'react'
import { getPostsByAuthor } from '@/lib/serverMethods/blog/postMethods';
import BlogCard from '@/components/BlogCard';

export const revalidate = 60 // Revalidate this page every 60 seconds

export default async function page({params}) {
    const {author} = await params
    const postsData = await getPostsByAuthor(author)
    console.log("post from author:", postsData)

  return (
    <main className='u-main-container u-padding-content-container'>
        <h1 className='t-main-title'>🏷️ Posts by: {postsData.author.username}</h1>
        <p className='t-main-subtitle'>All posts by this author</p>
        <p className='mr-4 text-md text-zinc-900'>Latest articles</p>
        <ul className='u-articles-grid'>
            {postsData.posts.length > 0 ? (
                postsData.posts.map( post => (
                    <BlogCard
                        key={post._id}
                        post={post}
                    />
                ))
            ) : (
                <p>No posts found by this author.</p>
            )}
        </ul>
    </main>
  )
}