import React, {useEffect, useRef, useState} from "react";
import {Button, Form, Input, Modal, notification, Tag, Tooltip, Upload} from "antd";
import {FrownOutlined, PlusOutlined} from "@ant-design/icons";
import {getBase64FromFile} from "utils/base64";
import {useAppContext} from "store";
import {parseErrorMessages} from "utils/forms";
import {useHistory} from "react-router-dom";
import {axiosInstance} from "api";
import {useLocation} from "react-router"
import "./PostNewForm.scss";

export default function PostNewForm() {
    const {
        store: { jwtToken }
    } = useAppContext();

    const history = useHistory();

    const [fileList, setFileList] = useState([]);
    const [tag, setTag] = useState({
        tags: [],
        inputVisible: false,
        inputValue: '',
        editInputIndex: -1,
        editInputValue: '',
    })

    const [previewPhoto, setPreviewPhoto] = useState({
        visible: false,
        base64: null
    });
    const [fieldErrors, setFieldErrors] = useState({});

    const handleUploadChange = ({ fileList }) => {
        setFileList(fileList);
    };

    console.log(fileList)


    const handlePreviewPhoto = async file => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64FromFile(file.originFileObj);
        }

        setPreviewPhoto({
            visible: true,
            base64: file.url || file.preview
        });
    };

    // useState 값 변경 이용 참조용 주석
    const handleClose = removedTag => {
        setTag({
            ...tag,
            tags: tag.tags.filter(value => value !== removedTag)
        });
    };

    const handleInputChange = e => {
        setTag({
            ...tag,
            inputValue: e.target.value
        });
    };


    const handleInputConfirm = () => {
        const inputValue = tag.inputValue;
        let tags = tag["tags"];

        if (inputValue) {
            if (inputValue && tag.tags.indexOf(inputValue) === -1) {
                tags = [...tags, inputValue];
                console.log(tags)
            }
            else {
                notification.open({
                    message: "태그 중복",
                    description: "태그는 중복될 수 없습니다.",
                    icon: <FrownOutlined style={{ color: "#ff3333" }}/>
                });
            }
            setTag({
                ...tag,
                tags: tags,
                inputVisible: false,
                inputValue: '',
            })
        }

        else {
            setTag({
                ...tag,
                tags: tags,
                inputVisible: false,
                inputValue: '',
            })
        }
    };

    const showInput = () => {
        setTag({
            ...tag,
            inputVisible: true
        });
    };


    const handleEditInputChange = e => {
        setTag({
            ...tag,
            editInputValue: e.target.value
        });
    };

    const handleEditInputConfirm = () => {
        const newTags = tag["tags"];
        newTags[tag.editInputIndex] = tag.editInputValue

        setTag({
            ...tag,
            tags: newTags,
            editInputIndex: -1,
            editInputValue: '',
        });
    };


    const handleFinish = async fieldValues => {
        const {
            caption,
            location,
            photo: { fileList }
        } = fieldValues;

        // FormData는 ajax로 폼 전송을 가능하게 해주는 FormData 객체
        // JSON 구조로 "KEY-VALUE" 구조로 데이터를 전송, 주로 페이지 전환 없이 폼 데이터를 제출할 때 사용한다.
        // 이때 VALUE는 문자열로 자동 변환된다.
        const formData = new FormData();
        formData.append("caption", caption);
        formData.append("location", location);
        formData.append("tags", tag.tags);
        fileList.forEach(file => {
            console.log(file.originFileObj)
            formData.append("photo", file.originFileObj);
        });

        for (var pair of formData.entries()) { console.log(pair[0]+ ', ' + pair[1] + typeof pair[1]); }

        const headers = { Authorization: `JWT ${jwtToken}` };

        try {
            const response = await axiosInstance.post(
                "/api/posts/",
                formData,
                {headers}
                );
            window.location.replace("/")
        } catch (error) {
            console.log( error.response )
            if (error.response) {
                const { status, data: fieldsErrorMessages } = error.response;
                if (typeof fieldsErrorMessages === "string") {
                    notification.open({
                        message: "서버 오류",
                        description: `에러) ${status} 응답을 받았습니다. 서버 에러를 확인해주세요.`,
                        icon: <FrownOutlined style={{ color: "#ff3333" }} />
                    });
                } else {
                    setFieldErrors(parseErrorMessages(fieldsErrorMessages));
                }
            }
        }
    };

    return (
        <Form {...layout} onFinish={handleFinish} autoComplete={"false"} className="Form">
            <Form.Item
                label="장소"
                name="location"
                rules={[{ required: true, message: "장소를 입력해주세요." }]}
                hasFeedback
                {...fieldErrors.location}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="내용"
                name="caption"
                rules={[{ required: true, message: "내용을 입력해주세요." }]}
                hasFeedback
                {...fieldErrors.caption}
                // 토큰이 틀린 경우 에러메세지, 만약 존재한다면 상위의 username error를 overwirte함
                {...fieldErrors.non_field_errors}
            >
                <Input.TextArea />
            </Form.Item>

            <Form.Item
                label="사진"
                name="photo"
                rules={[{ required: true, message: "사진을 업로드해주세요." }]}
                hasFeedback
                {...fieldErrors.photo}
            >
                <Upload
                    listType="picture-card"
                    fileList={fileList}
                    // 파일을 선택하자마자 업로드하지말고 모아서 submit 누를 시 업로드하도록
                    beforeUpload={() => {
                        return false;
                    }}
                    onChange={handleUploadChange}
                    onPreview={handlePreviewPhoto}
                >
                    {fileList.length > 0 ? null : (
                        <div>
                            <PlusOutlined />
                            <div className="ant-upload-text">업로드</div>
                        </div>
                    )}
                </Upload>
            </Form.Item>

            <Form.Item
                label="태그"
                name="tag"
            >
                <>
                    {tag.tags.map((value, index) => {
                        if (tag.editInputIndex === index) {
                            return (
                                <Input
                                    key={value}
                                    size="small"
                                    className="tag-input"
                                    value={tag.editInputValue}
                                    onChange={handleEditInputChange}
                                    onBlur={handleEditInputConfirm}
                                    onPressEnter={handleEditInputConfirm}
                                />
                            );
                        }

                        // 제한 20자
                        const isLongTag = value.length > 20;

                        const tagElem = (
                            <Tag className="edit-tag"
                                 key={value}
                                 closable
                                // 그냥 호출하면 모든 value를 한번에 보냄
                                 onClose={() => handleClose(value)}
                            >
                                <span
                                    onDoubleClick={() => {
                                        setTag({
                                            ...tag,
                                            editInputIndex: index,
                                            editInputValue: value
                                        });
                                    }}
                                >
                                    {isLongTag ? `${value.slice(0, 20)}...` : value}
                                </span>
                            </Tag>
                        );

                        return isLongTag ?(
                            // 커서 올릴 시 전체 내용 다 나올 수 있도록
                            <Tooltip title={value} key={value}>
                                {tagElem}
                            </Tooltip>
                        ) : (
                            tagElem
                        );
                    })}

                    {tag.inputVisible && (
                        <Input
                            type="text"
                            size="small"
                            className="tag-input"
                            value={tag.inputValue}
                            onChange={handleInputChange}
                            onBlur={handleInputConfirm}
                            onPressEnter={handleInputConfirm}
                        />
                    )}
                    {   // onClick시 inputVisible true해줘서 위의 입력 활성화 되도록
                        !tag.inputVisible && (
                            <Tag
                                className="site-tag-plus"
                                onClick={showInput}
                            >
                                <PlusOutlined /> 새 태그
                            </Tag>
                        )}
                </>
            </Form.Item>

            <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">
                    등록
                </Button>
            </Form.Item>

            <Modal
                visible={previewPhoto.visible}
                footer={null}
                onCancel={() => setPreviewPhoto({ visible: false })}
            >
                <img
                    src={previewPhoto.base64}
                    style={{ width: "100%" }}
                    alt="Preview"
                />
            </Modal>

            <hr />

        </Form>
    );
}

const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 }
};

const tailLayout = {
    wrapperCol: { offset: 6, span: 16 }
};


// 커서 유지를 위한 Ref 사용
// 원래 함수형 컴포넌트는 인스턴스를 가지지 않기 때문에 ref 속성을 사용할 수 없다.
// const textInput = useRef();
// console.log("textInput :", textInput)

// const testRef = input => {
//     console.log(input)
//     input.focus()
//     input.state["focused"] = false
//     console.log(input.state["prevValue"])
//     //input.state["focused"]
//     console.log(input)
//     console.log(input.state["focused"])
//
// }
//
// <Input
//     ref={testRef}
//     key={value}
//     size="small"
//     className="tag-input"
//     value={tag.editInputValue}
//     onChange={handleEditInputChange}
//     onBlur={handleEditInputConfirm}
//     onPressEnter={handleEditInputConfirm}
// />