import Axios from "axios";
import { makeUseAxios } from "axios-hooks";
import {API_HOST} from "./Constants";

// Axios를 사용할 때 베이스 Url을 지정
export const axiosInstance = Axios.create({
    baseURL: API_HOST,
});


export const useAxios = makeUseAxios({
    axios: axiosInstance
});