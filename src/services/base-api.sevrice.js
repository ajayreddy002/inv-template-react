import axios from "axios";
const baseUrl='http://localhost:3002';
export const getCustomerDetails = (url, id) => {
    return axios.get(`${baseUrl}/${url}/${id}`);
}
export const getCustomerGroup = (url) => {
    return axios.get(`${baseUrl}/${url}`);
}
export const getSalesGroup = (url) => {
    return axios.get(`${baseUrl}/${url}`);
}
export const getBankStatement = (url, customerName) => {
    return axios.get(`${baseUrl}/${url}/${customerName}`);
}
export const getInvoicesById = (url, id) => {
    return axios.get(`${baseUrl}/${url}/${id}`);
}