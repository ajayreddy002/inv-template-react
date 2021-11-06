import { FieldArray, Form, Formik } from "formik";
import { createRef, useEffect, useState } from "react";
import { Typeahead } from "react-bootstrap-typeahead";
import NumberFormat from "react-number-format";
import { useHistory } from "react-router-dom";
import * as Yup from 'yup';
import { getCreditInvoicesById, getDebitInvoicesById, postAdjustmentInvoice } from "../../services/base-api.sevrice";
import showToast from "../../utils/toast";
const AdjustmentInvoice = () => {
    // const [showErr, setShowErr] = useState(false);
    const formikRef = createRef();
    const history = useHistory();
    const [debitInvoicesList, setDebitInvoicesList] = useState([]);
    const [creditInvoicesList, setCreditInvoicesList] = useState([]);
    const adjFieldSchema = Yup.object().shape({
        creditDocs: Yup.array().of(
            Yup.object().shape({
                creditDocNo: Yup.mixed().required('Required').typeError('Must be a number'),
                postingDate: Yup.mixed().required('Required').typeError('Must be a date'),
                amount: Yup.mixed().required('Required').typeError('Must be a number'),
                adjAmount: Yup.number().required('Required').typeError('Must be a number'),
                remarks: Yup.mixed().required('Required').typeError('Must be a number'),
            })
        ),
        debitDocs: Yup.array().of(
            Yup.object().shape({
                debitDocNo: Yup.mixed().required('Required').typeError('Must be a number'),
                odnNo: Yup.mixed().required('Required').typeError('Must be a number'),
                postingDate: Yup.mixed().required('Required').typeError('Must be a date'),
                invAmount: Yup.mixed().required('Required').typeError('Must be a number'),
                collectedAmount: Yup.mixed().required('Required').typeError('Must be a number'),
                tds: Yup.number().required('Required').typeError('Must be a number'),
                tdsType: Yup.mixed().required('Required').typeError('Must be a number'),
                remarks: Yup.mixed().required('Required').typeError('Must be a number'),
                others: Yup.mixed().required('Required').typeError('Must be a number'),
            })
        ),
    });

    useEffect(() => {
        getInvoices();
    }, []);
    const getInvoices = () => {
        let custId = ''
        if (localStorage.getItem('customerId')) {
            custId = localStorage.getItem('customerId');
            getDebitInvoicesById('debitinvoices', custId)
                .then(data => {
                    if (data.data && data.data.data) {
                        setDebitInvoicesList(data.data.data);
                    }
                }).catch(e => {
                    console.log(e);
                    showToast('error', 'Failed to get statement please try again');
                })
            getCreditInvoicesById('creditinvoices', custId)
                .then(data => {
                    if (data.data && data.data.data) {
                        setCreditInvoicesList(data.data.data);
                    }
                }).catch(e => {
                    console.log(e);
                    showToast('error', 'Failed to get statement please try again');
                })
        }
    }
    // Here calculating the balance amount
    const getValue = (invAmount, collectedAmount) => {
        return parseInt(invAmount.replace(/,/g, '')) - parseInt(collectedAmount.replace(/,/g, ''));
    }
    const createAdjustmentReciept = (values, { setSubmitting }) => {
        setSubmitting(true);
        if ((localStorage.getItem('homeFields')) !== undefined || null) {
            const homeFields = JSON.parse(localStorage.getItem('homeFields'));
            var dbInvAmount = 0;
            values.debitDocs.map(item => {
                dbInvAmount += parseInt(item.invAmount.replace(/,/g, ''));
                return item.balanceAmount = parseInt(item.invAmount.replace(/,/g, '')) - parseInt(item.collectedAmount.replace(/,/g, ''))
            });
            values = { ...values, ...homeFields }
            if(values && values.debitDocs.length === 0){
                formikRef.current.setSubmitting(false);
                return showToast('error', 'Please create at least one debit doc', 'bottom-right');
            }
            // if(values && dbInvAmount > parseInt( values.creditDocs[0].amount.replace(/,/g, ''))){
            //     formikRef.current.setSubmitting(false);
            //     return showToast('error', 'Please check debit document amount shold not be more than credit document amount', 'bottom-right');
            // }
            
            postAdjustmentInvoice('adjustment', values)
                .then(
                    data => {
                        if (data && data.status === 200) {
                            console.log(data.data);
                            setSubmitting(false);
                            formikRef.current.setSubmitting(false);
                            showToast('success', `Adjustment SOP created successfully with ref number of ${data.data.data}`);
                            localStorage.clear();
                            history.push('/');
                        }
                    }
                ).catch(e => {
                    console.log(e);
                    showToast('error', 'Failed to create adjustment reciept, try again');
                });
        }
    }
    return (
        <div className="home--block">
            <div className="card-header">
                <h1>Debit/Credit Adjustment Creation</h1>
            </div>
            <div className="card-body">
                <Formik
                    enableReinitialize={true}
                    innerRef={formikRef}
                    initialValues={{
                        bankName: 1050042,
                        creditDocs: [
                            {
                                creditDocNo: '',
                                postingDate: '',
                                amount: '',
                                adjAmount: '',
                                remarks: ''
                            }
                        ],
                        debitDocs: []
                    }}
                    validationSchema={adjFieldSchema}
                    onSubmit={(values, { setSubmitting }) => {
                        createAdjustmentReciept(values, { setSubmitting })
                    }}
                >
                    {({
                        values,
                        errors,
                        handleChange,
                        isSubmitting,
                        setFieldValue
                    }) => (
                        <Form>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label htmlFor="bankName">Bank Name</label>
                                                    <input type="text" value={values.bankName} id="bankName" disabled name="bankName" className="form-control" placeholder="Bank Name" onChange={handleChange} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6"></div>
                                <div className="col-md-12">
                                    <div className="table-responsive adv">
                                        <table className="table caption-top">
                                            <caption className="fs-4">Credit Document Creation</caption>
                                            <thead>
                                                <tr>
                                                    <th>
                                                        Adv/Credit Doc No
                                                    </th>
                                                    <th>
                                                        Posting Date
                                                    </th>
                                                    <th>
                                                        Amount
                                                    </th>
                                                    <th>
                                                        Adj Amount
                                                    </th>
                                                    <th>
                                                        Remarks
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <FieldArray
                                                    name="creditDocs"
                                                    render={creditDocs => (
                                                        <>
                                                            {values && values.creditDocs.map((cItem, cIndex) =>
                                                                <tr key={cIndex}>
                                                                    <td>
                                                                        <div className="form-group">
                                                                            <Typeahead
                                                                                options={creditInvoicesList}
                                                                                clearButton
                                                                                filterBy={['label']}
                                                                                labelKey={'Bill_Num'}
                                                                                placeholder="Credit Doc No"
                                                                                name={`creditDocs[${cIndex}].creditDocNo`}
                                                                                id={`creditDocs[${cIndex}].creditDocNo`}
                                                                                onChange={(e) => {
                                                                                    if (e && e.length > 0) {
                                                                                        setFieldValue(`creditDocs[${cIndex}].creditDocNo`, e[0].Bill_Num);
                                                                                        setFieldValue(`creditDocs[${cIndex}].postingDate`, e[0].Bill_date);
                                                                                        setFieldValue(`creditDocs[${cIndex}].amount`, e[0].NtAmt_Tr);
                                                                                    }
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        {errors && errors.creditDocs && errors.creditDocs[cIndex] && errors.creditDocs[cIndex].creditDocNo ? (<div id="creditDocNo" className="error">
                                                                            {errors.creditDocs[cIndex].creditDocNo}
                                                                        </div>) : null}
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group">
                                                                            <input type="text" className="form-control" name={`creditDocs[${cIndex}].postingDate`} id={`creditDocs[${cIndex}].postingDate`} value={values.creditDocs[cIndex].postingDate} disabled placeholder="Posting Date" onChange={handleChange} />
                                                                            {errors && errors.creditDocs && errors.creditDocs[cIndex] && errors.creditDocs[cIndex].postingDate ? (<div id="postingDate" className="error">
                                                                                {errors.creditDocs[cIndex].postingDate}
                                                                            </div>) : null}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group">
                                                                            <input type="text" className="form-control" name={`creditDocs[${cIndex}].amount`} id={`creditDocs[${cIndex}].amount`} value={values.creditDocs[cIndex].amount} placeholder="Amount" disabled onChange={handleChange} />
                                                                            {errors && errors.creditDocs && errors.creditDocs[cIndex] && errors.creditDocs[cIndex].amount ? (<div id="amount" className="error">
                                                                                {errors.creditDocs[cIndex].amount}
                                                                            </div>) : null}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group">
                                                                            <input type="text" className="form-control" name={`creditDocs[${cIndex}].adjAmount`} id={`creditDocs[${cIndex}].adjAmount`} placeholder="Adjustment Amount" onChange={handleChange} />
                                                                            {errors && errors.creditDocs && errors.creditDocs[cIndex] && errors.creditDocs[cIndex].adjAmount ? (<div id="adjAmount" className="error">
                                                                                {errors.creditDocs[cIndex].adjAmount}
                                                                            </div>) : null}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group">
                                                                            <input type="text" className="form-control" name={`creditDocs[${cIndex}].remarks`} id={`creditDocs[${cIndex}].remarks`} placeholder="Remarks" onChange={handleChange} />
                                                                            {errors && errors.creditDocs && errors.creditDocs[cIndex] && errors.creditDocs[cIndex].remarks ? (<div id="remarks" className="error">
                                                                                {errors.creditDocs[cIndex].remarks}
                                                                            </div>) : null}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </>
                                                    )}
                                                />
                                            </tbody>
                                        </table>
                                        <table className="table caption-top adj-table">
                                            <caption className="fs-4">Debit Document Creation</caption>
                                            <thead>
                                                <tr>
                                                    <th>
                                                        Inv/Debit Doc No
                                                    </th>
                                                    <th>
                                                        ODN No
                                                    </th>
                                                    <th>
                                                        Posting Date
                                                    </th>
                                                    <th>
                                                        Invoice Amount
                                                    </th>
                                                    <th>
                                                        Collected Amount
                                                    </th>
                                                    <th>
                                                        TDS
                                                    </th>
                                                    <th>
                                                        TDS Type
                                                    </th>
                                                    <th>
                                                        Balance Amount
                                                    </th>
                                                    <th>
                                                        Remarks
                                                    </th>
                                                    <th>
                                                        Others
                                                    </th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <FieldArray
                                                    name="debitDocs"
                                                    render={debitDocs => (
                                                        <>
                                                            <tr>
                                                                <td width={180}>
                                                                    <button className="btn btn-primary float-end mt-1" type="button" onClick={() => debitDocs.push({
                                                                        debitDocNo: '',
                                                                        odnNo: '',
                                                                        postingDate: '',
                                                                        invAmount: '',
                                                                        collectedAmount: '',
                                                                        tds: '',
                                                                        tdsType: '',
                                                                        balanceAmount: '',
                                                                        remarks: '',
                                                                        others: '',
                                                                    })}>+ Add Debit Doc</button>
                                                                </td>
                                                                <td></td>
                                                                <td></td>
                                                                <td></td>
                                                                <td></td>
                                                                <td></td>
                                                                <td></td>
                                                                <td></td>
                                                                <td></td>
                                                                <td></td>
                                                                <td>
                                                                </td>
                                                            </tr>
                                                            {values && values.debitDocs.map((item, index) =>
                                                                <tr key={index}>
                                                                    <td>
                                                                        <div className="form-group">
                                                                            <Typeahead
                                                                                clearButton
                                                                                options={debitInvoicesList}
                                                                                filterBy={['label']}
                                                                                labelKey={'Bill_Num'}
                                                                                placeholder="Inv/Debit Doc No"
                                                                                id={`debitDocs[${index}].debitDocNo`}
                                                                                name={`debitDocs[${index}].debitDocNo`}
                                                                                inputProps={{ required: true }}
                                                                                onChange={(e) => {
                                                                                    if (e && e.length > 0) {
                                                                                        setFieldValue(`debitDocs[${index}].debitDocNo`, e[0].Bill_Num);
                                                                                        setFieldValue(`debitDocs[${index}].postingDate`, e[0].Bill_date);
                                                                                        setFieldValue(`debitDocs[${index}].invAmount`, e[0].NtAmt_Tr);
                                                                                        setFieldValue(`debitDocs[${index}].odnNo`, e[0].ODN);
                                                                                    }
                                                                                }}
                                                                            />
                                                                            {errors && errors.debitDocs && errors.debitDocs[index] && errors.debitDocs[index].debitDocNo ? (<div id="debitDocNo" className="error">
                                                                                {errors.debitDocs[index].debitDocNo}
                                                                            </div>) : null}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group">
                                                                            <input type="text" disabled className="form-control" name={`debitDocs[${index}].odnNo`} id={`debitDocs[${index}].odnNo`} value={values.debitDocs[index].odnNo} onChange={handleChange} />
                                                                            {/* <Typeahead
                                                                                options={['Odn 01', 'Odn 02', 'Odn 03']}
                                                                                filterBy={['label']}
                                                                                placeholder="ODN No"
                                                                                name={`debitDocs[${index}].odnNo`}
                                                                                id={`debitDocs[${index}].odnNo`}
                                                                                inputProps={{ required: true }}
                                                                                onChange={(e) => setFieldValue(`debitDocs[${index}].odnNo`, e[0])}
                                                                            /> */}
                                                                            {errors && errors.debitDocs && errors.debitDocs[index] && errors.debitDocs[index].odnNo ? (<div id="odnNo" className="error">
                                                                                {errors.debitDocs[index].odnNo}
                                                                            </div>) : null}
                                                                        </div>
                                                                    </td>
                                                                    <td width={100}>
                                                                        <div className="form-group">
                                                                            <input type="text" disabled className="form-control" name={`debitDocs[${index}].postingDate`} id={`debitDocs[${index}].postingDate`} value={values.debitDocs[index].postingDate} onChange={handleChange} />
                                                                            {errors && errors.debitDocs && errors.debitDocs[index] && errors.debitDocs[index].postingDate ? (<div id="postingDate" className="error">
                                                                                {errors.debitDocs[index].postingDate}
                                                                            </div>) : null}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group">
                                                                            <NumberFormat thousandSeparator={true} thousandsGroupStyle="lakh" name={`debitDocs[${index}].invAmount`} disabled className="form-control" value={values.debitDocs[index].invAmount} id="invAmount" onChange={handleChange} placeholder="Invoice Amount" />
                                                                            {errors && errors.debitDocs && errors.debitDocs[index] && errors.debitDocs[index].invAmount ? (<div id="invAmount" className="error">
                                                                                {errors.debitDocs[index].invAmount}
                                                                            </div>) : null}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group">
                                                                            <NumberFormat thousandSeparator={true} thousandsGroupStyle="lakh" name={`debitDocs[${index}].collectedAmount`} className="form-control" value={values.debitDocs[index].collectedAmount} id="collectedAmount" onChange={handleChange} placeholder="Collected Amount" />
                                                                            {errors && errors.debitDocs && errors.debitDocs[index] && errors.debitDocs[index].collectedAmount ? (<div id="collectedAmount" className="error">
                                                                                {errors.debitDocs[index].collectedAmount}
                                                                            </div>) : null}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group">
                                                                            <input type="text" id={`debitDocs[${index}].tds`} onChange={handleChange} name={`debitDocs[${index}].tds`} value={values.debitDocs[index].tds} className="form-control" placeholder="TDS" />
                                                                            {errors && errors.tds ? (
                                                                                <div id="tds" className="error">
                                                                                    {errors.tds}
                                                                                </div>) : null
                                                                            }
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group">
                                                                            {/* <select className="form-select" name={`debitDocs[${index}].tdsType`} onChange={handleChange} id="tdsType">
                                                                                <option value="194Q">194Q</option>
                                                                                <option value="194C">194C</option>
                                                                                <option value="GST">GST</option>
                                                                            </select> */}
                                                                            <Typeahead
                                                                                options={['194Q', '194C', 'GST']}
                                                                                filterBy={['label']}
                                                                                placeholder="Type to select TDS Type"
                                                                                id="tdsType"
                                                                                name={`debitDocs[${index}].tdsType`}
                                                                                onChange={(e) => setFieldValue(`debitDocs[${index}].tdsType`, e[0])}
                                                                            />
                                                                            {errors && errors.debitDocs && errors.debitDocs[index] && errors.debitDocs[index].tdsType ? (<div id="tdsType" className="error">
                                                                                {errors.debitDocs[index].tdsType}
                                                                            </div>) : null}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group">
                                                                            <NumberFormat thousandSeparator={true} thousandsGroupStyle="lakh" name={`debitDocs[${index}].balanceAmount`} className="form-control" value={getValue(values.debitDocs[index].invAmount, values.debitDocs[index].collectedAmount)} id={`debitDocs[${index}].balanceAmount`} placeholder="Balance Amount" disabled />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group">
                                                                            <input type="text" className="form-control" name={`debitDocs[${index}].remarks`} id={`debitDocs[${index}].remarks`} placeholder="Remarks" onChange={handleChange} />
                                                                            {errors && errors.debitDocs && errors.debitDocs[index] && errors.debitDocs[index].remarks ? (<div id="remarks" className="error">
                                                                                {errors.debitDocs[index].remarks}
                                                                            </div>) : null}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group">
                                                                            <input type="text" className="form-control" name={`debitDocs[${index}].others`} id={`debitDocs[${index}].others`} placeholder="Others" onChange={handleChange} />
                                                                            {errors && errors.debitDocs && errors.debitDocs[index] && errors.debitDocs[index].others ? (<div id="others" className="error">
                                                                                {errors.debitDocs[index].others}
                                                                            </div>) : null}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <button type="button" className="btn btn-danger float-end mt-2 pt-2 px-4" onClick={() => debitDocs.remove(index)}>-</button>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </>
                                                    )}
                                                />
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="d-flex justify-content-end">
                                        <button type="submit" className="btn btn-primary" disabled={isSubmitting ? true : false}>
                                            {isSubmitting &&
                                                <span className="spinner-border spinner-border-sm mr-3" role="status" aria-hidden="true"></span>
                                            }
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    )
}
export default AdjustmentInvoice;