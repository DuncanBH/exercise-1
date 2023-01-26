// import styles from '@styles/Admin.module.css';
import { doc, getFirestore, serverTimestamp, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useDocumentDataOnce } from "react-firebase-hooks/firestore";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import AuthCheck from "../../components/AuthCheck";
import { auth } from "../../lib/firebase";

export default function AdminPostEdit({ }) {
    return (
        <main>
            <AuthCheck>
                <PostManager />
            </AuthCheck>
        </main>
    )
}

function PostManager() {
    const [preview, setPreview] = useState(false);

    const router = useRouter();
    const { slug } = router.query;

    const postRef = doc(getFirestore(), 'users', auth.currentUser.uid, 'posts', slug);
    //Turn off realtime updates
    const [post] = useDocumentDataOnce(postRef);

    return (
        <main>
            {post && (
                <>
                    <section>
                        <h1>{post.title}</h1>
                        <p>ID: {post.slug}</p>

                        <PostForm postRef={postRef} defaultValues={post} preview={preview} />
                    </section>

                    <aside>
                        <h3>Tools</h3>
                        <button onClick={() => setPreview(!preview)}>{preview ? 'Edit' : 'Preview'}</button>

                        <Link href={`/${post.username}/${post.slug}`}>
                            <button className="btn-blue">Live view</button>
                        </Link>
                    </aside>
                </>
            )}
        </main>
    )
}

function PostForm({ defaultValues, postRef, preview }) {
    const { register, handleSubmit, reset, watch } = useForm({ defaultValues, mode: 'onChange' });

    const updatePost = async ({ content, published }) => {
        await updateDoc(postRef, {
            content,
            published,
            updatedAt: serverTimestamp(),
        });

        reset({ content, published });

        toast.success('Post updated successfully!');
    }

    return (
        <form onSubmit={handleSubmit(updatePost)}>
            {preview && (
                <div className="card">
                    <ReactMarkdown>{watch('content')}</ReactMarkdown>
                </div>
            )}

            <div className={preview ? 'hidden' : 'controls'}>
                <textarea name="content"
                    ref={register({
                        maxLength: { value: 20000, message: 'content is too long' },
                        minLength: { value: 10, message: 'content is too short' },
                        required: { value: true, message: 'content is required' },
                    })}>

                </textarea>

                <fieldset>
                    <input className={'checkbox'} name="published" type="checkbox" ref={register} />
                    <label>Published</label>
                </fieldset>

                <button type="submit" className="btn-green">
                    Save Changes
                </button>
            </div>
        </form>
    );
}