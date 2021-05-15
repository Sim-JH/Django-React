import React from 'react';
import {Route} from "react-router-dom";
import ProfileForm from "./ProfileForm"
import Login from "./Login";
import Signup from "./Signup";
import Home from "../Home";
import LoginRequiredRoute from "utils/LoginRequiredRoute";

function Routes({ match }) {
    return (
        //<React.Fragment>
        <>
            <LoginRequiredRoute
                exact path={match.url + "/profile"}
                component={ProfileForm}
            />
            {/*match.ul은 상위 index의 /accounts를 받음*/}
            <Route exact path={match.url + "/login"} component={Login} />
            <Route exact path={match.url + "/signup"} component={Signup} />
        </>
    );
}

export default Routes;