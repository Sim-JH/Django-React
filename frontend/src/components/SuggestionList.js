import React, { useMemo, useState, useEffect } from "react";
import {useHistory} from "react-router-dom";
import { Card } from "antd";
import Suggestion from "./Suggestion";
import { useAxios, axiosInstance } from "api";
// import Axios from "axios";
// import useAxios from "axios-hooks"
import { useAppContext } from "store";
import Followers from "./Followers";
//import Axios from "axios";

export default function SuggestionList({ style }) {
    const {
        store: { jwtToken }
    } = useAppContext();
    const history = useHistory();

    const [userList, setUserList] = useState([]);
    const [followerList, setFollowerList] = useState([]);

    // Axios-hook으로 간편하게 사용. 이때 headers만 빼온다.
    const headers = { Authorization: `JWT ${jwtToken}` };

    // 응답 결과가 담기는 data, 통신진행 여부를 알려주는 loading,
    // 요청 에러를 담는 error와 요청을 다시 보낼 수 있는 refetch() 메서드를 리턴해주는 useAxios 훅
    const [{ data: origUserList, loading, error }, reSuggestion] = useAxios({
        url: "/accounts/suggestions/",
        headers
    });

    const [{ data: followUserList, followLoading, followError }, reFollow] = useAxios({
        url: "/accounts/follow/list",
        headers
    });

    // //useMemo는 해당 연산이 해당 디펜던시([origUserList])의 값이 바뀔 때만 수행한다.
    // const useList = useMemo(() => {
    //     if (!origUserList) return [];
    //     return origUserList.map(user => ({...user, is_Follow: false}))
    //
    // }, [origUserList]);

    // useEffect로 마운트 시 실행. componentDidMount와 같은 방식으로 사용 됨
    useEffect(() => {
        if (!origUserList) setUserList([]);
        else setUserList(origUserList.map(user => ({ ...user, is_follow: false })));
    }, [origUserList]);

    useEffect(() => {
        if (!followUserList) setFollowerList([]);
        else setFollowerList(followUserList.map(user => ({ ...user, is_follow: true })));
    }, [followUserList]);


    const onFollowUser = username => {
        const data = { username };
        const config = { headers };
        axiosInstance
            .post("/accounts/follow/", data, config)
            .then(response => {
                setUserList(prevUserList =>
                    prevUserList.map(user =>
                        user.username !== username ? user : { ...user, is_follow: true }
                    )
                );
                reSuggestion()
                reFollow()
            })
            .catch(error => {
                console.error(error);
            });
    };

    const onUnfollow = username => {
        const data = { username };
        const config = { headers };
        axiosInstance
            .post("/accounts/unfollow/", data, config)
            .then(response => {
                setFollowerList(prevUserList =>
                    prevUserList.map(user =>
                        user.username !== username ? user : { ...user, is_follow: false }
                    )
                );
                // Follow와 suggestion 목록 모두 새로고침 해줘야하므로 둘 다 불러온다.
                reSuggestion()
                reFollow()
            })
            .catch(error => {
                console.error(error);
            });
    };



    return (
        <>
            <div style={style}>
                {followLoading && <div>Loading ...</div>}
                {followError && <div>로딩 중에 에러가 발생했습니다.</div>}

                <Card title="팔로워 " size="small">
                    {followerList.map(followUser => (
                        <Followers
                            key={followUser.username}
                            followUser={followUser}
                            onUnfollow={onUnfollow}
                        />
                    ))}
                </Card>
            </div>

            <div style={style}>
                {loading && <div>Loading ...</div>}
                {error && <div>로딩 중에 에러가 발생했습니다.</div>}

                <Card title="팔로우 추천목록" size="small">
                    {userList.map(suggestionUser => (
                        <Suggestion
                            key={suggestionUser.username}
                            suggestionUser={suggestionUser}
                            onFollowUser={onFollowUser}
                        />
                    ))}
                </Card>
            </div>

        </>

    );



    // const onFollowUser = (username) => {
    //     setUserList(prevUserList =>{
    //         console.log("onFollowUser :", prevUserList)
    //         return prevUserList.map(user => {
    //             if ( user.username === username) {
    //                 return {...user, is_follow: true};
    //             } else return user;
    //         })
    //     })
    // };

    // useEffect(() => {
    //     async function fetchUserList() {
    //         const apiUrl = "http://127.0.0.1:8000/accounts/suggestions/";
    //         const headers = { Authorization: `JWT ${jwtToken}` };
    //         try {
    //             // const response = await Axios.get(apiUrl, {headers});
    //             //console.log("response :", response);
    //             // response 중에서 data항목만 사용
    //             const { data } = await Axios.get(apiUrl, {headers});
    //             setUserList(data);
    //         }
    //         catch (error) {
    //             console.error(error);
    //         }
    //     }
    //     fetchUserList();
    // }, [])

    // return (
    //     <div style={style}>
    //         <Card title="Suggestions for you" size="small">
    //             {userList.map(suggestionUser =>
    //             <Suggestion key={suggestionUser.username}
    //                         suggestionUser={suggestionUser} />
    //             )}
    //         </Card>
    //     </div>
    // );
}