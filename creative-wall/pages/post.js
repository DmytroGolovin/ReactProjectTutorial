import { auth, db } from "../utils/firebase";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";

export default function Post() {
    const charactersLimit = 300;
    const router = useRouter();
    const [user, loading] = useAuthState(auth);
    const routeData = router.query;
    
    //Form state
    const [post, setPost] = useState({ description: ""});

    //Submit post
    async function submitPost(e) {
        e.preventDefault();

        //Run checks for post
        if(!post.description){
            toast.error('Description field empty!', {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 1500
            });
            return;
        }

        if(post.description.length > charactersLimit){
            toast.error('Description is too long!', {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 1500
            });
            return;
        }

        if(post?.hasOwnProperty("id")) {
            //Update post
            const docRef = doc(db, "posts", post.id);
            const updatedPost = { 
                ...post,
                timeStamp: serverTimestamp(),
            }
            await updateDoc(docRef, updatedPost);

            toast.success('Post has been updated!', {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 1500
            });
        }
        else {
            //Make a new post
            const collectionRef = collection(db, "posts");

            await addDoc(collectionRef, {
                ...post,
                timeStamp: serverTimestamp(),
                user: user.uid,
                avatar: user.photoURL,
                userName: user.displayName
            });

            toast.success('Post has been created!', {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 1500
            });
        }

        setPost({description: '' });
        router.push("/");
    }

    //Check our user
    async function checkUser() {
        if(loading) return;
        if(!user) return router.push('/auth/login');

        if(routeData.id){
            setPost({ description: routeData.description, id: routeData.id });
        }
    }

    useEffect(() => {
        checkUser();
    }, [user, loading])

    return (
        <div className="my-20 p-12 shadow-lg rounded-lg max-w-md mx-auto">
            <form onSubmit={submitPost}>
                <h1 className="text-2xl font-bold">
                    { post.hasOwnProperty("id") ? "Edit your post": "Create a new post"}
                </h1>
                <div className="py-2">
                    <h3 className="text-lg font-medium py-2">Description</h3>
                    <textarea value={post.description} 
                        onChange={(e) => setPost({...post, description: e.target.value })}
                        className="bg-gray-800 h-48 w-full text-white rounded-lg p-2 text-sm"></textarea>
                    <p className={`text-cyan-600 font-medium text-sm ${post.description.length > charactersLimit ? 'text-red-600' : ''}`}>
                        {post.description.length}/{charactersLimit}
                    </p>
                </div>
                <button type="submit"
                    className="w-full bg-cyan-500 text-white font-medium p-2 my-2 rounded-lg text-sm">Submit</button>
            </form>
        </div>
    );
}