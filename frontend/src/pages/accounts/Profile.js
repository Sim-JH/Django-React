import React, {useEffect, useState} from "react"
import TopNav from "../../components/TopNav";
import {Avatar, Button, Card, Col, Form, Input, message, Modal, notification, Row, Upload} from "antd";
import "./Profile.scss"
import {useAppContext} from "../../store";
import {axiosInstance, useAxios} from "api";
import {FrownOutlined, SmileOutlined, EyeTwoTone, EyeInvisibleOutlined} from "@ant-design/icons";
import {getBase64FromFile} from "../../utils/base64";


export default function Profile(value) {
    const {
        store: { jwtToken }
    } = useAppContext();
    const headers = { Authorization: `JWT ${jwtToken}` };

    const {avatar, username, first_name, last_name, phone_number, website_url} = value.value

    const [{ data: login_user }, login_refetch] = useAxios({
        url: "/accounts/username/",
        headers
    })

    const [isModalVisible, setIsModalVisible] = useState(false);

    const [imgBase64, setImgBase64] = useState();

    const [_first_name, _setfirst_name] = useState(first_name);
    const [_last_name, _setlast_name] = useState(last_name);
    const [_avatar, _setavatar] =useState(avatar);
    const [_phone_number, _setphone_number] = useState(phone_number);
    const [_website_url, _setwebsite_url] = useState(website_url);

    const [_password, _setpassword] = useState({
        old_password: "",
        new_password: ""
    });

    const getBase64 = (img, callback) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    }

    const hadleAavatar = (info) => {
        const image = info.fileList[0].originFileObj
        // 화면 상에 표시하기 위하여 base64로 변환.
        getBase64(image, imageUrl => {
            setImgBase64(imageUrl)
        })
        // Formdata 세팅은 IMG 그래도 넣어준다.
        _setavatar(image)
    }

    const handleProfile = async () => {
        const formData = new FormData();
        formData.append("username", login_user["username"])
        formData.append("first_name", _first_name)
        formData.append("last_name", _last_name)
        formData.append("avatar", _avatar,)
        formData.append("phone_number", _phone_number)
        formData.append("website_url", _website_url)

        for (var pair of formData.entries()) { console.log(pair[0]+ ', ' + pair[1] + typeof pair[1]); }

        try {
            const apiUrl = `/accounts/profile/${login_user["userpk"]}/`;

            const response = await axiosInstance.put(
                apiUrl,
                formData,
                {headers}
            );
            notification.open({
                message: "프로필 저장",
                description: "프로필이 성공적으로 저장되었습니다.",
                icon: <SmileOutlined style={{ color: "#108ee9" }}/>
            })
            console.log(response)
            window.location.reload()
        }
        catch (error) {
            //에러 400이 오면 유효성 검사 통과 못한 거니 메세지 띄워주기기
            if(error.response) {
                notification.open({
                    message: "프로필 저장 실패",
                    description: "올바른 양식을 입력해주세요.",
                    icon: <FrownOutlined style={{color: "#ff3333"}}/>
                });
            }
        }
    }

    const handleModalOk = async () => {
        // 기존 패스워드 인증 구현하려면 로그인에 있는 거 끌여와서 로그인 시도를 해보고 통과하면 진행 아니면 진행 x
        try{
            const check_data = {
                username: login_user["username"],
                password: _password["old_password"]
            }

            const response = await axiosInstance.post("/accounts/token/", check_data);

            try {
                const apiUrl = `/accounts/profile/${login_user["userpk"]}/pass_change/`;
                const pass_data = _password["new_password"]
                const response = await axiosInstance.put(
                    apiUrl,
                    {pass_data},
                    {headers}
                )
                notification.open({
                    message: "비밀번호 변경 성공",
                    description: "비밀번호 변경에 성공하였습니다.",
                    icon: <SmileOutlined style={{ color: "#108ee9" }}/>
                });
                _setpassword({
                    old_password: "",
                    new_password: ""
                })
                setIsModalVisible(false)
            }
            catch (error) {
                if(error.response.statusText === "Unauthorized") {
                    notification.open({
                        message: "비밀번호 변경 실패",
                        description: "올바른 양식을 입력해주세요.",
                        icon: <FrownOutlined style={{color: "#ff3333"}}/>
                    });
                }
                else {
                    console.log(error.response)
                }
             }
        }
        catch (error)
        {
            if(error.response) {
                notification.open({
                    message: "비밀번호 변경 실패",
                    description: "비밀번호를 확인해주세요.",
                    icon: <FrownOutlined style={{color: "#ff3333"}}/>
                });
            }

        }


    }

    const handleModalCancel = () => {
        _setpassword({
            old_password: "",
            new_password: ""
        })
        setIsModalVisible(false)
    }

    const handlePassword = () => {
        _setpassword({
            old_password: "",
            new_password: ""
        })
        setIsModalVisible(true);
    }

    return (
        <>
            <div className="Profile">
                <div className="profile_img">
                    <div  align="center">
                        <Upload
                            listType="picture-card"
                            beforeUpload={() => {
                                return false;
                            }}
                            onChange={hadleAavatar}
                            showUploadList={false}
                        >
                            {imgBase64 ?
                                <img src={imgBase64} alt="수정한 사진"  width="150"/>
                                :
                                <img src={avatar} alt="프르필 사진" width="150"/>
                            }
                        </Upload>
                    </div>
                </div>
                <div className="profile_items">
                    <div className="profile_code">
                        <div style={{marginBottom:"2em"}}>
                            이름
                        </div>
                        <div style={{marginBottom:"2em"}}>
                            ID
                        </div>
                        <div>
                            Password
                        </div>
                        <div style={{marginTop: "2em"}}>
                            휴대전화
                        </div>
                        <div style={{marginTop:"2em"}}>
                            웹사이트
                        </div>
                    </div>
                    <div style={{width:"350px"}}  className="profile_values">
                        <div className="profile_name" style={{marginBottom:"1.5em"}}>
                            <Input
                                style={{marginRight: "2em"}}
                                onChange={e => {_setfirst_name(e.target.value)}}
                                defaultValue={first_name} />
                            <Input
                                onChange={e => {_setlast_name(e.target.value)}}
                                defaultValue={last_name} />
                        </div>
                        <div style={{marginBottom:"1.5em"}}>
                            <Input placeholder={username} disabled/>
                        </div>
                        <div style={{marginBottom:"1.5em"}}>
                            <Input placeholder="*****"  disabled />
                        </div>
                        <div style={{marginBottom:"1.5em"}}>
                            <Input
                                onChange={e => {_setphone_number(e.target.value)}}
                                defaultValue={phone_number} />
                        </div>
                        <div>
                            <Input
                                onChange={e => {_setwebsite_url(e.target.value)}}
                                defaultValue={website_url}/>
                        </div>

                    </div>
                </div>
            </div>
            <hr/>
            <Form style={{marginTop: "20px", marginLeft: "270px"}} layout="inline">
                <Form.Item>
                    <Button onClick={handleProfile} type="primary">프로필 수정</Button>
                </Form.Item>
                <Form.Item style={{marginLeft: "20px"}}>
                    <Button onClick={handlePassword}>비밀번호 변경</Button>
                    <Modal
                        title="비밀번호 변경"
                        visible={isModalVisible}
                        onOk={handleModalOk}
                        okText="네"
                        onCancel={handleModalCancel}
                        cancelText="아니오"
                   >
                        <Form.Item label="기존 비밀번호">
                            <Input.Password
                                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                allowClear
                                value={_password["old_password"]}
                                onChange={e => {_setpassword(
                                {
                                    ..._password,
                                    old_password: e.target.value
                                }
                            )}}/>
                        </Form.Item>
                        <Form.Item label="변경 비밀번호">
                            <Input
                                allowClear
                                value={_password["new_password"]}
                                onChange={e => {_setpassword(
                                {
                                    ..._password,
                                    new_password: e.target.value
                                }
                            )}}/>
                        </Form.Item>
                    </Modal>
                </Form.Item>
            </Form>
        </>
    );
}
const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 }
};

const tailLayout = {
    wrapperCol: { offset: 6, span: 16 }
};



// const beforeUpload = (file) => {
//     const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
//     if (!isJpgOrPng) {
//         message.error('JPG/PNG 파일만 업로드 가능합니다.');
//     }
//     const isLt2M = file.size / 1024 / 1024 < 2;
//     if (!isLt2M) {
//         message.error('파일사이즈가 2MB 이하여야합니다.');
//     }
//     return isJpgOrPng && isLt2M;
// }
//