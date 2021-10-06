
import './App.css';
import {
  BrowserRouter as Router,
  Route,
} from "react-router-dom";
import HomeComponent from './containers/Home/HomeComponent';
import logo from './assets/amar-logo.png'
import AdvanceInvoice from './containers/Advance/AdvanceInvoice';
import InvoiceComponent from './containers/Invoice/InvoiceComponent';
import { ToastContainer } from 'react-toastify';
import AdjustmentInvoice from './containers/Adjustment/AdjustmentInvoice';
function App() {
  return (
    <div className="root">
      <ToastContainer/>
      <div className="logo--block">
        <img src={logo} alt="Amar raja" />
      </div>
      <Router>
        <Route path="/" exact component={HomeComponent}></Route>
        <Route path="/advance-invoice" exact component={AdvanceInvoice}></Route>
        <Route path="/invoice" exact component={InvoiceComponent}></Route>
        <Route path="/adjustment" exact component={AdjustmentInvoice}></Route>
      </Router>
    </div>
  );
}

export default App;
