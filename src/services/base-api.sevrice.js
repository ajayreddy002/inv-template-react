import axios from "axios";
const baseUrl = 'http://localhost:3002';
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
export const getDebitInvoicesById = (url, id) => {
    return axios.get(`${baseUrl}/${url}/${id}`);
}
export const getCreditInvoicesById = (url, id) => {
    return axios.get(`${baseUrl}/${url}/${id}`);
}
export const postAdvanceInvoice = (url, body) => {
    return axios.post(`${baseUrl}/${url}`, body)
}
export const postAdjustmentInvoice = (url, body) => {
    return axios.post(`${baseUrl}/${url}`, body)
}
export const postInvoice = (url, body) => {
    return axios.post(`${baseUrl}/${url}`, body)
}
export const getInvoicesList = (url) => {
    return axios.get(`${baseUrl}/${url}`)
}
export const deleteInvoiceById = (collectionType,id, url) => {
    return axios.delete(`${baseUrl}/${url}/${collectionType}/${id}`)
}
export const getBusinessPlaceAPI = (url) => {
    return axios.get(`${baseUrl}/${url}`);
}