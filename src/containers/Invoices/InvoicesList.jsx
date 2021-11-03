import React, { useEffect, useState } from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { getInvoiceList } from "../../services/base-api.sevrice";
import DataTableCrudDemo from "../../components/DataTable/DataTable";
export const InvoicesListComponent = () => {
    const [products, setProducts] = useState([]);
    useEffect(() => {
        setProducts(getInvoiceList());
    }, []);
    return (
        <div className="inv-list">
            <DataTableCrudDemo></DataTableCrudDemo>
            {/* <DataTable value={products} stripedRows paginator sortMode="multiple">
                    <Column field="code" header="Code" sortable></Column>
                    <Column field="name" header="Name" sortable></Column>
                    <Column field="category" header="Category" sortable></Column>
                    <Column field="quantity" header="Quantity" sortable></Column>
                </DataTable> */}
        </div>
    )
}