import { collection, doc, getFirestore, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore"
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import AuthCheck from "../../components/AuthCheck"
import PostFeed from "../../components/PostFeed";
import { UserContext } from "../../lib/context";
import { auth, firestore } from "../../lib/firebase"

import kebabCase from 'lodash.kebabcase';
import toast from "react-hot-toast";

export default function AdminPosts({ }) {
    return (
        <main>
            <AuthCheck>
                <PostList />
                <CreateNewPost />

            </AuthCheck>
        </main>
    )
}

function PostList() {
    const ref = collection(getFirestore(), 'users', auth.currentUser.uid, 'posts');
    const postQuery = query(ref, orderBy('createdAt'));

    const [querySnapshot] = useCollection(postQuery);

    const posts = querySnapshot?.docs.map((doc) => doc.data());

    return (
        <>
            <h1>Manage your posts</h1>
            <PostFeed posts={posts} admin />
        </>
    );
}

function CreateNewPost() {
    const router = useRouter();
    const { username } = useContext(UserContext);
    const [title, setTitle] = useState('');

    const slug = encodeURI(kebabCase(title));

    const isValid = title.length > 3 && title.length < 100;

    const createPost = async (e) => {
        e.preventDefault();
        const uid = auth.currentUser?.uid;

        //To prevent random ID, make reference to a document that doesn't exist yet
        const ref = doc(getFirestore(), 'users', uid, 'posts', slug);

        const data = {
            title,
            slug,
            uid,
            username,
            published: false,
            content: "# hello world!",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            heartCount: 0,
        };

        //commit the new document to firestore
        await setDoc(ref, data);

        toast.success('Post created!')

        router.push(`/admin/${slug}`);
    }
    return (
        <form onSubmit={createPost}>
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="An Awesome Article"
            />
            <p>
                <strong>Slug:</strong> {slug}
            </p>
            <button type="submit" disabled={!isValid} className="btn-green">
                Create new post
            </button>
        </form>
    )
}