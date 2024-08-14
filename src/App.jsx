import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import PersonalDataForm from './components/PersonalDataForm';
import PaymentQR from './components/PaymentQR';
import EntryQR from './components/EntryQR';
import Footer from './components/Footer';
import Login from './components/admin/Login';
import Escaneo from './components/admin/QRScanner';
import AdminDashboard from './components/admin/admin';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './Firebase/context/AuthContext';
import { TokenProvider } from './Firebase/context/TokenContext';
import TokenProtectedRoute from './components/TokenProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <TokenProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-grow pt-16">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/personal-data" element={<PersonalDataForm />} />
                <Route
                  path="/payment"
                  element={
                    <TokenProtectedRoute>
                      <PaymentQR />
                    </TokenProtectedRoute>
                  }
                />
                <Route
                  path="/entry/:token"
                  element={
                    <TokenProtectedRoute>
                      <EntryQR />
                    </TokenProtectedRoute>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/EscaneoQR"
                  element={
                    <ProtectedRoute>
                      <Escaneo />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
            <Footer />
          </div>
        </Router>
      </TokenProvider>
    </AuthProvider>
  );
}

export default App;
