import { auth, db } from "../utils/firebase";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Message from '../components/message';
import { async } from "@firebase/util";
import { arrayUnion, doc, getDoc, onSnapshot, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";

export default function Details() {
    const router = useRouter();
    const routeData = router.query;
    const [message, setMessage] = useState('');
    const [comments, setComments] = useState([]);

    //Submit a comment
    async function submitComment() {
        if(!auth.currentUser) return router.push('/auth/login');

        //Run checks for comment
        if(!message){
            toast.error('Comment field empty!', {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 1500
            });
            return;
        }

        const docRef = doc(db, "posts", routeData.id);
        await updateDoc(docRef, {
            comments: arrayUnion({
                message,
                avatar: auth.currentUser.photoURL,
                userName: auth.currentUser.displayName,
                time: Timestamp.now(),
            })
        });

        setMessage('');
    }

    //Get comments
    async function getComments(){
        const docRef = doc(db, "posts", routeData.id);

        const unsubscribe = onSnapshot(docRef, (snapshot) => {
            setComments(snapshot.data()?.comments);
        });

        return unsubscribe;
    }

    useEffect(() => {
        if(!router.isReady) return;
        getComments();
    }, [router.isReady]);

    return (
        <div>
            <Message {...routeData}>

            </Message>
            <div className="my-4">
                <div className="flex gap-2">
                    <input type="text" value={ message } placeholder="Leave a comment..."
                        onChange={(e) => setMessage(e.target.value)}
                        className="bg-gray-800 w-full p-2 text-white text-sm rounded-lg" />
                    <button onClick={submitComment} className="bg-cyan-500 text-white py-2 px-4 rounded-lg text-sm">
                        Send
                    </button>
                </div>
                <div className="py-6">
                    <h2 className="font-bold">Comments</h2>
                    {comments?.map(comment => {
                        return (
                            <div className="bg-white p-4 my-4 border-2 rounded-lg" key={comment.time}>
                                <div className="flex items-center gap-2 mb-4">
                                    <img src={comment.avatar} className="w-10 rounded-full" />
                                    <h2>{comment.userName}</h2>
                                </div>
                                <h2>{comment.message}</h2>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}