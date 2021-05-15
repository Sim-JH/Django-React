import React, {useEffect, useState} from "react";
import {useHistory} from "react-router-dom";
import {Avatar, Button, Card} from "antd";
import {useAppContext} from "../store";
import Followers from "./Followers";
import {axiosInstance, useAxios} from "../api";


export default function FollowList({ style }) {
    const {
        store: { jwtToken }
    } = useAppContext();

    const [followerList, setFollowerList] = useState([]);

    const headers = { Authorization: `JWT ${jwtToken}` };
    console.log("Follow :", followerList)

    const [{ data: followUserList, followLoading, followError }, followfetch] = useAxios({
        url: "/accounts/follow/list",
        headers
    });

    console.log("followUserList :", followUserList)


    // 마운트 즉시 실행할 동작 설정
    useEffect(() => {
        if (!followUserList) setFollowerList([]);
        else setFollowerList(followUserList.map(user => ({ ...user, is_follow: true })));
    }, [followUserList]);

    const onUnfollow = username => {
        const data = { username };
        const config = { headers };
        axiosInstance
            .post("/accounts/unfollow/", data, config)
            .then(response => {
                setFollowerList(prevUserList =>
                    prevUserList.map(user =>
                        user.username !== username ? user : { ...user, is_follow: false }
                    )
                );
            })
            .catch(error => {
                console.error(error);
            });
    };



    return (
        <div style={style}>
            {followLoading && <div>Loading ...</div>}
            {followError && <div>로딩 중에 에러가 발생했습니다.</div>}

            <Card title="Followers " size="small">
                {followerList.map(followUser => (
                    <Followers
                        key={followUser.username}
                        followUser={followUser}
                        onUnfollow={onUnfollow}
                    />
                ))}
            </Card>
        </div>

    );
}