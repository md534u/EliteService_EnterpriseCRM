import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import RegisterClient from './pages/RegisterClient';
import Universe from './pages/Universe';
import AccountDetail from './pages/AccountDetail';
import SearchPage from './pages/SearchPage';
import QuoteGenerator from './pages/QuoteGenerator';
import TicketsPage from './pages/TicketsPage';
import InteractionsPage from './pages/InteractionsPage';
import OpportunityDetail from './pages/OpportunityDetail'; // <--- Importar

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="register" element={<RegisterClient />} />
          <Route path="universe" element={<Universe />} />
          <Route path="universe/:id" element={<AccountDetail />} />
          <Route path="/opportunity/:id" element={<OpportunityDetail />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="quotes" element={<QuoteGenerator />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="interactions" element={<InteractionsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
