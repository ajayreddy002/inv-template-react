import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import './DataTableDemo.css';
import { deleteInvoiceById, getInvoicesList, getViewInvoice } from '../../services/base-api.sevrice';
import showToast from '../../utils/toast';
import ViewInvoice from '../../containers/Invoices/ViewInvoice';
const DataTableCrudDemo = () => {

    const [products, setProducts] = useState(null);

    const [deleteProductDialog, setDeleteProductDialog] = useState(false);
    const [viewDialog, setViewDialog] = useState(false);
    const [product, setProduct] = useState();
    const [viewInvData, setViewInvData] = useState();
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        getListOfInvoices();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const formatCurrency = (value) => {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'INR' });
    }

    const getListOfInvoices = () => {
        getInvoicesList('view')
            .then(
                data => {
                    console.log(data.data.data)
                    if (data.data && data.data.data.length > 0) {
                        setProducts(data.data.data);
                    }
                }
            ).catch(e => {
                showToast('error', 'Failed to get invoices');
            })
    }

    const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false);
    }
    const hideViewInvDialog = () => {
        setViewDialog(false);
    }

    const confirmDeleteProduct = (product) => {
        setProduct(product);
        setDeleteProductDialog(true);
    }
    const openViewInvDialog = (product) => {
        if (product) {
            getViewInvoice(product.collection_type, product.id, 'view')
                .then(data => {
                    console.log(data.data.data)
                    if (data.data && data.data.data) {
                        setViewInvData(data.data.data);
                        setViewDialog(true);
                    }
                }).catch(e => {
                    showToast('error', 'Failed to get invoices details, please try again')
                })
        }

    }

    const deleteProduct = () => {
        let _products = products.filter(val => val.id !== product.id);
        let _filteredProducts = products.filter(val => val.id === product.id);
        deleteInvoiceById(_filteredProducts[0].collection_type, _filteredProducts[0].id, 'delete')
            .then(data => {
                console.log(data.data);
                setDeleteProductDialog(false);
                setProduct(_products);
                getListOfInvoices();
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Reciept Deleted Successfully', life: 3000 });
            }).catch(e => {
                console.log(e);
                showToast('error', 'Failed to delete invoice, please try again');
            })
    }

    const exportCSV = () => {
        dt.current.exportCSV();
    }

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />
            </React.Fragment>
        )
    }

    const priceBodyTemplate = (rowData) => {
        if (rowData.collectionAmount || rowData.amount) {
            return formatCurrency(rowData.collectionAmount || rowData.amount);
        } else {
            return '-'
        }
    }
    const getClassName = (status) => {
        if (status !== null && status.toLowerCase() === 'pending') {
            return 'pending'
        }
        if (status !== null && status.toLowerCase() === 'completed') {
            return 'completed'
        }
    }
    const statusBodyTemplate = (rowData) => {
        return <span className={`product-badge status-${getClassName(rowData.status)}`}>{rowData.status}</span>;
    }
    const invNumberTemplate = (rowData) => {
        return <span>{rowData.chqUtrNo || rowData.creditDocNo}</span>;
    }
    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-eye" className="p-button-rounded p-button-primary p-mr-2 me-3" onClick={() => openViewInvDialog(rowData)} />
                {rowData && rowData.status !== null && rowData.status.toLowerCase() === 'pending' &&
                    <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => confirmDeleteProduct(rowData)} />
                }
            </React.Fragment>
        );
    }

    const header = (
        <div className="table-header">
            <h5 className="p-m-0">List of submitted SOP'S</h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </span>
        </div>
    );
    const deleteProductDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" className="p-button-secondary" onClick={hideDeleteProductDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-danger" onClick={deleteProduct} />
        </React.Fragment>
    );

    return (
        <div className="datatable-crud-demo">
            <Toast ref={toast} />
            <div>
                <Toolbar className="p-mb-4" right={rightToolbarTemplate}></Toolbar>
                <DataTable ref={dt} value={products} selection={selectedProducts} onSelectionChange={(e) => setSelectedProducts(e.value)}
                    dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                    globalFilter={globalFilter}
                    header={header} responsiveLayout="scroll">
                    <Column field="unique_ref_number" header="SOP Ref" sortable headerStyle={{ width: '105px' }}></Column>
                    <Column field="customerId" header="Customer ID" sortable className="w-130"></Column>
                    <Column field="customerName" header="Customer Name" sortable headerStyle={{ width: '155px' }}></Column>
                    <Column field="postingDate" header="Posting Date" sortable headerStyle={{ width: '135px' }}></Column>
                    <Column field="chqUtrNo" header="Credit Details" sortable className="w-150" body={invNumberTemplate}></Column>
                    <Column field="collectionAmount" header="Collection Amount" headerStyle={{ width: '165px' }} body={priceBodyTemplate} sortable></Column>
                    <Column field="invoice_number" header="Number of invoices" headerStyle={{ width: '170px' }} sortable></Column>
                    <Column field="collection_type" header="Collection Type" sortable headerStyle={{ width: '150px' }}></Column>
                    <Column field="status" header="Status" body={statusBodyTemplate} sortable headerStyle={{ width: '100px' }}></Column>
                    <Column body={actionBodyTemplate} headerStyle={{ width: '130px' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={deleteProductDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                <div className="confirmation-content">
                    {product && <span>Are you sure you want to delete <b>{product.unique_ref_number}</b>?</span>}
                </div>
            </Dialog>
            <Dialog visible={viewDialog} modal onHide={hideViewInvDialog} maximizable style={{ width: '75vw' }} header={`View of SOP Ref: ${viewInvData?.unique_ref_number}`}>
                <ViewInvoice products={[viewInvData]}></ViewInvoice>
            </Dialog>
        </div>
    );
}
export default DataTableCrudDemo;