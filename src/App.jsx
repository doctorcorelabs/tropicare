import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import SymptomChecker from './pages/SymptomChecker';
import FeverTracker from './pages/FeverTracker';
import HydrationManager from './pages/HydrationManager';
import DengueMap from './pages/DengueMap';
import LabInterpreter from './pages/LabInterpreter';
import HealthDirectory from './pages/HealthDirectory';
import TropicareAI from './pages/TropicareAI';
import Auth from './pages/Auth';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/symptom-checker" element={<SymptomChecker />} />
              <Route path="/fever-tracker" element={<FeverTracker />} />
              <Route path="/hydration" element={<HydrationManager />} />
              <Route path="/dengue-map" element={<DengueMap />} />
              <Route path="/lab-interpreter" element={<LabInterpreter />} />
              <Route path="/directory" element={<HealthDirectory />} />
              <Route path="/ai" element={<TropicareAI />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
