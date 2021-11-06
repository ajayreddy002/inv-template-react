import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import React from "react";

const ViewInvoice = ({ products }) => {
    
    return (
        <div>
            <DataTable value={products} responsiveLayout="scroll" scrollDirection="both" scrollable>
                <Column field='collectionMethod' header='Collection Method' style={{ minWidth: '100px' }}></Column>
                <Column field='collectionAmount' header='Collection Amount' style={{ minWidth: '150px' }}></Column>
                <Column field='chqUtrNo' header='Cheque/UTR No' style={{ minWidth: '100px' }}></Column>
                <Column field='chqUtrDate' header='Cheque/UTR Date' style={{ minWidth: '200px' }}></Column>
                <Column field='bankName' header='Bank Name' style={{ minWidth: '200px' }}></Column>
                <Column field='customerId' header='Customer ID' style={{ minWidth: '150px' }}></Column>
                <Column field='customerName' header='Customer Name' style={{ minWidth: '200px' }}></Column>
                <Column field='customerGroup' header='Customer Group' style={{ minWidth: '200px' }}></Column>
                <Column field='salesGroup' header='Sales Group' style={{ minWidth: '200px' }}></Column>
                <Column field='currency' header='Currency' style={{ minWidth: '200px' }}></Column>
                <Column field='exchangeRate' header='Exchange Rate' style={{ minWidth: '200px' }}></Column>
                <Column field='collectionType' header='Collection Type' style={{ minWidth: '200px' }}></Column>
                <Column field='creditArea' header='Credit Area' style={{ minWidth: '200px' }}></Column>
                <Column field='postingDate' header='Posting Date' style={{ minWidth: '200px' }}></Column>
                <Column field='unique_ref_number' header='SOP Ref' style={{ minWidth: '200px' }}></Column>
                <Column field='status' header='Status' style={{ minWidth: '200px' }}></Column>
            </DataTable>
        </div>
    )
}
export default ViewInvoice;