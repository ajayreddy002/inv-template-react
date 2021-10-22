import { FieldArray, Form, Formik } from 'formik';
import { createRef, useState } from 'react';
import { useEffect } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import { toast } from 'react-toastify';
import { getBankStatement, postAdvanceInvoice } from '../../services/base-api.sevrice';
import * as Yup from 'yup';
import showToast from '../../utils/toast';
import { useHistory } from 'react-router-dom';
const AdvanceInvoice = () => {
    const [bankStatement, setBankStatement] = useState([]);
    const [bStatement, setBStatement] = useState([]);
    const [serachInputValue, setSearchInputValue] = useState('');
    const [selectedPayment, setSelectedPayment] = useState({});
    const [isCmUtr, setIsCMUtr] = useState(false);
    const history = useHistory();
    const formikRef = createRef();
    useEffect(() => {
        getStatement();
    }, []);

    const requestSearch = (event) => {
        setSearchInputValue(event.target.value);
        const filteredRows = bStatement.filter((row) => {
            return row.Bank_Name.toLowerCase().includes(event.target.value.toLowerCase())
                || row.Chq_Ref_number.toLowerCase().includes(event.target.value.toLowerCase()) || row.Amount.includes(parseInt(event.target.value))
        });
        setBankStatement(filteredRows);
    };
    const adInvSchema = Yup.object().shape({
        // collectionMethod: Yup.string().required('Required'),
        collectionAmount: Yup.mixed().required('Required'),
        chqUtrNo: Yup.mixed().required('Required'),
        saleItems: Yup.array().of(
            Yup.object().shape({
                saleOrderNo: Yup.number().required('Required').typeError('Must be a number'),
                poNumber: Yup.number().required('Required').typeError('Must be a number'),
                soLineItem: Yup.number().required('Required').typeError('Must be a number'),
            })
        ),
        tds: Yup.number().required('Required').typeError('Must be a number'),
        remarks: Yup.string().required('Required').typeError('Must be a string'),
        file: Yup.mixed().required('Required')
    })
    const getStatement = () => {
        let custName = ''
        if (localStorage.getItem('customerName')) {
            custName = localStorage.getItem('customerName');
            getBankStatement('rtgsstatement', custName)
                .then(data => {
                    console.log(data.data);
                    if (data.data && data.data.data) {
                        data.data.data.map(item => {
                            return item.isSelected = false;
                        });
                        console.log(data.data.data)
                        setBankStatement(data.data.data);
                        setBStatement(data.data.data);
                    }
                }).catch(e => {
                    console.log(e);
                    toast.error('Failed to get statement please try again', {
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                })
        }
    }
    const handlePaymentSelection = (event, paymentSelected, setFieldValue) => {
        if (event.target.checked === true) {
            setSelectedPayment(paymentSelected);
            setFieldValue('collectionAmount', paymentSelected.Amount);
            setFieldValue('chqUtrNo', paymentSelected.Chq_Ref_number);
            let bStatement = bankStatement;
            bStatement.map(item => {
                if (item.Chq_Ref_number === paymentSelected.Chq_Ref_number) {
                    item.isSelected = true;
                } else {
                    item.isSelected = false;
                }
                return item;
            });
            setBankStatement(bStatement);
        } else {
            setSelectedPayment(null);
            let bStatement = bankStatement;
            const index = bStatement.findIndex(item => item.Chq_Ref_number === paymentSelected.Chq_Ref_number);
            bStatement[index].isSelected = false;
            setBankStatement(bStatement);
            setFieldValue('collectionAmount', '');
            setFieldValue('chqUtrNo', '');
        }
    }
    const createAdvanceReciept = (values, { setSubmitting }) => {
        if ((localStorage.getItem('homeFields')) !== undefined || null) {
            const homeFields = JSON.parse(localStorage.getItem('homeFields'));
            console.log(homeFields)
            values = { ...values, ...homeFields }
            postAdvanceInvoice('advance', values)
                .then(
                    data => {
                        console.log(data);
                        if (data && data.status === 200) {
                            console.log(data.data);
                            setSubmitting(false);
                            formikRef.current.setSubmitting(false);
                            showToast('success', 'Advnace invoice created successfully');
                            localStorage.clear();
                            history.push('/');
                        }
                    }
                )
        }
    }
    return (
        <div className="home--block">
            <div className="card-header">
                <h1>Advance Reciept Creation</h1>
            </div>
            <div className="card-body">
                <Formik
                innerRef={formikRef}
                    initialValues={{
                        homeFields: {},
                        specialGlIndicator: 'A',
                        collectionMethod: '',
                        file: '',
                        collectionAmount: '',
                        chqUtrNo: '',
                        saleItems: [{ saleOrderNo: '', soLineItem: '', poNumber: '' }],
                        tds: '',
                        tdsType: '',
                        bankName: '',
                        bankDetails: '',
                        profitCenter: '',
                        remarks: '',
                        businessPlace: '',
                        creditArea: '',
                    }}
                    validationSchema={adInvSchema}
                    onSubmit={(values, { setSubmitting }) => {
                        createAdvanceReciept(values, { setSubmitting })
                    }}
                >
                    {({
                        values,
                        errors,
                        handleChange,
                        handleSubmit,
                        setFieldValue,
                        isSubmitting,
                    }) => (
                        <Form action="" onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-8">
                                    <div className="row">
                                        <div className="col-md-4 col-sm-12 col-xs-12">
                                            <div className="form-group">
                                                <label htmlFor="glIndicator">Special GL Indicator</label>
                                                <input type="text" disabled id="glIndicator" name="specialGlIndicator" className="form-control" value="A" placeholder="Company Code" />
                                            </div>
                                        </div>
                                        <div className="col-md-4 col-sm-12 col-xs-12"></div>
                                        <div className="col-md-4 col-sm-12 col-xs-12"></div>
                                        <div className="col-md-4 col-sm-12 col-xs-12">
                                            <div className="form-group">
                                                <label htmlFor="collectionMethod">Collection Method</label>
                                                <Typeahead
                                                    clearButton
                                                    options={['UTR', 'TT', 'Cheque']}
                                                    filterBy={['label']}
                                                    placeholder="Type to collection method"
                                                    id="collectionMethod"
                                                    name="collectionMethod"
                                                    onChange={(e) => {
                                                        if (e.length > 0) {
                                                            setFieldValue('collectionMethod', e[0]);
                                                            setIsCMUtr(e[0] === 'UTR' ? true : false);
                                                        } else {
                                                            setFieldValue('collectionMethod', '');
                                                            setIsCMUtr(false);
                                                            setSelectedPayment(selectedPayment => selectedPayment = null)
                                                            setFieldValue('collectionAmount', '');
                                                            setFieldValue('chqUtrNo', '');
                                                            const bStatement = bankStatement;
                                                            bStatement.map(item => {
                                                                return item.isSelected = false;
                                                            });
                                                            setBankStatement(bStatement);
                                                        }
                                                    }}
                                                />
                                                {errors && errors.collectionMethod ? (
                                                    <div id="collectionMethod" className="error">
                                                        {errors.collectionMethod}
                                                    </div>) : null
                                                }
                                            </div>
                                        </div>
                                        <div className="col-md-4 col-sm-12 col-xs-12">
                                            <div className="form-group">
                                                <label htmlFor="file">Upload Documents</label>
                                                <input type="file" id="file" multiple accept="image/*, application/pdf" name="file" className="form-control" placeholder="Collection Method"
                                                    onChange={(e) => {
                                                        console.log(e.target.files[0])
                                                        console.log(JSON.stringify(e.target.files))
                                                        setFieldValue('file', e.target.files);
                                                    }}
                                                />
                                                {errors && errors.file ? (
                                                    <div id="file" className="error">
                                                        {errors.file}
                                                    </div>) : null
                                                }
                                            </div>
                                        </div>
                                        <div className="col-md-4 col-sm-12 col-xs-12">
                                            <div className="form-group">
                                                <label htmlFor="collectionAmount">Collection Amount</label>
                                                <input type="text" disabled={isCmUtr && selectedPayment?.Amount !== undefined ? true : false} id="collectionAmount" value={values.collectionAmount} onChange={handleChange} name="collectionAmount" className="form-control" placeholder="Collection Amount" />
                                                {errors && errors.collectionAmount ? (
                                                    <div id="collectionAmount" className="error">
                                                        {errors.collectionAmount}
                                                    </div>) : null
                                                }
                                            </div>
                                        </div>
                                        <div className="col-md-4 col-sm-12 col-xs-12">
                                            <div className="form-group">
                                                <label htmlFor="chequeNo">Cheque/UTR No</label>
                                                <input type="text" disabled={isCmUtr && selectedPayment?.Chq_Ref_number !== undefined ? true : false} id="chequeNo" onChange={handleChange} value={values.chqUtrNo} name="chqUtrNo" className="form-control" placeholder="Cheque/UTR No" />
                                                {errors && errors.chqUtrNo ? (
                                                    <div id="chequeNo" className="error">
                                                        {errors.chqUtrNo}
                                                    </div>) : null
                                                }
                                            </div>
                                        </div>
                                        <div className="col-md-4 col-sm-12 col-xs-12">
                                            <div className="form-group">
                                                <label htmlFor="tds">TDS</label>
                                                <input type="text" id="tds" onChange={handleChange} name="tds" value={values.tds} className="form-control" placeholder="TDS" />
                                                {errors && errors.tds ? (
                                                    <div id="tds" className="error">
                                                        {errors.tds}
                                                    </div>) : null
                                                }
                                            </div>
                                        </div>
                                        <div className="col-md-4 col-sm-12 col-xs-12">
                                            <div className="form-group">
                                                <label htmlFor="tdsType">TDS Type</label>
                                                <Typeahead
                                                    options={['194Q', '194C', 'GST']}
                                                    filterBy={['label']}
                                                    placeholder="Type to select TDS Type"
                                                    id="tdsType"
                                                    name="tdsType"
                                                    onChange={(e) => values.tdsType = e[0]}
                                                />
                                                {errors && errors.tdsType ? (
                                                    <div id="tdsType" className="error">
                                                        {errors.tdsType}
                                                    </div>) : null
                                                }
                                            </div>
                                        </div>
                                        <div className="col-md-4 col-sm-12 col-xs-12">
                                            <div className="form-group">
                                                <label htmlFor="bank">Bank Name</label>
                                                {isCmUtr === true ? (
                                                    <input type="text" id="bankName" disabled={isCmUtr && selectedPayment?.Bank_Name !== undefined ? true : false} onChange={handleChange} name="bankName" value={isCmUtr && selectedPayment?.Bank_Name !== undefined ? selectedPayment?.Bank_Name : values.bankName} className="form-control" placeholder="Bank Name" />
                                                ) :
                                                    < Typeahead
                                                        clearButton
                                                        options={['Kotak', 'Icici', 'HDFC', 'SBI', 'IOB']}
                                                        filterBy={['label']}
                                                        placeholder="Type to select Bank Name"
                                                        id="bankName"
                                                        name="bankName"
                                                        onChange={(e) => setFieldValue('bankName', selectedPayment.Bank_Name)}
                                                        inputProps={{ required: true }}
                                                    />
                                                }
                                                {errors && errors.bankName ? (
                                                    <div id="bankName" className="error">
                                                        {errors.bankName}
                                                    </div>) : null
                                                }
                                            </div>
                                        </div>
                                        <div className="col-md-4 col-sm-12 col-xs-12">
                                            <div className="form-group">
                                                <label htmlFor="bankDetails">Bank Details</label>
                                                <input type="text" onChange={handleChange} id="bankDetails" name="bankDetails" value={values.bankDetails} className="form-control" placeholder="Bank Details" />
                                                {errors && errors.bankDetails ? (
                                                    <div id="bankDetails" className="error">
                                                        {errors.bankDetails}
                                                    </div>) : null
                                                }
                                            </div>
                                        </div>
                                        <div className="col-md-4 col-sm-12 col-xs-12">
                                            <div className="form-group">
                                                <label htmlFor="profitCenter">Profit Center</label>
                                                <Typeahead
                                                    clearButton
                                                    options={['Profit1', 'Profit2', 'Profit3']}
                                                    filterBy={['label']}
                                                    placeholder="Type to select Profit Center"
                                                    id="profitCenter"
                                                    name="profitCenter"
                                                    onChange={(e) => values.profitCenter = e[0]}
                                                    inputProps={{ required: true }}
                                                />
                                                {errors && errors.profitCenter ? (
                                                    <div id="profitCenter" className="error">
                                                        {errors.profitCenter}
                                                    </div>) : null
                                                }
                                            </div>
                                        </div>
                                        <div className="col-md-4 col-sm-12 col-xs-12">
                                            <div className="form-group">
                                                <label htmlFor="remarks">Remarks</label>
                                                <input type="text" id="remarks" onChange={handleChange} value={values.remarks} name="remarks" className="form-control" placeholder="Remarks" />
                                                {errors && errors.remarks ? (
                                                    <div id="remarks" className="error">
                                                        {errors.remarks}
                                                    </div>) : null
                                                }
                                            </div>
                                        </div>
                                        <div className="col-md-4 col-sm-12 col-xs-12">
                                            <div className="form-group">
                                                <label htmlFor="businessPlace">Business Place</label>
                                                <Typeahead
                                                    clearButton
                                                    options={['place 1', 'place 2']}
                                                    filterBy={['label']}
                                                    placeholder="Type to select Business Place"
                                                    id="businessPlace"
                                                    name="businessPlace"
                                                    onChange={(e) => values.businessPlace = e[0]}
                                                />
                                                {errors && errors.businessPlace ? (
                                                    <div id="businessPlace" className="error">
                                                        {errors.businessPlace}
                                                    </div>) : null
                                                }
                                            </div>
                                        </div>
                                        <div className="col-md-4 col-sm-12 col-xs-12">
                                            <div className="form-group">
                                                <label htmlFor="creditArea">Credit Area</label>
                                                <Typeahead
                                                    clearButton
                                                    options={['Invoice', 'Advance', 'Adjustment']}
                                                    filterBy={['label']}
                                                    placeholder="Credit Area"
                                                    id="creditArea"
                                                    name="creditArea"
                                                    onChange={(e) => values.creditArea = e[0]}
                                                />
                                                {errors && errors.creditArea ? (
                                                    <div id="creditArea" className="error">
                                                        {errors.creditArea}
                                                    </div>) : null
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4 border p-0">
                                    <h2 className="m-0 p-h2">Payments List</h2>
                                    <div className="inv-number-block  px-2 ml-40">
                                        <div className="form-group inv-form mt-2">
                                            <label htmlFor="search">Filter by amount/crf number</label>
                                            <input type="text" className="form-control" value={serachInputValue} name="search" id="search" onChange={requestSearch} placeholder="Filter by amount/crf number" />
                                        </div>
                                        <div className="bank--list adv">
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th></th>
                                                        <th>
                                                            Bank Name
                                                        </th>
                                                        <th>
                                                            Amount
                                                        </th>
                                                        <th>
                                                            Cheque Ref Number
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {bankStatement.map(bank =>
                                                        <tr key={bank.Chq_Ref_number}>
                                                            <td>
                                                                <input type="checkbox" disabled={values.collectionMethod !== 'UTR' ? true : false} data-bs-toggle="tooltip" data-bs-placement="top" title="To enable please select collection method as UTR" onChange={(e) => {
                                                                    handlePaymentSelection(e, bank, setFieldValue)
                                                                }} checked={bank.isSelected}
                                                                />
                                                            </td>
                                                            <td>{bank.Bank_Name}</td>
                                                            <td>{bank.Amount}</td>
                                                            <td>{bank.Chq_Ref_number}</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-8">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Sale order no</th>
                                                <th>PO No</th>
                                                <th>PO Line Item</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <FieldArray name="saleItems"
                                                render={arrayHelper => (
                                                    <>
                                                        <tr>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td>
                                                                <button className="btn btn-primary float-end mt-1" type="button" onClick={() => arrayHelper.push({ saleOrderNo: '', soLineItem: '', poNumber: '' })}>+</button>
                                                            </td>
                                                        </tr>
                                                        {values.saleItems.map((item, index) =>
                                                            <tr key={index}>
                                                                <td>
                                                                    <div className="form-group">
                                                                        <input type="text" id="soNumber" onChange={handleChange} name={`saleItems[${index}].saleOrderNo`} className="form-control" placeholder="Sale Order no" />
                                                                        {errors && errors.saleItems && errors.saleItems[index] && errors.saleItems[index].saleOrderNo ? (<div id="saleOrderNo" className="error">
                                                                            {errors.saleItems[index].saleOrderNo}
                                                                        </div>) : null}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="form-group">
                                                                        <input type="text" id="soLineItem" onChange={handleChange} name={`saleItems[${index}].soLineItem`} className="form-control" placeholder="SO Line Item" />
                                                                        {errors && errors.saleItems && errors.saleItems[index] && errors.saleItems[index].soLineItem ? (<div id="soLineItem" className="error">
                                                                            {errors.saleItems[index].soLineItem}
                                                                        </div>) : null}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="form-group">
                                                                        <input type="text" id="PoNumber" onChange={handleChange} name={`saleItems.${index}.poNumber`} className="form-control" placeholder="PO Number" />
                                                                        {errors && errors.saleItems && errors.saleItems[index] && errors.saleItems[index].poNumber ? (<div id="poNumber" className="error">
                                                                            {errors.saleItems[index].poNumber}
                                                                        </div>) : null}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <button type="button" className="btn btn-danger float-end mt-2 pt-2 px-4" onClick={() => arrayHelper.remove(index)}>-</button>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </>
                                                )}
                                            />
                                        </tbody>
                                    </table>
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
export default AdvanceInvoice;