import React, {useEffect, useState} from "react";
import {Card, Col, Form, Row, Tooltip} from "antd";
import {useAppContext} from "../store";
import {useAxios} from "../api";
import "./LikePost.scss"


export default function LikePost({ post, refetct }){
    const {
        store: { jwtToken }
    } = useAppContext();

    const headers = { Authorization: `JWT ${jwtToken}` };

    const { author, location } = post;
    const { username, name, avatar_url } = author;
    const isLongLocation = location.length > 10;
    const isLongName = name.length > 15;

    const postElem = (
        <div className="like_post">
            <div className="location">
                {isLongLocation ? `${location.slice(0, 15)}...` : location}
            </div>
            <div className="name">
                {isLongName ? `${name.slice(0, 10)}...` : name}
            </div>
        </div>
    )

    return isLongLocation ? (
            <Tooltip title={location}>
                {postElem}
            </Tooltip>
            ) : (postElem);
}