import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import PersonalDataForm from './components/PersonalDataForm';
import PaymentQR from './components/PaymentQR';
import EntryQR from './components/EntryQR';
import Footer from './components/Footer';
import Login from './components/admin/Login';
import AdminDashboard from './components/admin/admin';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/personal-data" element={<PersonalDataForm />} />
            <Route path="/payment" element={<PaymentQR />} />
            <Route path="/entry" element={<EntryQR />} />
            <Route path='/login' element= {<Login />}/>
            <Route path='/admin' element= {<AdminDashboard />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
