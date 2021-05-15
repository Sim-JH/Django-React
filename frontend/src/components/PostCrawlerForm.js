import React, {useEffect, useState} from "react";
import {Button, Checkbox, Form, Image, Input, InputNumber, notification} from "antd";
import {useAppContext} from "../store";
import {DownloadOutlined, FrownOutlined, SearchOutlined, SmileOutlined} from "@ant-design/icons";
import {useHistory} from "react-router-dom";
import {axiosInstance, useAxios} from "../api";

export default function PostCrawlerForm() {
    const {
        store: { jwtToken }
    } = useAppContext();

    const headers = { Authorization: `JWT ${jwtToken}` };

    // const [inputList, setInputList] = useState({
    //     keyword: "",
    //     amount: 1,
    // });

    const history = useHistory();
    // useState 사용시 자동으로 페이지 갱신 됨
    const [fieldErrors, setFieldErrors] = useState({});
    const [imgArray, setImgArray] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [loading, setLoading] = useState(false);

    let downloadPath = "C:\\ImgCrawl";
    let checkList = [];


    // useState는 비동기로 처리되기 때문에 checkList의 값을 감지하여 동작을 처리할 필요가 있음
    // useEffect(() => {
    //     console.log("checkList :", checkList)
    // }, [checkList]);

    const handleSearch = async values => {
        const apiUrl = "/crawler/"
        const {keyword, amount} = values
        const data = {keyword, amount}

        setSearchName(data.keyword);
        setLoading(true);
        const response = await axiosInstance.post(apiUrl, data, {headers});
        setLoading(false);

        // const response = await axiosInstance.post(apiUrl, data, {headers});
        const tmp = response.data

        setImgArray(tmp)
        downloadPath = "";
        checkList = []
    };

    const handlePath = e => {
        downloadPath = e.target.value
    }

    const handleCheck = (e, src) => {
        const checked = e.target.checked
        if(checked){
            checkList.push(src)
        }
        else {
            checkList = checkList.filter(element => element !== src)
        }
    };

    const handleCommit = async e => {
        if(checkList.length !== 0)
        {
            const apiUrl = "/crawler/download/";

            // 파일명 가공은 parser에서 아래 형태로로
            // var filename = String(searchName) + "_" + String(cnt);
            const response = await axiosInstance.post(
                apiUrl,
                {searchName, downloadPath, checkList},
                {headers}
            );
            notification.open({
                message: `${response.data[0]}개 파일 다운로드 성공,
                          ${response.data[1]}개 파일 다운로드 실패.`,
                description: "저장경로를 확인해주세요.",
                icon: <SmileOutlined style={{ color: "#108ee9" }}/>
            });
        }
        else {
            notification.open({
                message: "다운로드 실패",
                description: "다운로드 할 이미지를 선택해주세요",
                icon: <FrownOutlined style={{ color: "#ff3333" }}/>
            });
        }
    }

    return (
        <Form {...layout} style={{margin: "25px 0"}} onFinish={handleSearch} initialValues={{
            keyword: "",
            amount: 10,
            path: "C:\\ImgCrawl",
        }}>
            <Form.Item
                label="검색어"
                name="keyword"
                rules={[{ required: true, message: "키워드를 입력해주세요." }]}
                hasFeedback
                {...fieldErrors.caption}
                // 토큰이 틀린 경우 에러메세지, 만약 존재한다면 상위의 username error를 overwirte함
                {...fieldErrors.non_field_errors}
            >
                <Input placeholder="Input Keyword"/>
            </Form.Item>


            <Form.Item
                label="수량"
            >
                <Form.Item
                    name="amount"
                    rules={[{ required: true, type: 'number', message: "개수를 입력해주세요." }]}
                    style={{ display: 'inline-block'}}>
                    <InputNumber min={1} max={200}/>
                </Form.Item>

                <Form.Item
                    name="button"
                    style={{ display: 'inline-block', margin: "0 8px"}}>
                    {loading ?
                        <Button
                            type="primary"
                            shape="circle"
                            loading
                        />
                        :
                        <Button
                            type="primary"
                            shape="circle"
                            htmlType="submit"
                            icon={<SearchOutlined />}
                        />
                    }
                </Form.Item>
            </Form.Item>

            <Form.Item
                style={{margin: "-25px 0"}}
                label="저장경로"
                name="path"
                rules={[{ required: true, message: "저장 경로를 입력해주세요." }]}
            >
                <Input onChange={handlePath}/>
            </Form.Item>

            <Form.Item
                style={{ display: 'inline-block', margin: "50px 178px"}}
                rules={[{ message: "저장 경로를 입력해주세요." }]}>

                <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleCommit}
                >
                    다운로드
                </Button>

            </Form.Item>

            <hr/>

            <Form.Item {...imageLayout}>
                {imgArray.map((value, index) =>
                    // map용 key 설정은 상위 부모영역애서 해준다. <React.Fragment> = <></>와 같은 효과이다.
                    <React.Fragment key={index}>
                        <Checkbox
                            style={{padding: "2px"}}
                            onChange={(event) =>handleCheck(event, value)}
                        />

                        <Image
                            width={200}
                            src={value}
                        />
                        &nbsp; &nbsp; &nbsp; &nbsp;
                        {(index + 1) % 3 === 0 ? <br/> : true}
                    </React.Fragment>
                )}
            </Form.Item>

        </Form>
    );
}

const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 }
};

const imageLayout = {
    wrapperCol: { offset: 0.5 }
};
//


// var RequestNodes = this.props.data.map(function(request) {
//    /// ...
// }, this);
//
// var RequestNodes = this.props.data.map((request) => {
//        /// ...
// });


    // const handleCommit = e => {
    //     // PostNewForm 함수의 인자로 넘겨주기기
    //     // history.push({
    //     //     pathname: "/posts/new",
    //     //     state: {checkList: checkList}
    //     // });
    // }

    //
    // const handleCommit = async e => {
    //     const apiUrl = "/crawler/download/";
    //
    //
    //     let cnt = 0
    //     if(checkList){
    //         checkList.forEach((img_src) => {
    //             console.log("searchName2 :", searchName)
    //             cnt = cnt + 1;
    //             var filename = String(searchName) + "_" + String(cnt);
    //             console.log("filename", filename)
    //             console.log(img_src)
    //
    //             // src가 url로 이뤄진 경우(https로 시작) 먼저 base64로 인코드 해줘야한다
    //             // 즐찾 되어있는 글에 칸바스로 변환하는 법 참조해보기
    //             // if 문으로 src가 url일 경우와 base64일 경우로 나눠서 지정하자. 둘 다 아닐 경우에는 다운로드가 비정상 이뤄진 갯수 체크 후 pass
    //             // saveAs 라이브러리로 시도해보면 CORS 에러 발생. 위에 칸바스로 변환하는 걸로 해서 안되는 경우 그냥 백엔드 단에서 다운로드 하는 방법으로 가자.
    //             var a = saveAs(img_src, filename)
    //             console.log(a)
    //
    //
    //             // Blob 객체를 image/png 타입으로 생성한다. (application/octet-stream도 가능)
    //             blob = new Blob([view], { type: 'image/png' });
    //
    //             if (window.navigator.msSaveOrOpenBlob) {
    //                 window.navigator.msSaveOrOpenBlob(blob, filename);
    //             } else {
    //                 var a = document.createElement('a');
    //                 a.style = 'display: none';
    //                 a.href = img_src;
    //                 a.download = filename;
    //                 console.log(a)
    //                 document.body.appendChild(a);
    //                 a.click();
    //
    //                 setTimeout(function () {
    //                     document.body.removeChild(a);
    //                     //URL.revokeObjectURL(url);
    //                 }, 100);
    //             }
    //         })
    //     }
    // }


// return (
//     // 에러 처리도 확인해보기
//     <Form {...layout} onFinish={handleSearch} initialValues={{
//         keyword: "",
//         amount: 1,
//     }}>
//         <Form.Item
//             label="Keyword"
//             name="keyword"
//             // onChange={e => {
//             //     setInputList({
//             //         ...inputList,
//             //         keyword: e.target.value
//             //     })
//             //     // console.log(e.target)
//             // }}
//             rules={[{ message: "키워드를 입력해주세요." }]}
//
//             hasFeedback
//             {...fieldErrors.caption}
//             // 토큰이 틀린 경우 에러메세지, 만약 존재한다면 상위의 username error를 overwirte함
//             {...fieldErrors.non_field_errors}
//         >
//             <Input placeholder="Input Keyword"/>
//         </Form.Item>
//
//
//         <Form.Item
//             label="Amount"
//         >
//             <Form.Item
//                 name="amount"
//                 rules={[{ type: 'number', message: "개수를 입력해주세요." }]}
//                 style={{ display: 'inline-block'}}>
//                 <InputNumber
//                     //     onChange={e => {
//                     //     {
//                     //         setInputList({
//                     //             ...inputList,
//                     //             amount: e
//                     //         })
//                     //     }
//                     //     // console.log(typeof(e))
//                     //     // console.log(e)
//                     // }}
//                     min={1} max={200}/>
//             </Form.Item>
//
//             <Form.Item
//                 name="button"
//                 style={{ display: 'inline-block'}}>
//                 <Button
//                     style={{margin: "0 8px"}}
//                     type="primary"
//                     shape="circle"
//                     htmlType="submit"
//                     icon={<SearchOutlined />}
//                 />
//             </Form.Item>
//
//             <Form.Item
//                 name="button"
//                 style={{ display: 'inline-block'}}>
//                 <Button
//                     style={{margin: "0 12px"}}
//                     type="primary"
//                     icon={<DownloadOutlined />}
//                     onClick={handleCommit}
//                 >
//                     Download
//                 </Button>
//             </Form.Item>
//
//         </Form.Item>
//
//         <hr/>
//
//         <Form.Item {...imageLayout}>
//             {imgArray.map((value, index) =>
//                 <>
//                     {/*space 쓰면 체크 박스 위로 올릴 수 있기는 한데, 고민 좀 해보기*/}
//                     {/*하고 히스토리로 페이지 옮겨서 postnew작성하게하면 완성*/}
//                     {/*<Space align={"start"}>*/}
//                     <Checkbox
//                         style={{padding: "2px"}}
//                         onChange={(event) =>handleCheck(event, value)}
//                     />
//
//                     <Image
//                         width={200}
//                         height={200}
//                         src={value}
//                         key={index}
//                     />
//                     &nbsp; &nbsp; &nbsp; &nbsp;
//                     {(index + 1) % 3 === 0 ? <br/> : true}
//
//                     {/*</Space>*/}
//                 </>
//             )}
//
//         </Form.Item>
//
//         {/*<>*/}
//         {/*    {imgArray.map((value) => {*/}
//         {/*        <>{console.log(value)}*/}
//         {/*        </>*/}
//         {/*    })}*/}
//         {/*</>*/}
//
//         {/*반복문 처리로 불러온다음 클릭하면 포스트 페이지 new 페이지로 넘어가서 자동으로 해당 이미지 등록되도록*/}
//         {/*여러개로 묶어서 처리 할 수 있는 방법도 알아보자*/}
//         {/*체크박스 + 버튼 조합 생각해보자*/}
//         {/*체크박스 이미지 오른쪽 위에 나오게 추가한 다음 클릭하면 usestate로 선언된 변수에 추가해주고*/}
//         {/*컨펌 버튼 클릭시 포스트 뉴로 차례로 넘어가도록 구현*/}
//     </Form>
// );
// }
//
// const layout = {
//     labelCol: { span: 6 },
//     wrapperCol: { span: 16 }
// };
//
// const imageLayout = {
//     wrapperCol: { offset: 0.5 }
// };