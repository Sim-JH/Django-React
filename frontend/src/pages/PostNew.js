import React from "react";
import PostNewForm from "components/PostNewForm";
import "./PostNew.scss"
import {Card} from "antd";
import TopNav from "../components/TopNav";

export default function PostNew() {
    const topnav = TopNav()
    return (
        <div className="PostNew">
            {topnav}
            <Card title="새 포스팅 쓰기">
                <PostNewForm />
            </Card>
        </div>
    );
}

