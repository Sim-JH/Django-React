import React, {useEffect, useState} from "react";
import {Alert, Button, Menu, notification} from "antd";
import {DownloadOutlined, SmileOutlined, HomeOutlined, UserOutlined, LoginOutlined} from '@ant-design/icons';
import {useHistory} from "react-router-dom";
import PostList from "components/PostList";
import AppLayout from "components/AppLayout";
import SuggestionList from "components/SuggestionList";
import {axiosInstance, useAxios} from "api";
import {useAppContext} from "../store";
import FollowList from "../components/FollowList";
import LikeList from "../components/LikeList";
import Post from "../components/Post";

function Home() {
    const history = useHistory();

        const {
        store: { jwtToken }
    } = useAppContext();


    // 데이터를 받아오기 위해 setter를 내려준다.
    const [postList, setPostList] = useState([]);
    const headers = { Authorization: `JWT ${jwtToken}` };

    const [{ data: originPostList }, refetch] = useAxios({
        url: "/api/posts/",
        headers
    })


    useEffect(() => {
        setPostList(originPostList);
    }, [originPostList]);



    const handleClickPost = () => {
        history.push("/posts/new");
    };
    const handleClickCrawler = () => {
        history.push("/posts/crawler")
    };

    const sidebar = (
        <>
            <Button
                type="primary"
                block
                style={{ marginBottom: "1rem" }}
                onClick={handleClickPost}
            >
                새 포스팅 쓰기
            </Button>
            <Button
                type="dashed"
                icon={<DownloadOutlined />}
                block
                style={{ marginBottom: "1rem" }}
                onClick={handleClickCrawler}
            >
                이미지 크롤링
            </Button>
            <LikeList style={{ marginBottom: "1rem" }} setPostList={setPostList}/>
            <SuggestionList style={{ marginBottom: "1rem" }}/>
        </>
    );

    return (
        <AppLayout sidebar={sidebar}>
            {postList && postList.length === 0 && (
                <Alert type="warning" message="포스팅이 없습니다." />
            )}
            {postList &&
                <PostList postList={postList} setPostList={setPostList} refetch={refetch}/>
            }
        </AppLayout>
    );
}

export default Home;
