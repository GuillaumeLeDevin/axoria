import { connectToDB } from "@/lib/utils/db/connectToDB";
import { Post } from "@/lib/models/post";
import { notFound } from "next/navigation";
import { Tag } from "@/lib/models/tag";
import { User } from "@/lib/models/user";

export const dynamic = "force-static" // 

export async function getPost(slug) {
  await connectToDB()

  const post = await Post.findOne({ slug })
  .populate({
    path: "author",
    select: "username normalizedUsername",
    options: { strictPopulate: false } // To avoid deprecation warning
  }).populate({
    path: "tags",
    select: "name slug"
  })
  .lean()

  if (!post) return null

  const safePost = JSON.parse(JSON.stringify(post));

  return safePost;
}


export async function getPosts() {
  await connectToDB()
  const posts = await Post.find({})

  return posts
}

export async function getUserPostsFromUserID(userId) {
  await connectToDB()

  const posts = await Post.find({author: userId}).select("title _id slug")

  return posts
}

export async function getPostsByTag(tagSlug) {

  await connectToDB()

  const tag = await Tag.findOne({slug: tagSlug})
  if(!tag) {
    notFound()
  }

  const posts = await Post.find({tags: tag._id})
  .populate({
    path: "author",
    select: "username"
  })
  .select("title coverImageUrl slug createdAt")
  .sort({createdAt: -1})

  return posts
}



export async function getPostsByAuthor(normalizedUsername) {

  await connectToDB()

  const author = await User.findOne({normalizedUsername})
  if(!author) {
    notFound()
  }

  const posts = await Post.find({author: author._id})
  .populate({
    path: "author",
    select: "username normalizedUsername"
  })
  .select("title coverImageUrl slug createdAt")
  .sort({createdAt: -1})

  return {author, posts}
}

export async function getPostForEdit(id){
  await connectToDB()
  
  const post = await Post.findOne({ _id: id })
  .populate({
    path: "author",
    select: "username normalizedUsername",
    options: { strictPopulate: false } // To avoid deprecation warning
  })
  .populate({
    path: "tags",
    select: "name slug"
  })
  .lean()

  if (!post) return null

  const safePost = JSON.parse(JSON.stringify(post));

  return safePost;
}