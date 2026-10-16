import { Route, Routes } from 'react-router-dom';
import RequireAuth from './components/RequireAuth.jsx';
import SiteLayout from './components/SiteLayout.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import Dashboard from './admin/Dashboard.jsx';
import AdminBookings from './admin/AdminBookings.jsx';
import AdminRevenue from './admin/AdminRevenue.jsx';
import AdminCustomers from './admin/AdminCustomers.jsx';
import AdminMedia from './admin/AdminMedia.jsx';
import AdminChats from './admin/AdminChats.jsx';
import AdminSettings from './admin/AdminSettings.jsx';
import Home from './pages/Home.jsx';
import GalleryPage from './pages/GalleryPage.jsx';
import VideosPage from './pages/VideosPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import MyBookingsPage from './pages/MyBookingsPage.jsx';
import VisitPage from './pages/VisitPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import { Navigate } from 'react-router-dom';

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/my-bookings" element={<RequireAuth><MyBookingsPage /></RequireAuth>} />
        <Route path="/visit" element={<VisitPage />} />
        <Route path="/chat" element={<RequireAuth><ChatPage /></RequireAuth>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<RequireAuth admin><AdminLayout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="revenue" element={<AdminRevenue />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="gallery" element={<AdminMedia kind="gallery" />} />
        <Route path="videos" element={<AdminMedia kind="videos" />} />
        <Route path="chats" element={<AdminChats />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
