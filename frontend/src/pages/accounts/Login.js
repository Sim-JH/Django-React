import React, {useEffect, useState} from "react";
import { axiosInstance } from "api";
// import Axios from "axios";
import {Card, Form, Input, Button, notification} from "antd";
import { SmileOutlined, FrownOutlined } from "@ant-design/icons";
import {useHistory, useLocation} from "react-router-dom";
//import useLocalStorage from "utils/useLocalStorage";
import {setToken, useAppContext} from "store";
import {parseErrorMessages} from "utils/forms";
import "./Login.scss"


export default function Login() {
    const { dispatch } = useAppContext();
    const location = useLocation();
    const history = useHistory();
    // const [jwtToken, setJwtToken] = useLocalStorage("jwtToken", "");
    const [fieldErrors, setFieldErrors] = useState({});

    console.log("location.state :", location.state);
    // location의 from객체로 경로(pathname)이 넘어옴. 만약 안넘어오면 경로를 최상위주소로 설정
    const { from: loginRedirectUrl } = location.state || {
        from: { pathname: "/" }
    };

    //console.log("loaded jwtToken :", jwtToken);

    const onFinish = async (values) => {
        const { username, password } = values;

        setFieldErrors({});

        const data = { username, password };

        try {
            // login 토큰 받아오기
            const response = await axiosInstance.post("/accounts/token/", data);
            // {data: token} == const token = response.data
            // {data: {token}} == const token = response.data.token
            // {data: {token: jwtToken}} == const jwtToken = response.data.token
            // 단순히 response 하위 data 목록의 token을 추출하는 기능
            const { data: {token: jwtToken} } = response;
            console.log("response :", response);
            console.log("jwtToken :", jwtToken);

            // 로컬스토리지 대신 Context API와 Reducer를 사용해 JWT Token 공유
            // setJwtToken(jwtToken);
            dispatch(setToken(jwtToken))

            notification.open({
                message: "로그인 성공",
                icon: <SmileOutlined style={{ color: "#108ee9" }}/>
            })
            history.push(loginRedirectUrl);
        }
        catch (error) {
            if (error.response) {
                notification.open({
                    message: "로그인 실패",
                    description: "아이디와 암호를 확인해주세요.",
                    icon: <FrownOutlined style={{ color: "#ff3333" }}/>
                });

                const { data: fieldsErrorMessages } = error.response;
                setFieldErrors(parseErrorMessages(fieldsErrorMessages))
            }
        }
    };

    const handleSignup = () => {
        history.push("/accounts/signup/")
    };

    return (
        <div className="Login">
            <Card title="로그인">
                <Form
                    {...layout}
                    onFinish={onFinish}
                    // onFinishFailed={onFinishFailed}
                >
                    <Form.Item
                        label="아이디"
                        name="username"
                        rules={[
                            { required: true, message: 'Please input your username!' },
                            { min: 5, message: "5글자 이상 입력해주세요."}
                        ]}
                        hasFeedback
                        {...fieldErrors.username}
                        // 토큰이 틀린 경우 에러메세지, 만약 존재한다면 상위의 username error를 overwirte함
                        {...fieldErrors.non_field_errors}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="비밀번호"
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                        {...fieldErrors.password}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item {...tailLayout}>
                        <Button type="primary" htmlType="submit">
                            로그인
                        </Button>

                        <Button style={{marginLeft: "1em"}} onClick={handleSignup}>
                            회원가입
                        </Button>

                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

const layout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 14 },
};
const tailLayout = {
    wrapperCol: { offset: 7, span: 14 },
};

