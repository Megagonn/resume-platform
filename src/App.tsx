import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout, ProtectedLayout } from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import ServicesPage from './pages/ServicesPage';
import CheckoutPage from './pages/CheckoutPage';
import PricingPage from './pages/PricingPage';
import EmployersPage from './pages/EmployersPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import ServiceLandingPage from './pages/ServiceLandingPage';
import { SERVICE_PAGE_SLUGS } from './types';
import SeekerHome from './pages/seeker/SeekerHome';
import SeekerApplications from './pages/seeker/SeekerApplications';
import SeekerOrders from './pages/seeker/SeekerOrders';
import SeekerProfile from './pages/seeker/SeekerProfile';
import HirerHome from './pages/hirer/HirerHome';
import HirerJobs from './pages/hirer/HirerJobs';
import HirerJobNew from './pages/hirer/HirerJobNew';
import HirerJobDetail from './pages/hirer/HirerJobDetail';
import HirerCompany from './pages/hirer/HirerCompany';
import HirerBilling from './pages/hirer/HirerBilling';
import AdminHome from './pages/admin/AdminHome';
import AdminUsers from './pages/admin/AdminUsers';
import AdminJobs from './pages/admin/AdminJobs';
import AdminApplications from './pages/admin/AdminApplications';
import AdminOrders from './pages/admin/AdminOrders';
import AdminPackages from './pages/admin/AdminPackages';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminBlog from './pages/admin/AdminBlog';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="auth/login" element={<LoginPage />} />
            <Route path="auth/signup" element={<SignupPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="jobs/:id" element={<JobDetailPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="services/checkout/:packageId" element={<CheckoutPage />} />
            {SERVICE_PAGE_SLUGS.map((slug) => (
              <Route key={slug} path={slug} element={<ServiceLandingPage />} />
            ))}
            <Route path="pricing" element={<PricingPage />} />
            <Route path="employers" element={<EmployersPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/:slug" element={<BlogPostPage />} />
          </Route>

          <Route path="seeker" element={<ProtectedLayout role="seeker" />}>
            <Route index element={<SeekerHome />} />
            <Route path="applications" element={<SeekerApplications />} />
            <Route path="orders" element={<SeekerOrders />} />
            <Route path="profile" element={<SeekerProfile />} />
          </Route>

          <Route path="hirer" element={<ProtectedLayout role="hirer" />}>
            <Route index element={<HirerHome />} />
            <Route path="jobs" element={<HirerJobs />} />
            <Route path="jobs/new" element={<HirerJobNew />} />
            <Route path="jobs/:id" element={<HirerJobDetail />} />
            <Route path="company" element={<HirerCompany />} />
            <Route path="billing" element={<HirerBilling />} />
          </Route>

          <Route path="admin" element={<ProtectedLayout role="admin" />}>
            <Route index element={<AdminHome />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="jobs" element={<AdminJobs />} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="packages" element={<AdminPackages />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
            <Route path="blog" element={<AdminBlog />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
