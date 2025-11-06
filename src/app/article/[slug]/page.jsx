import { getPost } from '@/lib/serverMethods/blog/postMethods'
import Link from 'next/link'
import "./article-styles.css"
import 'prism-themes/themes/prism-vsc-dark-plus.css'
import Image from 'next/image'
import notFound from '@/app/not-found'

export default async function page({params}) {
    const {slug} = await params
    const post = await getPost(slug)
    console.log("This is the posts from Article:",post)

    if(!post) return notFound()

  return (
    <main className='u-main-container u-padding-content-container'>
        <h1 className='text-4xl'>{post.title}</h1>
        <p className="mb-6">
          By&nbsp;
          <Link 
          className='underline mr-4'
          href={`/categories/author/${post.author?.normalizedUsername || ''}`}>
            {post.author?.username || 'Unknown Author'}
          </Link>
          {post.tags.map(tag => (
            <Link
            key={tag.slug}
            className='mr-4 underline'
            href={`/categories/tag/${tag.slug}`}>
              #{tag.name}
            </Link>
          ))}
        </p>
        <Image
          src={post.coverImageUrl}
          alt={post.title}
          width={1280}
          height={720}
          className="mb-10"
        />
        <div
        className='article-styles'
        dangerouslySetInnerHTML={{__html: post.markdownHTMLResult}}>

        </div>
    </main>
  )
}
