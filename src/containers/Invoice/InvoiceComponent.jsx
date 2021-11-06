/* eslint-disable array-callback-return */
import { FieldArray, Form, Formik } from 'formik';
import { useEffect, createRef } from 'react';
import { useState } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import { toast } from 'react-toastify';
import { getBankStatement, getInvoicesById } from '../../services/base-api.sevrice';
import * as Yup from 'yup';
import Autocomplete from '@mui/material/Autocomplete';
import { Chip, TextField } from '@mui/material';
import NumberFormat from 'react-number-format';
import { postInvoice } from '../../services/base-api.sevrice';
import { useHistory } from 'react-router-dom';
import showToast from "../../utils/toast";
const InvoiceComponent = () => {
    const formikRef = createRef();
    const history = useHistory();
    const invoiceschema = Yup.object().shape({
        collectionAmount: Yup.mixed().required('Required').typeError('Must be a number'),
        chqUtrNo: Yup.mixed().required('Required').typeError('Must be a number'),
        chqUtrDate: Yup.date().required('Required').typeError('Must be a date'),
        file: Yup.mixed().required('Required'),
        postingDateInv: Yup.mixed().required('Required'),
        invoices: Yup.array().of(
            Yup.object().shape({
                invNo: Yup.mixed().required('Required'),
                odnNo: Yup.number().required('Required').typeError('Must be a number'),
                invAmount: Yup.mixed().required('Required'),
                collectedAmount: Yup.mixed().required('Required').typeError('Must be a number'),
                date: Yup.mixed().required('Required').typeError('Must be a date'),
                tds: Yup.number().required('Required').typeError('Must be a number'),
                tdsType: Yup.string().required('Required'),
                remarks: Yup.string().required('Required'),
                others: Yup.string().required('Required'),
            })
        ),
    })
    const [selectedInvoices, setSelectedInvoices] = useState([]);
    const [bankStatement, setBankStatement] = useState([]);
    const [bStatement, setBStatement] = useState([]);
    const [invoicesList, setInvoicesList] = useState([]);
    const [serachInputValue, setSearchInputValue] = useState('');
    const [isCmUtr, setIsCMUtr] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState({});
    useEffect(() => {
        getStatement();
        getInvoices();
    }, []);

    // Handling the filtering of records
    const requestSearch = (event) => {
        setSearchInputValue(event.target.value);
        const filteredRows = bStatement.filter((row) => {
            return row.Bank_Name.toLowerCase().includes(event.target.value.toLowerCase())
                || row.Chq_Ref_number.toLowerCase().includes(event.target.value.toLowerCase())
                || row.Amount.includes(parseInt(event.target.value));
        });
        setBankStatement(filteredRows);
    };

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
                        setBankStatement(data.data.data);
                        setBStatement(data.data.data)
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

    const getInvoices = () => {
        let custId = ''
        if (localStorage.getItem('customerId')) {
            custId = localStorage.getItem('customerId');
            getInvoicesById('invoices', custId)
                .then(data => {
                    if (data.data && data.data.data) {
                        setInvoicesList(data.data.data);
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

    // Here adding dynamic invoice fields on selection of invoices from dropdown
    const addFieldsOnInvoiceSelection = (invoice, arrayField) => {
        setSelectedInvoices(invoice);
        let amount = 0;
        let invNum = 0;
        let odnNo = 0;
        let billDate = new Date();
        // eslint-disable-next-line array-callback-return
        invoice.map(item => {
            invNum = item.Bill_Num;
            amount = item.NtAmt_Tr;
            odnNo = item.ODN;
            billDate = item.Bill_date;
        });
        arrayField.push({
            invNo: invNum,
            odnNo: odnNo,
            invAmount: amount,
            collectedAmount: '',
            date: billDate,
            tds: '',
            tdsType: '',
            bankCharges: '',
            remarks: '',
            others: ''
        })
    }
    const postInvoiceData = (values, setSubmitting) => {
        if (values && values.invoices) {
            let amount = 0;
            var invoiceAmount = 0;
            let isOver = false;
            values.invoices.map(item => {
                amount = parseInt(item.invAmount.replace(/,/g, ''));
                if ((parseInt(item.collectedAmount.replace(/,/g, '')) + parseInt(item.tds.replace(/,/g, '')) + parseInt(item.bankCharges.replace(/,/g, ''))) > amount) {
                    isOver = true;
                    return showToast('info', 'Please enter amount lessthan or equal to invoice amount')
                }
                invoiceAmount += parseInt(item.invAmount.replace(/,/g, ''));
            });
            console.log(invoiceAmount);
            // if(invoiceAmount > parseInt(values.collectionAmount.replace(/,/g, ''))){
            //     return showToast('error', 'Total Invoice amount should not be greater than collection amount', 'bottom-right')
            // }
            if ((localStorage.getItem('homeFields')) !== (undefined || null) && !isOver) {
                const homeFields = JSON.parse(localStorage.getItem('homeFields'));
                console.log(homeFields)
                values = { ...values, ...homeFields };
                console.log(JSON.stringify(values))
                postInvoice('invoice', values)
                    .then(
                        data => {
                            if (data && data.status === 200) {
                                console.log(data.data);
                                setSubmitting(false);
                                formikRef.current.setSubmitting(false);
                                localStorage.clear();
                                showToast('success', `Invoice SOP created successfully with ref number of ${data.data.data}`);
                                history.push('/');
                            }
                        }
                    ).catch(e => {
                        console.log(e);
                        showToast('error', 'Failed to create invoice, try again');
                    });
            }
        }
    }
    const handlePaymentSelection = (event, paymentSelected, setFieldValue) => {
        if (event.target.checked === true) {
            setSelectedPayment(paymentSelected);
            setFieldValue('collectionAmount', paymentSelected.Amount);
            setFieldValue('chqUtrNo', paymentSelected.Chq_Ref_number);
            setFieldValue('chqUtrDate', paymentSelected.Date);
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
            setFieldValue('chqUtrDate', '');
        }
    }
    return (
        <div className="home--block">
            <div className="card-header">
                <h1>Invoice Reciept Creation</h1>
            </div>
            <div className="card-body">
                <Formik
                    // enableReinitialize={true}
                    initialValues={{
                        collectionMethod: '',
                        collectionAmount: '',
                        chqUtrNo: '',
                        chqUtrDate: '',
                        bankName: '',
                        invoices: [],
                        file: ''
                    }}
                    validationSchema={invoiceschema}
                    onSubmit={(values, { setSubmitting }) => {
                        console.log(values);
                        postInvoiceData(values, setSubmitting);
                    }}
                    innerRef={formikRef}
                >
                    {({
                        values,
                        errors,
                        // touched,
                        handleChange,
                        // handleBlur,
                        handleSubmit,
                        // isSubmitting,
                        setFieldValue
                        /* and other goodies */
                    }) => (
                        <Form action="" onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-8">
                                    <div className="row">
                                        <div className="col-md-4 col-sm-12 col-xs-12">
                                            <div className="form-group">
                                                <label htmlFor="bank">Collection Method</label>
                                                <Typeahead
                                                    clearButton
                                                    options={['UTR', 'TT', 'Cheque']}
                                                    filterBy={['label']}
                                                    placeholder="Type to select collection method"
                                                    id="collectionMethod"
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
                                                            setFieldValue('chqUtrDate', '');
                                                            const bStatement = bankStatement;
                                                            bStatement.map(item => {
                                                                return item.isSelected = false;
                                                            });
                                                            setBankStatement(bStatement);
                                                        }
                                                    }
                                                    }
                                                    inputProps={{ required: true }}
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
                                                <input type="file" accept="image/*, application/pdf" id="file" name="file" className="form-control" placeholder="file"
                                                    onChange={(e) => {
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
                                                <NumberFormat thousandSeparator={true} disabled={isCmUtr && selectedPayment?.Amount !== undefined ? true : false} thousandsGroupStyle="lakh" id="collectionAmount" name="collectionAmount" className="form-control" placeholder="Collection Amount" value={values.collectionAmount} onChange={handleChange} />
                                                {/* <input type="text" id="collectionAmount" name="collectionAmount" className="form-control" placeholder="Collection Amount" onChange={handleChange} /> */}
                                                {errors && errors.collectionAmount ? (
                                                    <div id="customrId" className="error">
                                                        {errors.collectionAmount}
                                                    </div>) : null
                                                }
                                            </div>
                                        </div>
                                        <div className="col-md-4 col-sm-12 col-xs-12">
                                            <div className="form-group">
                                                <label htmlFor="chequeNo">Cheque/UTR No</label>
                                                <input type="text" id="chequeNo" disabled={isCmUtr && selectedPayment?.Amount !== undefined ? true : false} name="chqUtrNo" value={values.chqUtrNo} className="form-control" placeholder="Cheque/UTR No" onChange={handleChange} />
                                                {errors && errors.chqUtrNo ? (
                                                    <div id="customrId" className="error">
                                                        {errors.chqUtrNo}
                                                    </div>) : null
                                                }
                                            </div>
                                        </div>
                                        <div className="col-md-4 col-sm-12 col-xs-12">
                                            <div className="form-group">
                                                <label htmlFor="chequeDate">Cheque/UTR Date</label>
                                                <input type="text" id="chequeDate" name="chqUtrDate" disabled={isCmUtr && selectedPayment?.Date !== undefined ? true : false} value={values.chqUtrDate} className="form-control" placeholder="Cheque/UTR Date" onChange={handleChange} />
                                                {errors && errors.chqUtrDate ? (
                                                    <div id="customrId" className="error">
                                                        {errors.chqUtrDate}
                                                    </div>) : null
                                                }
                                            </div>
                                        </div>
                                        <div className="col-md-4 col-sm-12 col-xs-12">
                                            <div className="form-group">
                                                <label htmlFor="bankName">Bank Name</label>
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
                                                <label htmlFor="postingDateInv">Posting Date</label>
                                                <input type="date" id="postingDateInv" name="postingDateInv" className="form-control" placeholder="Posting Date" onChange={handleChange} />
                                                {errors && errors.postingDateInv ? (
                                                    <div id="customrId" className="error">
                                                        {errors.postingDateInv}
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
                                        {/* <DataTable tableData={rows} /> */}
                                        <div className="bank--list">
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
                                                                <input type="checkbox" title="To enable please select collection method as UTR" disabled={values && values.collectionMethod !== 'UTR' ? true : false}
                                                                    onChange={(e) => handlePaymentSelection(e, bank, setFieldValue)} checked={bank.isSelected} />
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
                            </div>

                            <div className="table-responsive">
                                <table className="table caption-top">
                                    <thead>
                                        <tr>
                                            <th>
                                                Invoice No
                                            </th>
                                            <th>
                                                ODN No
                                            </th>
                                            <th>
                                                Invoice Amount
                                            </th>
                                            <th>
                                                Invoice Date
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
                                                Bank Charges
                                            </th>
                                            <th>
                                                Remarks
                                            </th>
                                            <th>
                                                Others
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <FieldArray name="invoices"
                                            render={invFields => (
                                                <>
                                                    <div className="filterBlock">
                                                        {invoicesList && invoicesList.length > 0 &&
                                                            <>
                                                                <div>
                                                                    <Autocomplete
                                                                        multiple
                                                                        id="tags-standard"
                                                                        freeSolo
                                                                        filterSelectedOptions
                                                                        options={invoicesList}
                                                                        onChange={(e, newValue) => {
                                                                            if (newValue.length > 0) {
                                                                                addFieldsOnInvoiceSelection(newValue, invFields)
                                                                            } else {
                                                                                setSelectedInvoices([]);
                                                                                values.invoices = [];
                                                                            }
                                                                        }}
                                                                        getOptionLabel={option => option.Bill_Num}
                                                                        renderTags={() => { }}
                                                                        value={selectedInvoices}
                                                                        renderInput={params => (
                                                                            <TextField
                                                                                {...params}
                                                                                variant="standard"
                                                                                placeholder="Add invoices"
                                                                                margin="normal"
                                                                                fullWidth
                                                                            />
                                                                        )}
                                                                    />
                                                                </div>
                                                                {selectedInvoices && selectedInvoices.length > 0 &&
                                                                    <div className="selectedTags">
                                                                        {selectedInvoices.map((option, index) => {
                                                                            // This is to handle new options added by the user (allowed by freeSolo prop).
                                                                            const label = option.Bill_Num || option;
                                                                            return (
                                                                                <Chip
                                                                                    key={label}
                                                                                    label={label}
                                                                                    // deleteIcon={<RemoveIcon />}
                                                                                    onDelete={() => {
                                                                                        console.log(option);
                                                                                        values.invoices.splice(index, 1);
                                                                                        setSelectedInvoices(selectedInvoices.filter(entry => entry !== option))
                                                                                    }}
                                                                                />
                                                                            );
                                                                        })}
                                                                    </div>
                                                                }
                                                            </>
                                                        }
                                                    </div>
                                                    {values && values.invoices.map((invFiled, index) =>
                                                        <tr key={`${invFiled}-${index}`}>
                                                            <td>
                                                                <div className="mb-3">
                                                                    <input type="text" value={values.invoices[index].invNo} disabled name={`invoices[${index}].invNo`} className="form-control" onChange={handleChange} id="invoiceNo" aria-describedby="nvoiceNo" placeholder="Invoice No" />
                                                                    {errors && errors.invoices && errors.invoices[index] && errors.invoices[index].invNo ? (<div id="invNo" className="error">
                                                                        {errors.invoices[index].invNo}
                                                                    </div>) : null}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="mb-3">
                                                                    <input type="text" name={`invoices[${index}].odnNo`} disabled value={values.invoices[index].odnNo} className="form-control" id="odnNo" onChange={handleChange} placeholder="ODN No" />
                                                                    {errors && errors.invoices && errors.invoices[index] && errors.invoices[index].odnNo ? (<div id="odnNo" className="error">
                                                                        {errors.invoices[index].odnNo}
                                                                    </div>) : null}
                                                                </div>
                                                            </td>
                                                            <td >
                                                                <div className="mb-3">
                                                                    <input type="text" value={values.invoices[index].invAmount} disabled name={`invoices[${index}].invAmount`} className="form-control" id="invoiceAmount" onChange={handleChange} placeholder="Invoice Amount" />
                                                                    {errors && errors.invoices && errors.invoices[index] && errors.invoices[index].invAmount ? (<div id="invAmount" className="error">
                                                                        {errors.invoices[index].invAmount}
                                                                    </div>) : null}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="mb-3">
                                                                    <input type="text" disabled value={values.invoices[index].date} name={`invoices[${index}].date`} className="form-control" id="date" placeholder="Date" onChange={handleChange} />
                                                                    {errors && errors.invoices && errors.invoices[index] && errors.invoices[index].date ? (<div id="date" className="error">
                                                                        {errors.invoices[index].date}
                                                                    </div>) : null}
                                                                </div>
                                                            </td>
                                                            <td width={200}>
                                                                <div className="mb-3">
                                                                    <NumberFormat thousandSeparator={true} thousandsGroupStyle="lakh" name={`invoices[${index}].collectedAmount`} className="form-control" value={values.invoices[index].collectedAmount} id="collectedAmount" onChange={handleChange} placeholder="Collected Amount" />
                                                                    {/* <input type="text" value={values.invoices[index].collectedAmount} name={`invoices[${index}].collectedAmount`} className="form-control" id="invoiceAmount" onChange={handleChange} placeholder="Collected Amount" /> */}
                                                                    {errors && errors.invoices && errors.invoices[index] && errors.invoices[index].collectedAmount ? (<div id="collectedAmount" className="error">
                                                                        {errors.invoices[index].collectedAmount}
                                                                    </div>) : null}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="mb-3">
                                                                    <input type="text" name={`invoices[${index}].tds`} className="form-control" id="tds" placeholder="TDS" onChange={handleChange} />
                                                                    {errors && errors.invoices && errors.invoices[index] && errors.invoices[index].tds ? (<div id="tds" className="error">
                                                                        {errors.invoices[index].tds}
                                                                    </div>) : null}
                                                                </div>
                                                            </td>
                                                            <td width="100">
                                                                <div className="mb-3">
                                                                    <select name={`invoices[${index}].tdsType`} id="tdsType" className="form-select" onChange={handleChange}>
                                                                        <option value="">select</option>
                                                                        <option value="194Q">194Q</option>
                                                                        <option value="194C">194C</option>
                                                                        <option value="GST">GST</option>
                                                                    </select>
                                                                    {errors && errors.invoices && errors.invoices[index] && errors.invoices[index].tdsType ? (<div id="tdsType" className="error">
                                                                        {errors.invoices[index].tdsType}
                                                                    </div>) : null}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="mb-3">
                                                                    <input type="text" name={`invoices[${index}].bankCharges`} className="form-control" id="bankCharges" placeholder="Bank Charges" onChange={handleChange} />
                                                                    {errors && errors.invoices && errors.invoices[index] && errors.invoices[index].bankCharges ? (<div id="bankCharges" className="error">
                                                                        {errors.invoices[index].bankCharges}
                                                                    </div>) : null}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="mb-3">
                                                                    <input type="text" name={`invoices[${index}].remarks`} className="form-control" id="remarks" placeholder="Remarks" onChange={handleChange} />
                                                                    {errors && errors.invoices && errors.invoices[index] && errors.invoices[index].remarks ? (<div id="remarks" className="error">
                                                                        {errors.invoices[index].remarks}
                                                                    </div>) : null}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="mb-3">
                                                                    <input type="text" name={`invoices[${index}].others`} className="form-control" id="others" placeholder="Others" onChange={handleChange} />
                                                                    {errors && errors.invoices && errors.invoices[index] && errors.invoices[index].others ? (<div id="others" className="error">
                                                                        {errors.invoices[index].others}
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
                            </div>
                            <div className="col-md-12">
                                <div className="d-flex justify-content-end">
                                    <button type="submit" className="btn btn-primary">Submit</button>
                                </div>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    )
}
export default InvoiceComponent;
