import React from "react";
import { Input, Menu } from "antd";
import "./AppLayout.scss";
import LogoImage from "assets/logo.png";
import TopNav from "./TopNav";

function AppLayout({ children, sidebar }) {
    const topnav = TopNav()
    return (
        <div className="app">
            <div className="header">
                <h1 className="page-title">
                    <img src={LogoImage} alt="logo" />
                </h1>
                {/*<div className="search">*/}
                {/*    <Input.Search />*/}
                {/*</div>*/}
                <div className="topnav">
                    {topnav}
                </div>
            </div>
            <div className="contents">{children}</div>
            <div className="sidebar">{sidebar}</div>
            <div className="footer">&copy; 2021. Simjh</div>
        </div>
    );
}

export default AppLayout;
