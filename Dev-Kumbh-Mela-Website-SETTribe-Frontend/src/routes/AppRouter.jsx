import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminSettingsProvider } from "../contexts/AdminSettingsContext";

// Standard Components
import LandingPage from "../components/Home";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import ForgotPasswordPage from "../pages/Auth/ForgotPasswordPage";
import TravelPage from "../components/TravelPage";
import HealthSafetyPage from "../components/HealthSafetyPage";
import MainLayout from "../components/AuthenticatedLayout"; // Consistent layout for all public pages
import DonatePage from "../components/DonatePage";
import VirtualPooja from "../components/VirtualPooja";
import NashikHeritagePage from "../pages/NashikHeritagePage";
import ShopPage from "../pages/shop/shopPage";
import MyProducts from "../pages/shop/MyProducts";
import VendorDashboard from "../pages/shop/VendorDashboard";
import BecomeVendorPage from "../pages/vendor/BecomeVendorPage";
import OperatorVendorQueue from "../operatordashboard/pages/Shop/OperatorVendorQueue";
import OperatorProductQueue from "../operatordashboard/pages/Shop/OperatorProductQueue";
import SustainabilityPage from "../components/SustainabilityPage";
import UnderMaintenance from "../components/UnderMaintenance";
import CrowdMapPage from "../components/CrowdMapPage";
import AccessDenied from "../components/AccessDenied";
import ProtectedRoute from '../components/ProtectedRoute';

// Admin Dashboard Components (New Refactored Structure)
import AdminLayout from "../admindashboard/layouts/AdminLayout";
import OperatorLayout from "../operatordashboard/layouts/OperatorLayout";
import OperatorDashboard from "../operatordashboard/pages/OperatorDashboard";
import OperatorLiveDarshanPage from "../operatordashboard/pages/LiveDarshanPage";
import OperatorLiveKumbhPage from "../operatordashboard/pages/OperatorLiveKumbhPage";
import OperatorPoojaSchedulePage from "../operatordashboard/pages/PoojaSchedulePage";
import OperatorAcharyaManagementPage from "../operatordashboard/pages/AcharyaManagementPage";
import OperatorPoojaBookingsPage from "../operatordashboard/pages/PoojaBookingsPage";
import OperatorTravelStayPage from "../operatordashboard/pages/TravelStayPage";
import OperatorHelplinePage from "../operatordashboard/pages/HelplinePage";
import OperatorHospitalsPage from "../operatordashboard/pages/HospitalsPage";
import OperatorSosPage from "../operatordashboard/pages/SosPage";
import OperatorOrdersPage from "../pages/shop/orderPage";
import ProductManagement from "../operatordashboard/pages/Shop/ProductManagement";
import ArtisanManagement from "../operatordashboard/pages/Shop/ArtisanManagement";
import TrackProductManagement from "../operatordashboard/pages/Shop/TrackProductManagement";
import DeliverProductManagement from "../operatordashboard/pages/Shop/DeliverProductManagement";
import OrdersManagement from "../operatordashboard/pages/Shop/OrdersManagement";
import OperatorHeritageHistoryManagement from "../operatordashboard/pages/NashikHeritagePage/HeritageHistoryManagement";
import OperatorKumbhHighlightsManagement from "../operatordashboard/pages/NashikHeritagePage/KumbhHighlightsManagement";
import OperatorSaintsDirectoryManagement from "../operatordashboard/pages/NashikHeritagePage/SaintsDirectoryManagement";
import OperatorSpiritualPlacesManagement from "../operatordashboard/pages/NashikHeritagePage/SpiritualPlacesManagement";
import SafetyResourcesPage from "../operatordashboard/pages/SafetyResourcesPage";
import AdminDashboard from "../admindashboard/pages/AdminDashboard";
import UsersPage from "../admindashboard/pages/UsersPage";
import ViewersPage from "../admindashboard/pages/ViewersPage";
import OrdersPage from "../pages/shop/orderPage";
import DonationSettingsPage from "../admindashboard/pages/DonationSettingsPage";
import DonationTransactionsPage from "../admindashboard/pages/DonationTransactionsPage";
import HospitalsPage from "../admindashboard/pages/HospitalsPage";
import SosPage from "../admindashboard/pages/SosPage";
import SettingsPage from "../admindashboard/pages/SettingsPage";
import LiveUpdates from "../admindashboard/pages/LiveUpdates";
import LiveDarshanPage from "../admindashboard/pages/LiveDarshanPage";
import TravelStayPage from "../admindashboard/pages/TravelStayPage";
import HelplinePage from "../admindashboard/pages/HelplinePage";
import PoojaSchedulePage from "../admindashboard/pages/PoojaSchedulePage";
import AcharyaManagementPage from "../admindashboard/pages/AcharyaManagementPage";
import HeritageHistoryManagement from "../admindashboard/pages/NashikHeritagePage/HeritageHistoryManagement";
import KumbhHighlightsManagement from "../admindashboard/pages/NashikHeritagePage/KumbhHighlightsManagement";
import SaintsDirectoryManagement from "../admindashboard/pages/NashikHeritagePage/SaintsDirectoryManagement";
import SpiritualPlacesManagement from "../admindashboard/pages/NashikHeritagePage/SpiritualPlacesManagement";
import CrowdManagementPage from "../admindashboard/pages/CrowdManagementPage";
import WeatherManagement from "../admindashboard/pages/WeatherManagement";
import AdminSafetyResourcesPage from "../admindashboard/pages/SafetyResourcesPage";

const AppRouter = () => {
  return (
    <AdminSettingsProvider>
      <Routes>
        {/* â”€â”€ Public Access Routes â”€â”€ */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/access-denied" element={<AccessDenied />} />
      <Route path="/undermaintenance" element={<MainLayout><UnderMaintenance /></MainLayout>} />
      <Route path="/undermaintenance" element={<MainLayout><UnderMaintenance /></MainLayout>} />

      {/* â”€â”€ Public Pilgrim Pages â”€â”€ */}
      <Route path="/travel" element={<MainLayout><TravelPage /></MainLayout>} />
      <Route path="/health" element={<MainLayout><HealthSafetyPage /></MainLayout>} />
      <Route path="/donate" element={<MainLayout><DonatePage /></MainLayout>} />
      <Route path="/virtual-pooja" element={<MainLayout><VirtualPooja /></MainLayout>} />
      <Route path="/heritage" element={<MainLayout><NashikHeritagePage /></MainLayout>} />
      <Route path="/shop" element={<MainLayout><ShopPage /></MainLayout>} />
      
      {/* â”€â”€ Protected User Routes (No AuthenticatedLayout to fix nesting issues) â”€â”€ */}
      <Route path="/my-products" element={<ProtectedRoute allowedRoles={["user","operator","admin"]}><MainLayout><MyProducts /></MainLayout></ProtectedRoute>} />
      
      {/* â”€â”€ Other Routes â”€â”€ */}
      <Route path="/vendor/dashboard" element={<ProtectedRoute allowedRoles={["user","shop_owner","vendor","operator","admin"]}><MainLayout><VendorDashboard /></MainLayout></ProtectedRoute>} />
      <Route path="/become-vendor" element={<MainLayout><BecomeVendorPage /></MainLayout>} />
      <Route path="/sustainability" element={<MainLayout><SustainabilityPage /></MainLayout>} />
      <Route path="/crowd-status" element={<MainLayout><CrowdMapPage /></MainLayout>} />

      {/* â”€â”€ Protected Admin Routes â”€â”€ */}
      <Route
        path="/admin-dashboard/*"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminLayout>
              <Routes>
                <Route index element={<AdminDashboard />} />
                <Route path="live-updates" element={<LiveUpdates />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="viewers" element={<ViewersPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="donation-config" element={<DonationSettingsPage />} />
                <Route path="donations-data" element={<DonationTransactionsPage />} />
                <Route path="sos" element={<SosPage />} />
                <Route path="hospitals" element={<HospitalsPage />} />
                <Route path="helplines" element={<HelplinePage />} />
                <Route path="safety-resources" element={<AdminSafetyResourcesPage />} />
                <Route path="crowd" element={<CrowdManagementPage />} />
                <Route path="health-safety" element={<HealthSafetyPage />} />
                <Route path="weather" element={<WeatherManagement />} />
                
                <Route path="settings" element={<SettingsPage />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* â”€â”€ Protected Operator Routes â”€â”€ */}
      <Route
        path="/operator/*"
        element={
          <ProtectedRoute allowedRoles={["OPERATOR"]}>
            <OperatorLayout>
              <Routes>
                <Route path="dashboard" element={<OperatorDashboard />} />
                <Route path="live-updates" element={<OperatorLiveKumbhPage />} />
                <Route path="live-darshan" element={<OperatorLiveDarshanPage />} />
                <Route path="pooja-schedule" element={<OperatorPoojaSchedulePage />} />
                <Route path="acharyas" element={<OperatorAcharyaManagementPage />} />
                <Route path="pooja-bookings" element={<OperatorPoojaBookingsPage />} />
                <Route path="travel-stay" element={<OperatorTravelStayPage />} />
                <Route path="helplines" element={<OperatorHelplinePage />} />
                <Route path="heritage-history" element={<OperatorHeritageHistoryManagement />} />
                <Route path="heritage-highlights" element={<OperatorKumbhHighlightsManagement />} />
                <Route path="heritage-saints" element={<OperatorSaintsDirectoryManagement />} />
                <Route path="heritage-places" element={<OperatorSpiritualPlacesManagement />} />
                <Route path="sos" element={<OperatorSosPage />} />
                <Route path="donation-config" element={<DonationSettingsPage />} />
                <Route path="orders" element={<OperatorOrdersPage />} />
                <Route path="shop/products" element={<ProductManagement />} />
                <Route path="shop/artisans" element={<ArtisanManagement />} />
                <Route path="shop/track" element={<TrackProductManagement />} />
                <Route path="shop/deliver" element={<DeliverProductManagement />} />


                <Route path="weather" element={<WeatherManagement />} />
                <Route path="shop/orders" element={<OrdersManagement />} />
                <Route path="shop/vendor-queue" element={<OperatorVendorQueue />} />
                <Route path="shop/product-queue" element={<OperatorProductQueue />} />
                <Route path="hospitals" element={<OperatorHospitalsPage />} />
                <Route path="safety-resources" element={<SafetyResourcesPage />} />
              </Routes>
            </OperatorLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </AdminSettingsProvider>
  );
};

export default AppRouter;

