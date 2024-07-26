import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import PersonalDataForm from './components/PersonalDataForm';
import PaymentQR from './components/PaymentQR';
import EntryQR from './components/EntryQR';
import Footer from './components/Footer';

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
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
