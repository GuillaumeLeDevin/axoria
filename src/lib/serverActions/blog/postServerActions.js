"use server"
import { connectToDB } from "@/lib/utils/db/connectToDB"
import { Post } from "@/lib/models/post"
import { Tag } from "@/lib/models/tag"
import slugify from "slugify"
import { marked } from "marked"
import { JSDOM } from "jsdom"
import createDOMPurify from "dompurify"
import Prism from "prismjs"
import  { markedHighlight } from "marked-highlight"
import "prismjs/components/prism-markup" 
import "prismjs/components/prism-css" 
import "prismjs/components/prism-javascript" 
import AppError from "@/lib/utils/errorHandlings/customError"
import { sessionInfo } from "@/lib/serverMethods/session/sessionMethods"
import crypto from "crypto"
import sharp from "sharp"
import { revalidatePath } from "next/cache"
import { areTagsSimilar, generateUniqueSlug } from "@/lib/utils/general/utils"

const window = new JSDOM("").window
const DOMPurify = createDOMPurify(window)

export async function addPost(formData){
    const {title, markdownArticle, tags, coverImage} = Object.fromEntries(formData)

    try {

        if( typeof title !== "string" || title.trim().length < 3) {
            throw new AppError("Invalid data")
        }
        if( typeof markdownArticle !== "string" || markdownArticle.trim().length === 0) {
            throw new AppError("Invalid data")
        }

        await connectToDB()

        const session = await sessionInfo()

        if(!session.success) {
            throw new AppError("Authentication required")
        }
 {/* ----------------------------------------------------------------------- */}
        // Gestion de l'upload d'image

        if(!coverImage || !(coverImage instanceof File)) {
            throw new AppError("Invalid data")
        }

        const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

        if(!validImageTypes.includes(coverImage.type)) {
            throw new AppError("Invalid image type")
        }

        const imageBuffer = Buffer.from(await coverImage.arrayBuffer())
        const { width, height } = await sharp(imageBuffer).metadata()
        if(width > 1280 || height > 720) {
            throw new AppError("Invalid image dimensions")
        }

        const uniqueFileName = `${crypto.randomUUID()}_${coverImage.name.trim()}`

        const uploadUrl = `${process.env.BUNNY_STORAGE_HOST}/${process.env.BUNNY_STORAGE_ZONE}/${uniqueFileName}`

        const publicImageUrl = `https://axoria-blog-educ.b-cdn.net/${uniqueFileName}`

        const response = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
                "AccessKey": process.env.BUNNY_STORAGE_API_KEY,
                "Content-Type": "application/octet-stream",
            },
            body: imageBuffer
        })

        if(!response.ok) {
            throw new AppError(`Image upload failed: ${response.statusText} and status code: ${response.status}`)
        }

 {/* ----------------------------------------------------------------------- */}
        // Gestion des tags

        if( typeof tags !== "string") {
            throw new AppError("Invalid tag data")
        }
        const tagNamesArray = JSON.parse(tags)
        
        if(!Array.isArray(tagNamesArray)) {
            throw new AppError("Tags must be a valid array.")
        }

        const tagIds = await Promise.all(tagNamesArray.map(async (tagName) => {

            const normalisedTagName = tagName.trim().toLowerCase()

            let tag = await Tag.findOne({name: normalisedTagName})

            if(!tag) {
                tag = await Tag.create({name: normalisedTagName, slug: slugify(normalisedTagName, {strict: true})})
            }

            return tag._id

        }))
 {/* ----------------------------------------------------------------------- */}
        // Gestion du markdown

        marked.use(
            markedHighlight({
                highlight: (code, language) => {
                    const validLanguage = Prism.languages[language] ? language : 'plaintext'

                    return Prism.highlight(code, Prism.languages[validLanguage], validLanguage)
                }
            })
        )

        let markdownHTMLResult = marked(markdownArticle)

        markdownHTMLResult = DOMPurify.sanitize(markdownHTMLResult)
        
        const newPost = new Post({
            title,
            markdownArticle,
            markdownHTMLResult,
            tags: tagIds,
            coverImageUrl: publicImageUrl,
            author: session.userId
        })


        const savedPost = await newPost.save()

        return {success: true, slug: savedPost.slug}
    }
    catch(error) {
        
        if(error instanceof AppError) {
            throw error
        }
        throw new AppError("Something went wrong while adding a new post")
    }
    
}

{/* ----------------------------------------------------------------------- */}
        // Gestion de l'edition d'article

export async function editPost(formData){

    const { postToEditStringified, title, markdownArticle, tags, coverImage } = Object.fromEntries(formData)

    const postToEdit = JSON.parse(postToEditStringified)

    try {

        await connectToDB()

        const session = await sessionInfo()
        if(!session.success) {
            throw new AppError("Authentication required")
        }

        const updatedData = {}
        
        if(typeof title !== "string") throw new AppError("Invalid data")
        if(title.trim() !== postToEdit.title) {
            updatedData.title = title.trim()
            updatedData.slug = await generateUniqueSlug(title)
        }

        if(typeof markdownArticle !== "string") throw new AppError("Invalid data")
        if(markdownArticle.trim() !== postToEdit.markdownArticle){
            updatedData.markdownHTMLResult = DOMPurify.sanitize(marked(markdownArticle))
            updatedData.markdownArticle = markdownArticle
        }

        if(typeof coverImage !== "object") throw new Error()

        if(coverImage.size > 0) {
        const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

        if (!validImageTypes.includes(coverImage.type)) {
            throw new Error()
        }

        const imageBuffer = Buffer.from(await coverImage.arrayBuffer())
        const {width, height} = await sharp(imageBuffer).metadata()
        if(width > 1280 || height > 720){
            throw new Error()
        }

        // Delete image
        const toDeleteImageFileName = postToEdit.coverImageUrl.split("/").pop()
        const deleteUrl = `${process.env.BUNNY_STORAGE_HOST}/${process.env.BUNNY_STORAGE_ZONE}/${toDeleteImageFileName}`

        const imageDeletionResponse = await fetch(deleteUrl, {
            method: "DELETE",
            headers: {"AccessKey": process.env.BUNNY_STORAGE_API_KEY}
        })

        if(!imageDeletionResponse.ok) {
            throw new AppError(`Error while deleting the image ${imageDeletionResponse.statusText}`)
        }

        // Upload new image
        const imageToUploadFileName = `${crypto.randomUUID()}_${coverImage.name}`
        const imageToUploadUrl = `${process.env.BUNNY_STORAGE_HOST}/${process.env.BUNNY_STORAGE_ZONE}/${imageToUploadFileName}`
        const imageToUploadPublicUrl = `https://axoria-blog-educ.b-cdn.net/${imageToUploadFileName}`


        const imageToUploadResponse = await fetch(imageToUploadUrl, {
            method: "PUT",
            headers: {
            "AccessKey": process.env.BUNNY_STORAGE_API_KEY,
            "Content-Type": "application/octet-stream"
            },
            body: imageBuffer
        })

        if(!imageToUploadResponse) {
            throw new Error(`Error while uploading the new image : ${imageToUploadResponse.statusText}`)
        }

        updatedData.coverImageUrl = imageToUploadPublicUrl
        }


        // Tags management
        if( typeof tags !== "string") {
            throw new AppError("Invalid tag data")
        }
        const tagNamesArray = JSON.parse(tags)
        
        if(!Array.isArray(tagNamesArray)) {
            throw new AppError("Tags must be a valid array.")
        }

        if(tagNamesArray.length > 0) {
            if(!areTagsSimilar(tagNamesArray, postToEdit.tags)) {
                const tagIds = await Promise.all(tagNamesArray.map(tag => findOrCreateTag(tag)))

                updatedData.tags = tagIds
            } 
        } else {
            updatedData.tags = []
        }

        if(Object.keys(updatedData).length === 0) {
            throw new AppError("No changes detected")
        }

        const updatedPost = await Post.findByIdAndUpdate(postToEdit._id, updatedData, { new: true })

        revalidatePath(`/article/${postToEdit.slug}`)

        return {success: true, slug: updatedPost.slug}
    }
    catch(error) {
        
        if(error instanceof AppError) {
            throw error
        }
        throw new AppError("Something went wrong while editing the post")
    }
}

{/* ----------------------------------------------------------------------- */}
        // Gestion de la suppression d'article

export async function deletePost(id){
    try {

        await connectToDB()

        const session = await sessionInfo()

        if(!session.success) {
            throw new AppError("Authentication required")
        }

        const postToDelete = await Post.findById(id)

        if(!postToDelete) {
            throw new AppError("Post not found")
        }

        if(postToDelete.author.toString() !== session.userId) {
            throw new AppError("You are not authorized to delete this post")
        }

        await Post.findByIdAndDelete(id)

        if(postToDelete.coverImageUrl) {
            const imageFileName = postToDelete.coverImageUrl.split("/").pop()
            const deleteUrl = `${process.env.BUNNY_STORAGE_HOST}/${process.env.BUNNY_STORAGE_ZONE}/${imageFileName}`

            const response = await fetch(deleteUrl, {
                method: "DELETE",
                headers: {
                    "AccessKey": process.env.BUNNY_STORAGE_API_KEY,
                }
            })

            if(!response.ok) {
                throw new AppError(`Image deletion failed: ${response.statusText} and status code: ${response.status}`)
            }
        }
        revalidatePath(`/article/${postToDelete.slug}`)
        return {success: true}
    }
    catch(error) {
        
        if(error instanceof AppError) {
            throw error
        }
        throw new AppError("Something went wrong while deleting a post")
    }
    
}