import React from "react";
import { Route, Redirect } from "react-router-dom";
import {useAppContext} from "store";

export default function LoginRequiredRoute({ component: Component, ...kwargs }) {
    const {
        store: { isAuthenticated }
    }= useAppContext();

    console.log("isAuthenticated :", isAuthenticated);

    if (isAuthenticated) {

    }
    else {

    }

    return (
        // props에는 react-router-dom으로 부터 match, location 같은 속성 값들이 넘어옴.
        // 이 중에서 location을 로그인 후 이동할 page route로 사용할 것
        <Route {...kwargs} render={props => {
            console.log("location :", props.location)
            // jwtToken인증 (즉 로그인 시 이동할 route)
            if (isAuthenticated) {
                return <Component {...props} />;
            }
            // (비로그인 시 이동할 route)
            else { return (
                <Redirect to={{
                    pathname: "/accounts/login",
                    // 위의 경로로 이동함과 함께 state로 location을 넘겨 줄 것.
                    state: { from: props.location }
                }}/>
            );
            }
        }}/>
    );
}
