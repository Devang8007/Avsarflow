import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';

// Helper component to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<HomePage />} />
            
            {/* Category routes */}
            <Route
              path="/government-jobs"
              element={
                <CategoryPage
                  defaultCategory="government"
                  title="Government Recruitment (Sarkari Naukri)"
                  subtitle="Central Ministries, UPSC, SSC, Railways, Defense, State PSCs & Autonomous Statutory Bodies."
                />
              }
            />
            <Route
              path="/private-jobs"
              element={
                <CategoryPage
                  defaultCategory="private"
                  title="Private-Sector Tech & Core Engineering Careers"
                  subtitle="Permanent engineering and consulting openings across India's premier tech employers."
                />
              }
            />
            <Route
              path="/internships"
              element={
                <CategoryPage
                  defaultCategory="internship"
                  title="National & Corporate Internship Programs"
                  subtitle="Government research policy internships, summer trainee schemes, and funded stipend opportunities."
                />
              }
            />
            <Route
              path="/fresher-jobs"
              element={
                <CategoryPage
                  defaultCategory="fresher"
                  title="Fresher & Graduate Trainee Openings"
                  subtitle="Zero experience required. Off-campus recruitment drives and work-integrated learning programs."
                />
              }
            />
            <Route
              path="/latest"
              element={
                <CategoryPage
                  defaultCategory="all"
                  title="Recently Published Opportunities & Corrigenda"
                  subtitle="Real-time chronological feed of newly extracted recruitment notifications across India."
                />
              }
            />

            {/* Individual job details */}
            <Route path="/jobs/:slug" element={<JobDetailPage />} />

            {/* Information and compliance pages */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            {/* Administration & Source Manager */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Fallback route */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
