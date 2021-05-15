import React, {useState} from "react";
import {Avatar, Button, Card, Comment, Tooltip} from "antd";
import { HeartOutlined, HeartTwoTone, CloseOutlined } from "@ant-design/icons";
import CommentList from "./CommentList";
import TagSet from "./TagSet"
import {useAppContext} from "../store";
import {axiosInstance} from "../api";
import Modal from "antd/es/modal/Modal";

function Post({ post, login_user, handleLike, setPostList, refetch }) {
    const { author, caption, location, photo, tag_set, is_like } = post;
    const { username, name, avatar_url } = author;

    const {
        store: { jwtToken }
    } = useAppContext();

    console.log(login_user)

    const headers = { Authorization: `JWT ${jwtToken}` };

    const [isModalVisible, setIsModalVisible] = useState(false);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleDelete = async () => {
        try {
            const response = await axiosInstance.delete(
                `/api/posts/${post.id}/`,
                {headers}
            );
            setIsModalVisible(false);
            refetch()
            // window.location.replace("/")
        }
        catch (error){
            console.log(error.response)
        }
    }

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <div className="post">
            <Card
                style={{ marginBottom: "1em" }}
                hoverable
                cover={<img src={photo} alt={caption}/>}
                actions={[
                    is_like ? (
                        <HeartTwoTone
                            twoToneColor="#eb2f96"
                            onClick={() => handleLike({ post, isLike: false })}
                        />
                    ) : (
                        <HeartOutlined onClick={() => handleLike({ post, isLike: true })} />
                    )
                ]}
                title={location}
                extra={
                    login_user === username ? (
                        <Button
                        type="primary"
                        size="small"
                        shape="circle"
                        onClick={showModal}
                        icon={<CloseOutlined />}/>
                    ) : true
                }
            >
                <Modal
                    visible={isModalVisible}
                    onOk={handleDelete}
                    okText="네"
                    onCancel={handleCancel}
                    cancelText="아니요"
               >
                    <p>포스팅을 삭제하겠습니까?.</p>
                </Modal>

                <Card.Meta
                    avatar={
                        <Avatar
                            size="large"
                            icon={<img src={avatar_url} alt={username} />}
                        />
                    }
                    title={username}
                    description={caption}
                    style={{ marginBottom: "1em" }}
                />
                <div style={{ marginBottom: "1em" }}>
                    <TagSet post={post} setPostList={setPostList}/>
                </div>

                <CommentList post={post} login_user={login_user}/>
            </Card>

            {/* <img src={photo} alt={caption} style={{ width: "100px" }} />
      {caption}, {location} */}
        </div>
    );
}

export default Post;
