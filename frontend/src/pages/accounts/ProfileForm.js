import React, {useEffect, useState} from "react"
import TopNav from "../../components/TopNav";
import {Avatar, Button, Card, Col, Form, Input, Row} from "antd";
import "./ProfileForm.scss"
import {useAppContext} from "../../store";
import {useAxios} from "../../api";
import Profile from "./Profile";

export default function ProfileForm() {
    const topnav = TopNav()

    const {
        store: { jwtToken }
    } = useAppContext();

    const headers = { Authorization: `JWT ${jwtToken}` };

    const [originProfile, setOriginProfile] = useState()

    const [{ data: response }, refetch] = useAxios({
        method: "GET",
        url: "/accounts/profile/",
        headers
    })

    useEffect(() => {
        setOriginProfile(response);
    }, [response]);


    return (
        <div className="ProfileForm">
            {topnav}
            <Card title="프로필">
                {originProfile && originProfile.map((value, index) => (
                    <Profile value={value} key={index}/>
                ))}
            </Card>
        </div>
    );
}
const button_layout = {
    wrapperCol: { span: 16 }
};

const tailLayout = {
    wrapperCol: { offset: 6, span: 16 }
};
