import Link from "next/link"
import { connectToDB } from "@/lib/utils/db/connectToDB"
import { getPosts } from "@/lib/serverMethods/blog/postMethods"
import BlogCard from "@/components/BlogCard"

// const posts = [
//   {
//     author: "John Doe",
//     title: "5 CSS Tricks"
//   },
//   {
//     author: "Daniel Smith",
//     title: "Understanding JavaScript Closures"
//   },
//   {
//     author: "Gabriel White",
//     title: "How to set up Typescript"
//   },
  
// ]

export const revalidate = 60 // Revalidate this page every 60 seconds

export default async function Home() {

  const posts = await getPosts()

  return (
    <div className="u-main-container u-padding-content-container">
      <h1 className="t-main-title">Stay up-to-date with AXORIA</h1>
      <p className="t-main-subtitle">Tech news and useful knowledge </p>

      <p className="text-md text-zinc-900">Latest articles</p>
      <ul className="u-articles-grid">
        {posts.map((post, index) => (
          <BlogCard key={index} post={post} />
        ))}
      </ul>
    </div>
  )
}
