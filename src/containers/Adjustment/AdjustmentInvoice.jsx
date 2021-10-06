import { FieldArray, Form, Formik } from "formik";
// import { useState } from "react";
import { Typeahead } from "react-bootstrap-typeahead";
import NumberFormat from "react-number-format";
const AdjustmentInvoice = () => {
    // const [showErr, setShowErr] = useState(false);
    const getValue = (invAmount, collectedAmount) => {
        if(parseInt(invAmount.replace(',', '')) > parseInt(collectedAmount.replace(',', ''))){
            return parseInt(invAmount.replace(',', '')) - parseInt(collectedAmount.replace(',', ''))
        } else {
            return ''
            // setShowErr(true)
            // toast.info('collected amount should lessthan invoice amount', {
            //     position: "top-right",
            //     autoClose: 5000,
            //     hideProgressBar: false,
            //     closeOnClick: true,
            //     pauseOnHover: true,
            //     draggable: true,
            //     progress: undefined,
            // });
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
                    initialValues={{
                        bankName: 1050042,
                        specialGlIndicator: 'A',
                        creditDocs: [],
                        debitDocs: []
                    }}
                >
                    {({
                        values,
                        handleChange
                    }) => (
                        <Form>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label htmlFor="bankName">Bank Name</label>
                                                    <input type="text" value={values.bankName} id="bankName" disabled name="bankName" className="form-control" placeholder="Bank Name" />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label htmlFor="bankName">Special GL Indicator</label>
                                                    <input type="text" id="specialGlIndicator" value={values.specialGlIndicator} disabled name="specialGlIndicator" className="form-control" placeholder="Special GL Indicator" />
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
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <FieldArray
                                                    name="creditDocs"
                                                    render={creditDocs => (
                                                        <>
                                                            <tr>
                                                                <td></td>
                                                                <td></td>
                                                                <td></td>
                                                                <td></td>
                                                                <td>
                                                                    <button className="btn btn-primary float-end mt-1" type="button" onClick={() => creditDocs.push({
                                                                        creditDocNo: '',
                                                                        postingDate: '',
                                                                        amount: '',
                                                                        adjAmount: '',
                                                                        remarks: ''
                                                                    })}>+ Add Credit Doc</button>
                                                                </td>
                                                            </tr>
                                                            {values && values.creditDocs.map((cItem, cIndex) =>
                                                                <tr key={cIndex}>
                                                                    <td>
                                                                        <div className="form-group">
                                                                            <Typeahead
                                                                                options={['Cre 01', 'Cre 02', 'Cre 03']}
                                                                                filterBy={['label']}
                                                                                placeholder="Credit Doc No"
                                                                                name={`creditDocs[${cIndex}].creditDocNo`}
                                                                                id={`creditDocs[${cIndex}].creditDocNo`}
                                                                                inputProps={{ required: true }}
                                                                                onChange={(e) => values.creditDocs[cIndex].creditDocNo = e[0]}
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group">
                                                                            <input type="date" className="form-control" name={`creditDocs[${cIndex}].postingDate`} id={`creditDocs[${cIndex}].postingDate`} placeholder="Posting Date" />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group">
                                                                            <input type="text" className="form-control" name={`creditDocs[${cIndex}].amount`} id={`creditDocs[${cIndex}].amount`} placeholder="Amount" />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group">
                                                                            <input type="text" className="form-control" name={`creditDocs[${cIndex}].adjAmount`} id={`creditDocs[${cIndex}].adjAmount`} placeholder="Adjustment Amount" />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group">
                                                                            <input type="text" className="form-control" name={`creditDocs[${cIndex}].remarks`} id={`creditDocs[${cIndex}].remarks`} placeholder="Remarks" />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <button type="button" className="btn btn-danger float-end mt-2 pt-2 px-4" onClick={() => creditDocs.remove(cIndex)}>-</button>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </>
                                                    )}
                                                />
                                            </tbody>
                                        </table>
                                        <table className="table caption-top">
                                            <caption className="fs-4">Debit Document Creation</caption>
                                            <thead>
                                                <tr>
                                                    <th>
                                                        Invoice/Debit Doc No
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
                                                        Balance Amount
                                                    </th>
                                                    <th>
                                                        Remarks
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
                                                                <td></td>
                                                                <td></td>
                                                                <td></td>
                                                                <td></td>
                                                                <td></td>
                                                                <td></td>
                                                                <td>
                                                                    <button className="btn btn-primary float-end mt-1" type="button" onClick={() => debitDocs.push({
                                                                        debitDocNo: '',
                                                                        OdnNo: '',
                                                                        postingDate: '',
                                                                        invAmount: '',
                                                                        collectedAmount: '',
                                                                        balanceAmount: '',
                                                                        remarks: ''
                                                                    })}>+ Add Debit Doc</button>
                                                                </td>
                                                            </tr>
                                                            {values && values.debitDocs.map((item, index) =>
                                                                <tr key={index}>
                                                                    <td>
                                                                        <div className="form-group">
                                                                            <Typeahead
                                                                                options={['Inv 01', 'Inv 02', 'Inv 03']}
                                                                                filterBy={['label']}
                                                                                placeholder="Inv/Debit Doc No"
                                                                                id={`debitDocs[${index}].debitDocNo`}
                                                                                name={`debitDocs[${index}].debitDocNo`}
                                                                                inputProps={{ required: true }}
                                                                                onChange={(e) => values.debitDocs[index].debitDocNo = e[0]}
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group">
                                                                            <Typeahead
                                                                                options={['Odn 01', 'Odn 02', 'Odn 03']}
                                                                                filterBy={['label']}
                                                                                placeholder="ODN No"
                                                                                name={`debitDocs[${index}].odnNo`}
                                                                                id={`debitDocs[${index}].odnNo`}
                                                                                inputProps={{ required: true }}
                                                                                onChange={(e) => values.debitDocs[index].odnNo = e[0]}
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group">
                                                                            <input type="date" className="form-control" name={`debitDocs[${index}].postingDate`} id={`debitDocs[${index}].postingDate`} />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group">
                                                                            <NumberFormat thousandSeparator={true} thousandsGroupStyle="lakh" name={`debitDocs[${index}].invAmount`} className="form-control" value={values.debitDocs[index].invAmount} id="invAmount" onChange={handleChange} placeholder="Invoice Amount" />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group">
                                                                            <NumberFormat thousandSeparator={true} thousandsGroupStyle="lakh" name={`debitDocs[${index}].collectedAmount`} className="form-control" value={values.debitDocs[index].collectedAmount} id="collectedAmount" onChange={handleChange} placeholder="Collected Amount" />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group">
                                                                            <NumberFormat thousandSeparator={true} thousandsGroupStyle="lakh" name={`debitDocs[${index}].balanceAmount`} className="form-control" value={getValue(values.debitDocs[index].invAmount, values.debitDocs[index].collectedAmount)} id="balanceAmount" onChange={handleChange} placeholder="Balance Amount" readOnly />
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group">
                                                                            <input type="text" className="form-control" name={`debitDocs[${index}].remarks`} id={`debitDocs[${index}].remarks`} placeholder="Remarks" />
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

                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    )
}
export default AdjustmentInvoice;