import React, {useEffect, useState} from "react";
import { axiosInstance, useAxios } from "api";
// import Axios from "axios";
// import useAxios from "axios-hooks";
import {Form, Input, Button, notification, Card} from "antd";
import { SmileOutlined, FrownOutlined } from "@ant-design/icons";
import {useHistory} from "react-router";


export default function Signup() {
    const history = useHistory(); // 회원가입 성공 시 로그인페이지로
    const [fieldErrors, setFieldErrors] = useState({});

    // 성공했을때만 호출. 인자 values는 그냥 naming차이 e든 values든 상관없다.
    const onFinish = (values) => {
        async function fn() {
            console.log("oFinish :", values);
            const { username, password } = values;

            setFieldErrors({});

            const data = { username, password };

            // 밑의 Axios와 같은 동작 방식 다만 async awake 구조로 구현한 것
            try {
                await axiosInstance.post("/accounts/signup/", data);

                notification.open({
                    message: "회원가입 성공",
                    description: "로그인 페이지로 이동합니다.",
                    icon: <SmileOutlined style={{ color: "#108ee9" }}/>
                })
                history.push("/accounts/login");
            }
            catch (error) {
                if (error.response) {
                    notification.open({
                        message: "회원가입 실패",
                        description: "아이디와 암호를 확인해주세요.",
                        icon: <FrownOutlined style={{ color: "#ff3333" }}/>
                    });

                    // data를 fieldsErrorMessages 단순 AS 한 것.
                    const { data: fieldsErrorMessages } = error.response;

                    setFieldErrors (
                        // fieldsErrorMessages => { username:"m1", "m2"], password: [] } 형식으로 이뤄짐
                        // entries = python: dict.items()
                        Object.entries(fieldsErrorMessages).reduce(
                            (acc, [fieldName, errors]) => {
                                // username: ["m1", "m2"].join(" ") => "m1 m2"
                                acc[fieldName] = {
                                    validateStatus: "error",
                                    help: errors.join(" ")
                                };
                                return acc;
                            }, {}) // {}에 저장
                    );

                }
            }
        }
        fn();
    };

    return (
        <Card title="회원가입">
            <Form
                {...layout}
                onFinish={onFinish}
                // onFinishFailed={onFinishFailed}
            >
                <Form.Item
                    label="Username"
                    name="username"
                    rules={[
                        { required: true, message: 'Please input your username!' },
                        { min: 5, message: "5글자 이상 입력해주세요."}
                    ]}
                    hasFeedback
                    {...fieldErrors.username}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                    {...fieldErrors.password}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item {...tailLayout}>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

const layout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 14 },
};
const tailLayout = {
    wrapperCol: { offset: 7, span: 14 },
};




// export default function Signup() {
//     const history = useHistory(); // 회원가입 성공 시 로그인페이지로
//
//     const [inputs, setInputs] = useState({ username: "", password: "" });
//     const [loading, setLoading] = useState(false);
//     const [errors, setErrors] = useState({});
//     const [formDisabled, setFormDisabled] = useState(true);
//
//     const onSubmit = (e) => {
//         e.preventDefault();
//
//         setLoading(true);
//         setErrors({});
//
//         Axios.post("http://localhost:8000/accounts/signup/", inputs)
//             .then(response => {
//                 console.log("response :", response);
//                 history.push("/accounts/login");
//             })
//             .catch(error => {
//                 console.log("error :", error);
//                 if (error.response) {
//                     setErrors({
//                         username: (error.response.data.username || []).join(" "),
//                         password: (error.response.data.password || []).join(" "),
//                     });
//                     console.log("error :", error.response);
//                 }
//             })
//             .finally(() => {
//                 setLoading(false);
//             });
//
//         console.log("onsubmit :", inputs);
//
//     };
//
//     // inputs 같이 바뀔 때 호출
//     useEffect(() => {
//         const isEnabled = Object.values(inputs).every(s => s.length > 0);
//         setFormDisabled(!isEnabled);
//         // const isDisabled = (inputs.username.length === 0 && inputs.password.length === 0);
//         // setFormDisabled(isDisabled);
//         console.log("changed inputs :", inputs);
//     }, [inputs]);
//
//     const onChange = e => {
//         const {name, value } = e.target;
//         setInputs(prev => ({
//             ...prev, // useState는 object 단위기에 필히 이전 값도 풀어서 넣어줘야한다.
//             [name]: value  // name을 평가 Array아님
//         }));
//     }
//
//     return (
//         <div>
//             <form onSubmit={onSubmit}>
//                 <div>
//                     <input type="text" name="username" onChange={onChange}/>
//                     {errors.username && <Alert type="error" message={errors.username}/>}
//                 </div>
//                 <div>
//                     <input type="password" name="password" onChange={onChange}/>
//                     {errors.password && <Alert type="error" message={errors.password}/>}
//                 </div>
//                 <input type="submit" value="회원가입" disabled={loading || formDisabled}/>
//             </form>
//         </div>
//     );
// }
//



// export default function Signup() {
//     const [username, setUsername] = useState("");
//     const [password, setPassword] = useState("");
//
//     const onSubmit = (e) => {
//         e.preventDefault();
//         console.log("onsubmit :", username, password);
//     };
//
//
//     return (
//         <div>
//             <form onSubmit={onSubmit}>
//                 <input type="text" name="username" onChange={e => setUsername(e.target.value)}/>
//                 <input type="password" name="password" onChange={e => setPassword(e.target.value)}/>
//                 <input type="submit" value="회원가입" />
//             </form>
//         </div>
//     );
// }