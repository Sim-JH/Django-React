import React, { useEffect, useState} from "react";
import {Card, Col, Form, Row, Tooltip} from "antd";
import {useAppContext} from "../store";
import {useAxios} from "../api";
import LikePost from "./LikePost";
import Post from "./Post";


export default function LikeList({ style, setPostList }){
    const {
        store: { jwtToken }
    } = useAppContext();

    const headers = { Authorization: `JWT ${jwtToken}` };

    const [likeList, setLikeList] = useState([]);

    const [{ data: originLikeList }, refetch] = useAxios({
        method: "GET",
        url: "/api/likes/",
        headers
    })


    useEffect(() => {
        setLikeList(originLikeList);
    }, [originLikeList]);

    const handleMoveLike = () => {
        setPostList(likeList)
    }


    return (
        <div style={style}>
            <Card
                title="최근에 좋아한 포스트"
                size="small"
                actions={[<span onClick={handleMoveLike}>좋아요한 모든 포스트 보러가기</span>]}
            >
                 {/*useEffect로 관리되고 있는 state는 렌더링이 끝나기를 기다리고 동작해야하므로
                &&로 loading을 기다려 주는 것이 필수적*/}
                {likeList && likeList.map((post, index) =>
                    index < 10 ? (<LikePost
                        post={post}
                        key={post.id}
                        refetct={refetch}
                    />) : console.log(post.id)
                )}
            </Card>
        </div>
    );
}