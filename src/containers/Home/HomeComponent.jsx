import './home.css';
import { useHistory } from "react-router-dom";
import { useState } from 'react';
import { getCustomerDetails} from '../../services/base-api.sevrice';
import { useEffect } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import showToast from '../../utils/toast';
import { Calendar } from 'primereact/calendar';
const HomeComponent = () => {
    const validationSchema = Yup.object().shape({
        companyCode: Yup.string().required('Required'),
        customerName: Yup.string().required('Required'),
        creditArea: Yup.string().required('Required'),
        currency: Yup.string().required('Required'),
        exchangeRate: Yup.number().required('Required').typeError('Must be a number'),
        postingDate: Yup.date().required('Required').typeError('Must be a date'),
        salesGroup: Yup.string().required('Required'),
        salesOffice: Yup.string().required('Required'),
        customerGroup: Yup.string().required('Required'),
        collectionType: Yup.string().required('Required'),
    });
    const [formValues, setFormValues] = useState(
        {
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
            postingDate: new Date(),
            salesGroupCode: '',
            customerGroupCode: '',
            profitCenter: ''
        }
    )
    const history = useHistory();
    const [customerId, setCustomerId] = useState('');
    const [error, showError] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const searchForCustomer = () => {
        getCustomerDetails('customerdetails', customerId)
            .then(data => {
                if (data.data && data.data.data.Sold_Payer_Name) {
                    setCustomerName(data.data.data.Sold_Payer_Name);
                    setFormValues(prevValues => ({
                        ...prevValues,
                        companyCode: data.data.data.CompCode,
                        salesGroup: data.data.data.Sales_Grp.Description,
                        salesOffice: data.data.data.Sales_Office,
                        customerName: data.data.data.Sold_Payer_Name,
                        customerGroup: data.data.data.Cust_Group.Name,
                        salesGroupCode: data.data.data.Sales_Grp.SGrp,
                        customerGroupCode: data.data.data.Cust_Group.CGrp,
                        currency: data.data.data.Currency,
                        exchangeRate: data.data.data.Exch_Rate,
                        creditArea: data.data.data.Div_Desc,
                        profitCenter: data.data.data.Prft_Cntr,
                    }))
                    localStorage.setItem('customerName', data.data.data.Sold_Payer_Name)
                    localStorage.setItem('customerId', customerId)
                }
            }).catch(e => {
                console.log(e.status);
                showToast('error', 'Customer Name does not exists');
            })
    }
    useEffect(() => {
        if (localStorage.getItem('homeFields') !== null || undefined) {
            const homeFields = JSON.parse(localStorage.getItem('homeFields'));
            setCustomerId(homeFields.customerId)
            setCustomerName(homeFields.customerName)
            setFormValues(homeFields)
        }
    }, []);
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
        formValues.customerId = customerId;
        localStorage.setItem('homeFields', JSON.stringify(formValues));
        if (formValues.collectionType === 'Advance') {
            history.push('/advance-invoice');
        }
        if (formValues.collectionType === 'Invoice') {
            history.push('/invoice');
        }
        if (formValues.collectionType === 'Adjustment') {
            history.push('/adjustment');
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
                    initialValues={formValues}
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
                                    <div className="input-group" aria-describedby="passwordHelpBlock">
                                        <input type="text" className={`form-control ${error ? 'is-invalid' : ''}`} name="customrId" id="customrId" placeholder="Customer ID" aria-describedby="basic-addon1" onChange={(event) => handleOnChange(event.target.value)} value={customerId} />
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
                                    <div id="passwordHelpBlock" className="form-text">
                                        --To get details of customer please enter Customer ID.And click search icon.--
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
                                        <input type="text" id="companyCode" name="companyCode" disabled className="form-control" placeholder="Company Code" value={values.companyCode} onChange={handleChange} />
                                        {errors && errors.companyCode ? (
                                            <div id="companyCode" className="error">
                                                {errors.companyCode}
                                            </div>) : null
                                        }
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-12 col-xs-12">
                                    <div className="form-group">
                                        <label htmlFor="customerGroup">Customer Group</label>
                                        <input type="text" id="customerGroup" name="customerGroup" disabled className="form-control" placeholder="Sales Group" value={values.customerGroup} onChange={handleChange} />
                                        {errors && errors.customerGroup ? (
                                            <div id="customerGroup" className="error">
                                                {errors.customerGroup}
                                            </div>) : null
                                        }
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-12 col-xs-12">
                                    <div className="form-group">
                                        <label htmlFor="salesGroup">Sales Group</label>
                                        <input type="text" id="salesGroup" name="salesGroup" disabled className="form-control" placeholder="Sales Group" value={values.salesGroup} onChange={handleChange} />
                                        {errors && errors.salesGroup ? (
                                            <div id="salesGroup" className="error">
                                                {errors.salesGroup}
                                            </div>) : null
                                        }
                                    </div>
                                </div>
                                <div className="col-md-4 col-sm-12 col-xs-12">
                                    <div className="form-group">
                                        <label htmlFor="salesOffice">Sales Office</label>
                                        <input type="text" disabled id="salesOffice" name="salesOffice" className="form-control" value={values.salesOffice} placeholder="Sales Office" onChange={handleChange} />
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
                                        <select placeholder="Currency" className="form-select" disabled
                                            id="currency"
                                            name="currency" onChange={(e) => {
                                                if (e.target.value !== ('Select currency' || '') && e.target.value === 'INR') {
                                                    setFieldValue('exchangeRate', 1)
                                                }
                                                handleChange(e)
                                            }
                                            } value={values.currency}>
                                            <option value="" disabled defaultValue="Select currency">Select currency</option>
                                            <option value="INR">INR</option>
                                            <option value="USD">USD</option>
                                            <option value="EURO">EURO</option>
                                        </select>
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
                                        <input type="text" id="exchangeRate" disabled name="exchangeRate" className="form-control" value={values.exchangeRate} placeholder="Exchange Rate" onChange={handleChange} />
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
                                        <select placeholder="collectionType" className="form-select"
                                            id="collectionType"
                                            name="collectionType" onChange={handleChange} value={values.collectionType}>
                                            <option value="" disabled defaultValue="Select Collection Type">Select Collection Type</option>
                                            <option value="Invoice">Invoice</option>
                                            <option value="Advance">Advance</option>
                                            <option value="Adjustment">Adjustment</option>
                                        </select>
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
                                        <input placeholder="Currency" className="form-control"
                                            id="creditArea" disabled
                                            name="creditArea" onChange={handleChange} value={values.creditArea}/>
                                            {/* <option value="" disabled defaultValue="Select currency">Select Credit Area</option>
                                            <option value="INR">INR</option>
                                            <option value="USD">USD</option>
                                            <option value="EURO">EURO</option> */}
                                        {/* <Typeahead
                                            options={['INR', 'USD', 'EURO']}
                                            filterBy={['label']}
                                            placeholder="Credit Area"
                                            id="creditArea"
                                            name="creditArea"
                                            onChange={(selected) => setFieldValue('creditArea', selected[0])}
                                        /> */}
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
                                        {/* <input type="date" id="postingDate" name="postingDate" className="form-control" placeholder="Posting Date" value={values.postingDate} onChange={handleChange} /> */}
                                        <Calendar id="postingDate" name="postingDate" value={values.postingDate} onChange={handleChange}></Calendar>
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