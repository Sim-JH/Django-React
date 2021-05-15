import React from "react";
import PostCrawlerForm from "components/PostCrawlerForm";
import "./PostCrawler.scss"
import {Card} from "antd";
import TopNav from "../components/TopNav";


export default function PostCrawler() {
    const topnav = TopNav()
    return (
        <div className="PostCrawler">
            {topnav}
            <Card title="이미지 크롤링">
                <PostCrawlerForm />
            </Card>
        </div>
    );
}

