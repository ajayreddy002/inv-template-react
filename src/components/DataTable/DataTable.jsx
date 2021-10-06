import * as React from 'react';
import { DataGrid } from '@material-ui/data-grid';

const columns = [
    {
        field: 'Bank_Name',
        headerName: 'Bank Name',
        editable: true,
    },
    {
        field: 'Amount',
        headerName: 'Amount',
        editable: true,
    },
    {
        field: 'Chq_Ref_number',
        headerName: 'Chq Ref Number',
        type: 'number',
        editable: true,
    },
];

export default function DataTable({ tableData }) {
    return (
        <div style={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={tableData}
                columns={columns}
                pageSize={5}
                checkboxSelection
                disableSelectionOnClick
            />
        </div>
    );
}