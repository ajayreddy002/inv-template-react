import './home.css';
import { Typeahead } from 'react-bootstrap-typeahead';
import { useHistory } from "react-router-dom";
import { useState } from 'react';
import { getCustomerDetails, getCustomerGroup, getSalesGroup } from '../../services/base-api.sevrice';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
// import { Formik } from 'formik';
const HomeComponent = () => {
    const validationSchema = Yup.object().shape({
        companyCode: Yup.string().required('Required'),
        creditArea: Yup.string().required('Required'),
        currency: Yup.string().required('Required'),
        exchangeRate: Yup.number().required('Required').typeError('Must be a number'),
        postingDate: Yup.date().required('Required').typeError('Must be a date'),
        salesGroup: Yup.string().required('Required'),
        salesOffice: Yup.string().required('Required'),
        customerGroup: Yup.string().required('Required'),
        collectionType: Yup.string().required('Required')
    })
    const history = useHistory();
    const options = [
        { id: 1, label: 'Tower company' },
        { id: 2, label: 'Opco' },
        { id: 3, label: 'Tower company 2' },
        { id: 4, label: 'Opco' },
        { id: 15, label: 'Channel Partners' },
        { id: 16, label: 'Direct Customers' },
        { id: 17, label: 'Private Label' },
        { id: 18, label: 'Zonel Railways' },
        { id: 19, label: 'IBD SCRAP' },
    ];
    const [customerId, setCustomerId] = useState('');
    const [error, showError] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customers, setCustomers] = useState([])
    const [sales, setSales] = useState([]);
    const searchForCustomer = () => {
        getCustomerDetails('customerdetails', customerId)
            .then(data => {
                console.log(data.data.data.Sold_Payer_Name)
                if (data.data && data.data.data.Sold_Payer_Name) {
                    setCustomerName(data.data.data.Sold_Payer_Name);
                    localStorage.setItem('customerName', data.data.data.Sold_Payer_Name)
                    localStorage.setItem('customerId', customerId)
                }
            }).catch(e => {
                console.log(e.status);
                toast.error('Customer Name does not exists', {
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
    useEffect(() => {
        getCustomers();
        getSales();
    }, [])
    const getCustomers = () => {
        getCustomerGroup('customergroup')
            .then(data => {
                console.log(data);
                if (data.data && data.data.data) {
                    setCustomers(data.data.data)
                }
            }).catch(e => {
                console.log(e)
            });
    }
    const getSales = () => {
        getSalesGroup('salesgroup')
            .then(data => {
                if (data.data && data.data.data) {
                    setSales(data.data.data)
                }
            }).catch(e => {
                console.log(e)
            });
    }
    const handleOnChange = (value) => {
        const regex = /^[0-9\b]+$/;
        if (value === '' || regex.test(value)) {
            setCustomerId(value);
            showError(false);
        } else {
            setCustomerId('');
            showError(true);
            setCustomerName('');
        }
    }
    const submitForm = (formValues, setIsSubmitting) => {
        if (formValues.collectionType === 'Advance') {
            history.push('/advance-invoice')
        }
        if (formValues.collectionType === 'Invoice') {
            history.push('/invoice')
        }
        if (formValues.collectionType === 'Adjustment') {
            history.push('/adjustment')
        }
    }
    return (
        <div className="home--block">
            <div className="card-header">
                <h1>Collection Management system</h1>
            </div>
            <div className="card-body">
                <Formik
                    enableReinitialize={true}
                    initialValues={{
                        customerId: '',
                        customerName: '',
                        companyCode: '',
                        customerGroup: '',
                        salesGroup: '',
                        salesOffice: '',
                        currency: '',
                        exchangeRate: '',
                        collectionType: '',
                        creditArea: '',
                        postingDate: ''
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values, { setSubmitting }) => {
                        console.log(values);
                        submitForm(values, setSubmitting);
                    }}
                >
                    {({ values, setFieldValue, handleChange, errors }) => (
                        <Form>
                            <div className="row">
                                <div className="col-md-4 col-sm-12 col-xs-12">
                                    <label htmlFor="customerCode">Customer Code</label>
                                    <div className="input-group">
                                        <input type="text" className={`form-control ${error ? 'is-invalid' : ''}`} name="customrId" id="customrId" placeholder="Customer ID" aria-describedby="basic-addon1" onChange={(event) => handleOnChange(event.target.value)} value={customerId} />
                                        {/* <input type="text" id="customerCode" name="customerCode" className="form-control" placeholder="Customer Code" /> */}
                                        <span className="input-group-text" id="basic-addon1" onClick={searchForCustomer} title="Click here to search">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                                            </svg>
                                        </span>
                                        {error &&
                                            <div id="customrId" className="invalid-feedback">
                                                Customer ID should be a number.
                                            </div>
                                        }
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-12 col-xs-12">
                                    <div className="form-group">
                                        <label htmlFor="customerName">Customer Name</label>
                                        <input type="text" id="customerName" disabled name="customerName" className="form-control" placeholder="Customer Name" value={customerName} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-12 col-xs-12">
                                    <div className="form-group">
                                        <label htmlFor="companyCode">Company Code</label>
                                        <input type="text" id="companyCode" name="companyCode" className="form-control" placeholder="Company Code" onChange={handleChange} />
                                        {errors && errors.companyCode ? (
                                            <div id="companyCode" className="error">
                                                {errors.companyCode}
                                            </div>) : null
                                        }
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-12 col-xs-12">
                                    <div className="form-group">
                                        <label htmlFor="basic-typeahead-single1">Customer Group</label>
                                        <Typeahead
                                            clearButton
                                            options={customers}
                                            filterBy={['Name']}
                                            placeholder="Type to select customer group"
                                            id="customerGroup"
                                            labelKey="Name"
                                            name="customerGroup"
                                            onChange={(selected) => setFieldValue('customerGroup', selected[0].Name)}
                                        />
                                        {errors && errors.customerGroup ? (
                                            <div id="customerGroup" className="error">
                                                {errors.customerGroup}
                                            </div>) : null
                                        }
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-12 col-xs-12">
                                    <div className="form-group">
                                        <label htmlFor="basic-typeahead-single">Sales Group</label>
                                        <Typeahead
                                            clearButton
                                            options={sales}
                                            filterBy={['Description']}
                                            placeholder="Type to select sales group"
                                            id="salesGroup"
                                            name="salesGroup"
                                            labelKey="Description"
                                            onChange={(selected) => setFieldValue('salesGroup', selected[0].Description)}
                                        />
                                        {errors && errors.salesGroup ? (
                                            <div id="salesGroup" className="error">
                                                {errors.salesGroup}
                                            </div>) : null
                                        }
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-12 col-xs-12">
                                    <div className="form-group">
                                        <label htmlFor="basic-typeahead-single">Sales Office</label>
                                        <Typeahead
                                            clearButton
                                            options={options}
                                            filterBy={['label']}
                                            placeholder="Type to select sales office"
                                            id="salesOffice"
                                            name="salesOffice"
                                            onChange={(selected) => setFieldValue('salesOffice', selected[0].label)}
                                        />
                                        {errors && errors.salesOffice ? (
                                            <div id="salesOffice" className="error">
                                                {errors.salesOffice}
                                            </div>) : null
                                        }
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-12 col-xs-12">
                                    <div className="form-group">
                                        <label htmlFor="currency">Currency</label>
                                        <Typeahead
                                            clearButton
                                            options={['INR', 'USD', 'EURO']}
                                            filterBy={['label']}
                                            placeholder="Currency"
                                            id="currency"
                                            name="currency"
                                            onChange={(selected) => setFieldValue('currency', selected[0])}
                                        />
                                        {errors && errors.currency ? (
                                            <div id="currency" className="error">
                                                {errors.currency}
                                            </div>) : null
                                        }
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-12 col-xs-12">
                                    <div className="form-group">
                                        <label htmlFor="exchangeRate">Exchange Rate</label>
                                        <input type="text" id="exchangeRate" name="exchangeRate" className="form-control" placeholder="Exchange Rate" onChange={handleChange} />
                                        {errors && errors.exchangeRate ? (
                                            <div id="exchangeRate" className="error">
                                                {errors.exchangeRate}
                                            </div>) : null
                                        }
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-12 col-xs-12">
                                    <div className="form-group">
                                        <label htmlFor="collectionType">Collection Type</label>
                                        <Typeahead
                                            clearButton
                                            options={['Invoice', 'Advance', 'Adjustment']}
                                            filterBy={['label']}
                                            placeholder="Collection Type"
                                            id="collectionType"
                                            name="collectionType"
                                            onChange={(selected) => setFieldValue('collectionType', selected[0])}
                                        />
                                        {errors && errors.collectionType ? (
                                            <div id="collectionType" className="error">
                                                {errors.collectionType}
                                            </div>) : null
                                        }
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-12 col-xs-12">
                                    <div className="form-group">
                                        <label htmlFor="creditArea">Credit Area</label>
                                        <Typeahead
                                            options={['INR', 'USD', 'EURO']}
                                            filterBy={['label']}
                                            placeholder="Credit Area"
                                            id="creditArea"
                                            name="creditArea"
                                            onChange={(selected) => setFieldValue('creditArea', selected[0])}
                                        />
                                        {errors && errors.creditArea ? (
                                            <div id="creditArea" className="error">
                                                {errors.creditArea}
                                            </div>) : null
                                        }
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-12 col-xs-12">
                                    <div className="form-group">
                                        <label htmlFor="postingDate">Posting Date</label>
                                        <input type="date" id="postingDate" name="postingDate" className="form-control" placeholder="Posting Date" onChange={handleChange} />
                                        {errors && errors.postingDate ? (
                                            <div id="postingDate" className="error">
                                                {errors.postingDate}
                                            </div>) : null
                                        }
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="d-flex justify-content-end">
                                        <button type="submit" className="btn btn-primary">Submit</button>
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
export default HomeComponent;