import React from "react";
import {Button, Menu, notification} from "antd";
import {DownloadOutlined, SmileOutlined, HomeOutlined, UserOutlined, LoginOutlined} from '@ant-design/icons';
import {useHistory} from "react-router-dom";
import PostList from "components/PostList";
import AppLayout from "components/AppLayout";
import SuggestionList from "components/SuggestionList";
import { axiosInstance } from "api";
import {useAppContext} from "../store";
import FollowList from "../components/FollowList";

export default function TopNav() {
    const history = useHistory();

    const {
        store: { jwtToken }
    } = useAppContext();

    const headers = { Authorization: `JWT ${jwtToken}` };

    const handleHome = () => {
        window.location.replace("/")
    }

    const handleProfile = async () => {
        history.push("/accounts/profile/")
    }

    const handleLogout = async () => {
        try {
            const response = await axiosInstance.get("/accounts/logout", {headers});
            console.log(response)
            notification.open({
                message: "로그아웃 성공",
                icon: <SmileOutlined style={{ color: "#108ee9" }}/>
            })
            history.push("/accounts/login");
        }
        catch (error)
        {
            console.log(error)
        }
    };

    return (
        <Menu mode="horizontal" style={{ marginRight: "2.5rem" }}>
            <Menu.Item onClick={handleHome} style={{ marginRight: "4rem" }}>
                <HomeOutlined />
            </Menu.Item>
            <Menu.Item onClick={handleProfile} style={{ marginRight: "4rem" }}>
                <UserOutlined />
            </Menu.Item>
            <Menu.Item onClick={handleLogout}>
                <LoginOutlined />
            </Menu.Item>
        </Menu>
    );
}