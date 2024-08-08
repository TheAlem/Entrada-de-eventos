import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import PersonalDataForm from './components/PersonalDataForm';
import PaymentQR from './components/PaymentQR';
import EntryQR from './components/EntryQR';
import Footer from './components/Footer';
import Login from './components/admin/Login';
import Escaneo from './components/admin/QRScanner'
import AdminDashboard from './components/admin/admin';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './Firebase/context/AuthContext';

function App() {
  const exampleToken = "83cfd42d-9558-413d-8061-9067a4be145b"; // Reemplaza con el token del documento real

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-grow pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/personal-data" element={<PersonalDataForm />} />
              <Route path="/payment" element={<PaymentQR />} />
              <Route path="/entry" element={<EntryQR token={exampleToken} />} />
              <Route path="/login" element={<Login />} />
              <Route path='/EscaneoQR' element={<ProtectedRoute><Escaneo/></ProtectedRoute>}/>
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
