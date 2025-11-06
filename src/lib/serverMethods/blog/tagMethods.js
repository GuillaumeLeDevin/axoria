import { connectToDB } from "@/lib/utils/db/connectToDB";
import { Tag } from "@/lib/models/tag"
import { notFound } from "next/navigation"

export async function getTags(){

    await connectToDB()

    const tags = await Tag.aggregate([
        {
            //Crée une propriété "postsWithTag" qui est un tableau contenant tous les posts associés à chaque tag
            $lookup: {
                from: "posts",
                localField: "_id",
                foreignField: "tags",
                as: "postsWithTag"
            }   
        },
        {
            //Compte le nombre de posts associés à chaque tag
            $addFields: {
                postsCount: { $size: "$postsWithTag" }
            }
        },
        {
            //Ne conserve que les tags ayant au moins un post associé (car le tag d'un post d'un article supprimé n'est pas supprimé automatiquement)
            $match: {postsCount: {$gt: 0}}
        },
        { 
            //Trie les tags par nombre de posts associés, du plus grand au plus petit
            $sort: { postsCount: -1 } 
        },
        { 
            //Supprime la propriété "postsWithTag" du résultat final pour alléger les données retournées
            $project: { postsWithTag: 0 } 
        }
    ])

    if(!tags) {
        notFound()
    }
    return tags
}