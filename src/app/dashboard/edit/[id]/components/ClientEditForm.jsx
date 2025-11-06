"use client"
import "./create.scss"
import { editPost } from "@/lib/serverActions/blog/postServerActions";
import { useState, useRef } from "react"
import { useRouter } from "next/navigation";
import { areTagsSimilar } from "@/lib/utils/general/utils";

export default function ClientEditForm({post}) {
    const [tags, setTags ] = useState(post.tags.map(tag => tag.name) || [])

    const router = useRouter()
    
    const tagInputRef = useRef(null)
    const submitButtonRef = useRef(null)
    const serverValidationText = useRef(null)
    const imgUploadValidationText = useRef(null)

    async function handleSubmit(event) {
        event.preventDefault();

        // Handle form submission logic here
        const formData = new FormData(event.target)
        const readableFormData = Object.fromEntries(formData)
        const areSameTags = areTagsSimilar(tags, post.tags)

        if(readableFormData.coverImage.size === 0 && readableFormData.title.trim() === post.title && readableFormData.markdownArticle.trim() === post.markdownArticle && areSameTags) {
            serverValidationText.current.textContent = "No changes detected"
            return
        } else {
            serverValidationText.current.textContent = ""
        }


        formData.set("tags", JSON.stringify(tags))
        formData.set("postToEditStringified", JSON.stringify(post))

        serverValidationText.current.textContent = ""
        submitButtonRef.current.textContent = "Updating post..."
        submitButtonRef.current.disabled = true

        try {
            const result = await editPost(formData)
            if(result.success) {
                submitButtonRef.current.textContent = "Post updated! ✅"

                let countdown = 3
                serverValidationText.current.textContent = `Redirecting in ${countdown}`
                const intervalId = setInterval(() => {
                    countdown--
                    serverValidationText.current.textContent = `Redirecting in ${countdown}`
                    if(countdown === 0) {
                        clearInterval(intervalId)
                        router.push(`/article/${result.slug}`)
                    }
                }, 1000);
            }
        } catch (error) {
            serverValidationText.current.textContent = "Submit"
            submitButtonRef.current.textContent = `${error.message}`
            submitButtonRef.current.disabled = false
        }
    }

    function handleAddTag(e) {
        e.preventDefault()
        const newTag = tagInputRef.current.value.trim().toLowerCase()

        if(newTag !== "" && !tags.includes(newTag) && tags.length <= 4) {
            setTags([...tags, newTag])
            tagInputRef.current.value = ""
        }
    }

    function handleRemoveTag(tagToRemove){
        setTags(tags.filter(tag => tag != tagToRemove))

    }

    function handleEnterOnTagInput(e) {
        if(e.key === "Enter"){
            e.preventDefault();
            handleAddTag()
        }
    }

    function handleFileChange(e) {
        const file = e.target.files[0]
        const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

        if(!validImageTypes.includes(file.type)) {
            e.target.value = ""
            imgUploadValidationText.current.textContent = "Please upload a valid image type (jpg, jpeg, png, or webp)"
            return
        }
        else {
            imgUploadValidationText.current.textContent = ""
        }

        const img = new Image()
        img.addEventListener('load', checkImgSizeOnLoad)

        function checkImgSizeOnLoad() {
            if(img.width > 1280 || img.height > 720) {
                imgUploadValidationText.current.textContent = "Image dimensions should not exceed 1280x720px"
                e.target.value = ""
                URL.revokeObjectURL(img.src)
                return
            } else {
                imgUploadValidationText.current.textContent = ""
                URL.revokeObjectURL(img.src)
            }
        }

        img.src = URL.createObjectURL(file)
    }

  return (
    <main className='u-main-container bg-white p-7 mt-32 mb-44'>
        <h1 className='text-4xl mb-4'>Edit that article ✍🏻</h1>
        <form onSubmit={handleSubmit}
        className='pb-6'
        >
{/* ----------------------- Title ----------------------- */}
            
            <label htmlFor="title" className="f-label">Title<span className='text-red-600'>*</span></label>
            <input
            type="text"
            name='title'
            className='shadow border rounded w-full p-3 mb-7 text-gray-700 focus:outline-slate-400'
            id='title'
            placeholder='Title'
            required
            defaultValue={post.title}
            />

{/* ----------------------- Image ----------------------- */} 
            <label htmlFor="coverImage" className="f-label">
                Cover Image - optional (1280x720 for best quality, or less)
                <span className=''></span>
            </label>
            <input
            name="coverImage"
            type="file"
            accept="image/*"
            className="shadow border rounded w-full p-3 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
            file:rounded-full
            file:text-sm file:font-semibold file:cursor-pointer
            file:bg-indigo-50 file:text-indigo-500
            file:border
            file:border-indigo-300
            hover:file:bg-indigo-100
            mb-7
            "
            id="coverImage"
            placeholder="Article's cover image"
            onChange={handleFileChange}
            />
            <p
            ref={imgUploadValidationText}
            className="text-red-700 mb-7"></p>

{/* ------------------------ Tag ------------------------ */}

            <div className="mb-10">
                <label className="f-label" htmlFor="tag">Add a tag(s) - maximum 5</label>
                <div className="flex">
                    <input
                    id="tag"
                    type="text"
                    className="block shadow border rounded p-3 text-gray-700 focus:outline-slate-400"
                    onKeyDown={handleEnterOnTagInput}
                    placeholder="Add a tag"
                    ref={tagInputRef}
                    />
                    <button
                    onClick={handleAddTag}
                    type="button"
                    className="bg-indigo-500 hover:bg-indigo-700 text-white px-4 rounded mx-4">
                        Add
                    </button>
                    <div className="flex items-center grow whitespace-nowrap overflow-y-auto shadow border rounded px-3">
                        {tags.map(tag => (
                            <span
                            className="inline-block whitespace-nowrap bg-gray-200 text-gray-700 rounded-full px-3 py-1 font-semibold mr-2"
                            key={tag}>
                                {tag}
                                <button
                                onClick={() => handleRemoveTag(tag)}
                                type="button"
                                className="text-red-500 ml-2">
                                    &times;
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

            </div>


{/* ---------------------- Content ---------------------- */}

            <label htmlFor='markdownArticle'
            className='f-label'
            >
                Write your article using markdown<span className='text-red-600'>* </span><img className='info-icon inline-block w-5 h-5 cursor-pointer' src="../../icons/information.png" alt="" /> <span className='info-message'>you do not need to mention the title again</span>
            </label>
            <a
            href="https://www.markdownguide.org/cheat-sheet/"
            target='_blank'
            className='block mb-4 text-blue-600 hover:underline'
            >How to use the markdown syntax?</a>

            <textarea
            name="markdownArticle"
            id="markdownArticle"
            placeholder="Content"
            required
            className='min-h-44 text-xl appearance-none w-full border rounded shadow p-8 text-gray-700 mb-4 focus:outline-slate-400'
            defaultValue={post.markdownArticle}>
            </textarea>

            <button
            ref={submitButtonRef}
            className='min-w-44 bg-indigo-500 hover:bg-indigo-700 text-white font-bold rounded py-3 px-4 border-none mb-4'>
                Submit
            </button>
            <p
            ref={serverValidationText}
            className="text-red-600">

            </p>
        </form>
    </main>
  )
}
