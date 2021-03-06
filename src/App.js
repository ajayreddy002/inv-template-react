
import './App.css';
import {
  Route,
  useHistory,
  useLocation,
} from "react-router-dom";
import HomeComponent from './containers/Home/HomeComponent';
import logo from './assets/amar-logo.png'
import AdvanceInvoice from './containers/Advance/AdvanceInvoice';
import InvoiceComponent from './containers/Invoice/InvoiceComponent';
import { ToastContainer } from 'react-toastify';
import AdjustmentInvoice from './containers/Adjustment/AdjustmentInvoice';
import { InvoicesListComponent } from './containers/Invoices/InvoicesList';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
function App() {
  const location = useLocation();
  const history = useHistory();
  return (
    <div className="root">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="logo--block d-flex justify-content-between align-items-center">
        <img src={logo} alt="Amar raja" />
        {location.pathname !== '/' &&
          <button type="button" className="btn btn-outline-primary d-flex align-items-center justify-content-between" onClick={() => history.push('/')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-left me-3" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
            </svg>
            Go to previous page
          </button>
        }
        {location.pathname === '/' &&
          <button type="button" className="btn btn-outline-primary d-flex align-items-center justify-content-between" onClick={() => history.push('/create-reciept')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus" viewBox="0 0 16 16">
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
            </svg>
            Create SOP
          </button>
        }
      </div>
      <Route path="/" exact component={InvoicesListComponent}></Route>
      <Route path="/create-reciept" exact component={HomeComponent}></Route>
      <Route path="/advance-invoice" exact component={AdvanceInvoice}></Route>
      <Route path="/invoice" exact component={InvoiceComponent}></Route>
      <Route path="/adjustment" exact component={AdjustmentInvoice}></Route>
    </div>
  );
}

export default App;
