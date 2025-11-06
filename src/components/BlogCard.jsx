import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function BlogCard({post}) {

    // console.log("console:",post)

  return (
    <li className="bg-white rounded-sm shadow-md hover:shadow-xl border hover:border-zinc-300">
        <Link href={`/article/${post.slug}`}>
            <Image
              src={post.coverImageUrl?post.coverImageUrl:"/download.jpeg"}
              alt={post.title}
              width={340}
              height={190}
              className="w-full rounded-t-sm object-cover h-48"
            />
        </Link>
            <div className="pt-5 px-5 pb-7">
              <div className="flex items-baseline gap-x-4 text-xs">
                <time
                className="text-gray-500 text-sm"
                dateTime={new Date().toISOString()}
                >
                  {new Date().toLocaleDateString("en-UK", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  })}
                </time>
                <Link href={`/categories/author/${post.author.normalizedUsername}`} className="ml-auto text-base text-gray-700 hover:text-gray-600 whitespace-nowrap truncate">
                  {post.author.username}
                </Link>
              </div>
              <Link
              className="inline-block mt-6 text-xl font-semibold text-zinc-800 hover:text-zinc-600"
              href={`/article/${post.slug}`}>
                {post.title}
              </Link>
            </div>
          </li>
  )
}
