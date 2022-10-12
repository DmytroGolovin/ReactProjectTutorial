import { auth, db } from "../utils/firebase";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { BsTrash2Fill } from "react-icons/bs";
import { AiFillEdit } from "react-icons/ai";
import { toast } from "react-toastify";
import Link from "next/link";
import Message from "../components/message";

export default function Dashboard() {
    const router = useRouter();
    const [user, loading] = useAuthState(auth);

    //Create a state with all the posts
    const [myPosts, setMyPosts] = useState([]);
    
    async function getData() {
        if(loading) return;
        if(!user) return router.push('/auth/login');

        //Get my posts
        const collectionRef = collection(db, "posts");
        const q = query(collectionRef, where('user', '==', user.uid));

        const docSnap = await getDocs(q);

        setMyPosts(docSnap.docs.map(doc => ({ ...doc.data(), id: doc.id})));
    }

    async function deletePost(id) {
        const docRef = doc(db, "posts", id);

        await deleteDoc(docRef);

        let myUpdatedPosts = [...myPosts]; // make a separate copy of the array
        let index = myUpdatedPosts.findIndex(x => x.id == id);
        if (index !== -1) {
            myUpdatedPosts.splice(index, 1);
            setMyPosts(myUpdatedPosts);
        }

        toast.success('Post deleted!', {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 1500
        });
    }

    useEffect(() => {
        getData();
    }, [user, loading])

    return (
        <div>
            <h1>Your posts</h1>
            <div>
            {myPosts.map(post => {
                return (
                    <Message {...post} key={post.id}>
                        <div className="flex gap-4">
                            <button className="text-pink-600 flex items-center justify-center gap-2 py-2 text-sm"
                                onClick={() => deletePost(post.id)}>
                                <BsTrash2Fill className="text-2xl"/>
                                Delete
                            </button>
                            <Link href={{pathname: "/post", query: post }}>
                                <button className="text-teal-600 flex items-center justify-center gap-2 py-2 text-sm">
                                    <AiFillEdit className="text-2xl"/>
                                    Edit
                                </button>
                            </Link>
                        </div>
                    </Message>
                );
            })}
            </div>
            <button className="font-medium text-white bg-gray-800 py-2 px-4 rounded-lg my-6" 
                onClick={() => auth.signOut()}>Sign out</button>
        </div>
    )
}