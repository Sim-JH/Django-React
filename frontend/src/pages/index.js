import React from "react";
import { Route } from "react-router-dom";
import LoginRequiredRoute from "utils/LoginRequiredRoute";
import Home from "./Home";
import About from "./About";
import AccountsRoutes from "./accounts";
import PostNew from "./PostNew";
import PostCrawler from "./PostCrawler";

function Root() {
    return (
        <>
            <LoginRequiredRoute exact path="/" component={Home} />
            <Route exact path="/about" component={About} />
            <LoginRequiredRoute exact path="/posts/new" component={PostNew} />
            <LoginRequiredRoute exact path="/posts/crawler" component={PostCrawler} />
            <Route path="/accounts" component={AccountsRoutes} />
        </>
    );
}

export default Root;
