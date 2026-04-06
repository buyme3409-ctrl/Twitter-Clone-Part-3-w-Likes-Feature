import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, storage } from "../../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";


export const deletePost = createAsyncThunk(
    "posts/deletePost",
    async ({ userId, postId }) => {
        try {
            const postRef = doc(db, `users/${userId}/posts/${postId}`);
            await deleteDoc(postRef);
            return postId;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
);


export const updatePost = createAsyncThunk(
    "posts/updatePost",
    async ({ userId, postId, newPostContent, newFile }) => {
        try {
            let newImageUrl;
            if (newFile) {
                const imageRef = ref(storage, `posts/${newFile.name}`);
                const response = await uploadBytes(imageRef, newFile);
                newImageUrl = await getDownloadURL(response.ref);
            }
            const postRef = doc(db, `users/${userId}/posts/${postId}`);

            const postSnap = await getDoc(postRef);
            if (postSnap.exists()) {
                const postData = postSnap.data();
                const updatedPostData = {
                    ...postData,
                    content: newPostContent || postData.content,
                    imageUrl: newImageUrl || postData.imageUrl,
                };
                await updateDoc(postRef, updatedPostData);
                const updatedPost = { id: postId, ...updatedPostData };
                return updatedPost;
            } else {
                throw new Error("Post does not exist");
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
);



export const fetchPostsByUserId = createAsyncThunk(
    "posts/fetchByUser",
    async (userId) => {
        try {
            // collection() gets a reference of where the user's posts are stored in our Firebase database
            const postsRef = collection(db, `users/${userId}/posts`);
            // getDocs() gets all the documents located at documents path specified in `postsRef`, then the resulting data is stored into `querySnapshot` variable
            const querySnapshot = await getDocs(postsRef);
            // It then maps through the documents in `querySnapshot` to a new object that includes documents ID and data. Then all of these objects are stored in `docs` variable
            const docs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            // at the end of async thunk  function, it returns `docs` variable, which contains all the fetched documents  data
            return docs;

        } catch (error) {
            console.error(error);
            throw error;
        }
    }

);

export const savePost = createAsyncThunk(
    "posts/savePost",
    async ({ userId, postContent, file }) => {
        try {
            let imageUrl = "";
            console.log(file);
            if (file !== null) {
                const imageRef = ref(storage, `posts/${file.name}`);
                const response = await uploadBytes(imageRef, file);
                imageUrl = await getDownloadURL(response.ref);
            }
            const postsRef = collection(db, `users/${userId}/posts`);
            console.log(`users/${userId}/posts`);

            const newPostRef = doc(postsRef);
            console.log(postContent);


        } catch (error) {
            console.error(error);
            throw error;
        }
    }
)

export const likePost = createAsyncThunk(
    "posts/likePost",
    async ({ userId, postId }) => {
        try {
            //doc() gets a reference of where one of the user’s posts is stored in our Firebase database.  
            const postRef = doc(db, `users/${userId}/posts/${postId}`);

            //getDoc() gets the document located at the document path specified in `postRef`, then the document returned is stored into `docSnap` variable

            const docSnap = await getDocs(postRef);

            if (docSnap.exists()) {
                //If document exists, it extracts the existing likes, and append new userId into its existing likes, likes = [...postData.likes, userId]
                const postData = docSnap.data();
                const likes = [...postData.likes, userId];

                //Then, it re-writes the data inside the post with setDoc(), It takes 2 parameters, A document path (postRef), data to be added {...postData, likes} 
                await setDoc(postRef, { ...postData, likes });
            }
            //After like has been added, it returns the { userId, postId } to be used in extraReducers (action.payload) to update the application state
            return { userId, postId };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
);

export const removeLikeFromPost = createAsyncThunk(
    "posts/removeLikeFromPost",
    async ({ userId, postId }) => {
        try {
            const postRef = doc(db, `users/${userId}/posts/${postId}`);

            const docSnap = await getDocs(postRef);

            if (docSnap.exists()) {
                const postData = docSnap.data();
                //it uses filter() method to remove like from a post that is attached to a specific userId
                const likes = postData.likes.filter((id) => id !== userId);

                await setDoc(postRef, { ...postData, likes });
            }
            return { userId, postId };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
);





const postsSlice = createSlice({
    name: "posts",
    initialState: { posts: [], loading: true },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPostsByUserId.fulfilled, (state, action) => {
                state.posts = action.payload; //The data from ‘docs’ variable can then be used in extraReducers (action.payload) to update the application state.
                state.loading = false;
            })
            .addCase(savePost.fulfilled, (state, action) => {
                state.posts = [action.payload, ...state.posts];
            })
            .addCase(likePost.fulfilled, (state, action) => {
                const { userId, postId } = action.payload;

                const postIndex = state.posts.findIndex((post) => post.id === postId);

                if (postIndex !== -1) {
                    state.posts[postIndex].likes.push(userId);
                }
            })
            .addCase(removeLikeFromPost.fulfilled, (state, action) => {
                const { userId, postId } = action.payload;

                const postIndex = state.posts.findIndex((post) => post.id === postId);

                if (postIndex !== -1) {
                    state.posts[postIndex].likes = state.posts[postIndex].likes.filter((id) => id !== userId);
                }
            })
            .addCase(updatePost.fulfilled, (state, action) => {
                const updatedPost = action.payload;
                const postIndex = state.posts.findIndex((post) => post.id === updatedPost.id);
                if (postIndex !== -1) {
                    state.posts[postIndex] = updatedPost;
                }
            })
            .addCase(deletePost.fulfilled, (state, action) => {
                const deletedPostId = action.payload;
                state.posts = state.posts.filter((post) => post.id !== deletedPostId);
            });
    },
});

export default postsSlice.reducer;