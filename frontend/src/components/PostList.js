import React, { useEffect, useState } from "react";
import { Alert } from "antd";
import { axiosInstance, useAxios } from "api";
// import Axios from "axios";
// import useAxios from "axios-hooks";
import Post from "./Post";
import { useAppContext } from "store";

function PostList({postList, setPostList, refetch}) {
    const {
        store: { jwtToken }
    } = useAppContext();

    const headers = { Authorization: `JWT ${jwtToken}` };

    // TagSet에서 response 데이터를 받아오기 위해 setter를 내려준다. usecontext를 사용할 수도 있음.
    // const [postList, setPostList] = useState([]);
    //
    // const [{ data: originPostList }, refetch] = useAxios({
    //     url: "/api/posts/",
    //     headers
    // })
    //
    // useEffect(() => {
    //     setPostList(originPostList);
    // }, [originPostList]);
    //

    const [{ data: login_user }, login_refetch] = useAxios({
        url: "/accounts/username/",
        headers
    })


    const handleLike = async ({ post, isLike }) => {
        const apiUrl = `/api/posts/${post.id}/like/`;
        const method = isLike ? "POST" : "DELETE";

        try {
            const response = await axiosInstance({
                url: apiUrl,
                method,
                headers
            });
            console.log("response :", response);

            setPostList(prevList => {
                return prevList.map(currentPost =>
                    currentPost === post
                        ? { ...currentPost, is_like: isLike }
                        : currentPost
                );
            });
        } catch (error) {
            console.log("error :", error);
        }
    };

    return (
        <div>
            {login_user && postList.map(post => (
                <Post
                    post={post}
                    key={post.id}
                    login_user={login_user["username"]}
                    handleLike={handleLike}
                    setPostList={setPostList}
                    refetch={refetch}
                />
            ))}
        </div>
    );

}


export default PostList;


// console.log(">>> store :", jwtToken);
// const [postList, setPostList] = useState([]);
//
// // Axios로 django 서버에 요청을 보낼 시, 인증헤더로 jwtToken을 같이 보냄
// useEffect(() => {
//     const headers = { Authorization: `JWT ${jwtToken}`};
//     Axios.get(apiUrl, { headers })
//         .then(response => {
//             const { data } = response;
//             console.log("loaded response :", response);
//             setPostList(data);
//         })
//         .catch(error => {
//             // error.response;
//         })
//     console.log("시작할 때 실행");
// }, [])
//