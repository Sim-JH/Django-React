import React, {useEffect, useState} from "react";
import {Tag} from "antd";
import { axiosInstance, useAxios } from "api";
import {useAppContext} from "../store";

export default function TagSet({ post, setPostList }) {
    const {
        store: { jwtToken }
    } = useAppContext();


    const headers = { Authorization: `JWT ${jwtToken}` };

    const [tagList, setTagList] = useState([]);


    const [{ data: originTagList }, refetch] = useAxios({
        method: "GET",
        url: `/api/posts/${post.id}/tag/`,
        headers,
    });

    useEffect(() => {
        setTagList(originTagList);
    }, [originTagList]);

    const handleClick = async e => {
        // 태그 클릭 시, 장고 측으로부터 태깅된 Post object를 돌려받고 이것을 부모 PostList의 postList에 갱신해준다.
        try {
            const tag_name = e.target.innerText
            const tags_idx = post.tags.split(",").indexOf(tag_name)
            const tag_set_idx = post.tag_set[tags_idx]
            const response = await axiosInstance.get(
                `/api/posts/tag/${tag_set_idx}/`,
                {headers}
                );
            setPostList(response.data)
        }
        catch (error) {
            console.log(error)
        }

    };

    return (
        <>
            {tagList ?
                tagList.map((value, index) =>
                    <Tag className="post-tag"
                         key={index}>
                        <span onClick={handleClick}>
                             {value.length > 20 ? `${value.slice(0, 20)}...` : value}
                        </span>
                    </Tag>
                )
                :
                null
            }
        </>
    );
}
