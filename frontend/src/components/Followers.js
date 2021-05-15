import React from "react";
import { UserOutlined } from '@ant-design/icons';
import {Avatar, Button} from "antd";
import "./Followers.scss"


export default function Followers({followUser, onUnfollow}) {
    const { username, name, avatar_url, is_follow } = followUser;

    return (
        <div className="followers">
            <div className="avatar">
                <Avatar
                    size="small"
                    icon={<img src={avatar_url} alt={`${username}'s avatar`} />}
                />
            </div>
            <div className="username">
                {name.length === 0 ? username : name}
            </div>
            <div className="action">
                <Button size="small" onClick={() => onUnfollow(username)}>
                    팔로우 해제
                </Button>
            </div>
        </div>
    );
}