import React, {createElement, useState} from "react";
import {Avatar, Button, Comment as AntdComment, Form, Tooltip} from "antd";
import moment from "moment";
import {useAppContext} from "../store";
import {CloseOutlined} from "@ant-design/icons";
import {axiosInstance} from "../api";

export default function Comment({ comment, post_id, login_user, refetch }) {
    const {
        author: { username, name, avatar_url },
        message,
        created_at
    } = comment;

    const {
        store: { jwtToken }
    } = useAppContext();

    const headers = { Authorization: `JWT ${jwtToken}` };

    const handleDelete = async () => {
        try {
            const response = await axiosInstance.delete(
                `/api/posts/${post_id}/comments/${comment.id}`,
                {headers}
            );
            // 포스트 삭제처럼 새로고침이 아니라 화면에 즉시 반영하기위해 코멘트 리스트로부터 refetch 받아옴
            refetch()
        }
        catch (error){
            console.log(error.response)
        }
        console.log("click")
    }

    const actions = [

    ];


    const displayName = name.length === 0 ? username : name;

    return (
        <AntdComment
            author={displayName}
            avatar={<Avatar src={avatar_url} alt={displayName} />}
            content={<p>{message}</p>}
            datetime={
                <>
                    {moment(created_at).fromNow()}
                    &nbsp;
                    {login_user === username ? (
                        <CloseOutlined style={{ color: "#ff3333" }} onClick={handleDelete} />
                    ) : true}
                </>
                // <Tooltip title={moment().format(created_at)}>
                // </Tooltip>
            }
        />
    );
}
