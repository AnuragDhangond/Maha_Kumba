import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminSettingsProvider } from "../contexts/AdminSettingsContext";
import ProtectedRoute from '../components/ProtectedRoute';

// ── Eager loaded (small, always needed on first paint) ──
import LandingPage from "../components/Home";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import AccessDenied from "../components/AccessDenied";

// ── Lazy loaded public pages ──
const ForgotPasswordPage      = lazy(() => import("../pages/Auth/ForgotPasswordPage"));
const TravelPage              = lazy(() => import("../components/TravelPage"));
const HealthSafetyPage        = lazy(() => import("../components/HealthSafetyPage"));
const MainLayout              = lazy(() => import("../components/AuthenticatedLayout"));
const DonatePage              = lazy(() => import("../components/DonatePage"));
const VirtualPooja            = lazy(() => import("../components/VirtualPooja"));
const NashikHeritagePage      = lazy(() => import("../pages/NashikHeritagePage"));
const ShopPage                = lazy(() => import("../pages/shop/shopPage"));
const MyProducts              = lazy(() => import("../pages/shop/MyProducts"));
const VendorDashboard         = lazy(() => import("../pages/shop/VendorDashboard"));
const BecomeVendorPage        = lazy(() => import("../pages/vendor/BecomeVendorPage"));
const SustainabilityPage      = lazy(() => import("../components/SustainabilityPage"));
const UnderMaintenance        = lazy(() => import("../components/UnderMaintenance"));
const CrowdMapPage            = lazy(() => import("../components/CrowdMapPage"));

// ── Lazy loaded admin pages ──
const AdminLayout             = lazy(() => import("../admindashboard/layouts/AdminLayout"));
const AdminDashboard          = lazy(() => import("../admindashboard/pages/AdminDashboard"));
const UsersPage               = lazy(() => import("../admindashboard/pages/UsersPage"));
const ViewersPage             = lazy(() => import("../admindashboard/pages/ViewersPage"));
const OrdersPage              = lazy(() => import("../pages/shop/orderPage"));
const DonationSettingsPage    = lazy(() => import("../admindashboard/pages/DonationSettingsPage"));
const DonationTransactionsPage = lazy(() => import("../admindashboard/pages/DonationTransactionsPage"));
const HospitalsPage           = lazy(() => import("../admindashboard/pages/HospitalsPage"));
const SosPage                 = lazy(() => import("../admindashboard/pages/SosPage"));
const SettingsPage            = lazy(() => import("../admindashboard/pages/SettingsPage"));
const LiveUpdates             = lazy(() => import("../admindashboard/pages/LiveUpdates"));
const LiveDarshanPage         = lazy(() => import("../admindashboard/pages/LiveDarshanPage"));
const TravelStayPage          = lazy(() => import("../admindashboard/pages/TravelStayPage"));
const HelplinePage            = lazy(() => import("../admindashboard/pages/HelplinePage"));
const PoojaSchedulePage       = lazy(() => import("../admindashboard/pages/PoojaSchedulePage"));
const AcharyaManagementPage   = lazy(() => import("../admindashboard/pages/AcharyaManagementPage"));
const HeritageHistoryManagement   = lazy(() => import("../admindashboard/pages/NashikHeritagePage/HeritageHistoryManagement"));
const KumbhHighlightsManagement   = lazy(() => import("../admindashboard/pages/NashikHeritagePage/KumbhHighlightsManagement"));
const SaintsDirectoryManagement   = lazy(() => import("../admindashboard/pages/NashikHeritagePage/SaintsDirectoryManagement"));
const SpiritualPlacesManagement   = lazy(() => import("../admindashboard/pages/NashikHeritagePage/SpiritualPlacesManagement"));
const CrowdManagementPage     = lazy(() => import("../admindashboard/pages/CrowdManagementPage"));
const WeatherManagement       = lazy(() => import("../admindashboard/pages/WeatherManagement"));
const AdminSafetyResourcesPage = lazy(() => import("../admindashboard/pages/SafetyResourcesPage"));

// ── Lazy loaded operator pages ──
const OperatorLayout               = lazy(() => import("../operatordashboard/layouts/OperatorLayout"));
const OperatorDashboard            = lazy(() => import("../operatordashboard/pages/OperatorDashboard"));
const OperatorLiveDarshanPage      = lazy(() => import("../operatordashboard/pages/LiveDarshanPage"));
const OperatorLiveKumbhPage        = lazy(() => import("../operatordashboard/pages/OperatorLiveKumbhPage"));
const OperatorPoojaSchedulePage    = lazy(() => import("../operatordashboard/pages/PoojaSchedulePage"));
const OperatorAcharyaManagementPage = lazy(() => import("../operatordashboard/pages/AcharyaManagementPage"));
const OperatorPoojaBookingsPage    = lazy(() => import("../operatordashboard/pages/PoojaBookingsPage"));
const OperatorTravelStayPage       = lazy(() => import("../operatordashboard/pages/TravelStayPage"));
const OperatorHelplinePage         = lazy(() => import("../operatordashboard/pages/HelplinePage"));
const OperatorHospitalsPage        = lazy(() => import("../operatordashboard/pages/HospitalsPage"));
const OperatorSosPage              = lazy(() => import("../operatordashboard/pages/SosPage"));
const OperatorOrdersPage           = lazy(() => import("../pages/shop/orderPage"));
const ProductManagement            = lazy(() => import("../operatordashboard/pages/Shop/ProductManagement"));
const ArtisanManagement            = lazy(() => import("../operatordashboard/pages/Shop/ArtisanManagement"));
const TrackProductManagement       = lazy(() => import("../operatordashboard/pages/Shop/TrackProductManagement"));
const DeliverProductManagement     = lazy(() => import("../operatordashboard/pages/Shop/DeliverProductManagement"));
const OrdersManagement             = lazy(() => import("../operatordashboard/pages/Shop/OrdersManagement"));
const OperatorVendorQueue          = lazy(() => import("../operatordashboard/pages/Shop/OperatorVendorQueue"));
const OperatorProductQueue         = lazy(() => import("../operatordashboard/pages/Shop/OperatorProductQueue"));
const OperatorHeritageHistoryManagement  = lazy(() => import("../operatordashboard/pages/NashikHeritagePage/HeritageHistoryManagement"));
const OperatorKumbhHighlightsManagement  = lazy(() => import("../operatordashboard/pages/NashikHeritagePage/KumbhHighlightsManagement"));
const OperatorSaintsDirectoryManagement  = lazy(() => import("../operatordashboard/pages/NashikHeritagePage/SaintsDirectoryManagement"));
const OperatorSpiritualPlacesManagement  = lazy(() => import("../operatordashboard/pages/NashikHeritagePage/SpiritualPlacesManagement"));
const SafetyResourcesPage          = lazy(() => import("../operatordashboard/pages/SafetyResourcesPage"));

// Fallback while lazy chunks load
const PageLoader = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100vh', width: '100vw', background: '#fff8f0',
    fontFamily: 'sans-serif', color: '#e65100', fontSize: '18px'
  }}>
    🕉️ Loading...
  </div>
);

const AppRouter = () => {
  return (
    <AdminSettingsProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public Access Routes ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route path="/undermaintenance" element={<MainLayout><UnderMaintenance /></MainLayout>} />

          {/* ── Public Pilgrim Pages ── */}
          <Route path="/travel" element={<MainLayout><TravelPage /></MainLayout>} />
          <Route path="/health" element={<MainLayout><HealthSafetyPage /></MainLayout>} />
          <Route path="/donate" element={<MainLayout><DonatePage /></MainLayout>} />
          <Route path="/virtual-pooja" element={<MainLayout><VirtualPooja /></MainLayout>} />
          <Route path="/heritage" element={<MainLayout><NashikHeritagePage /></MainLayout>} />
          <Route path="/shop" element={<MainLayout><ShopPage /></MainLayout>} />

          {/* ── Protected User Routes ── */}
          <Route path="/my-products" element={<ProtectedRoute allowedRoles={["user","operator","admin"]}><MainLayout><MyProducts /></MainLayout></ProtectedRoute>} />

          {/* ── Other Routes ── */}
          <Route path="/vendor/dashboard" element={<ProtectedRoute allowedRoles={["user","shop_owner","vendor","operator","admin"]}><MainLayout><VendorDashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/become-vendor" element={<MainLayout><BecomeVendorPage /></MainLayout>} />
          <Route path="/sustainability" element={<MainLayout><SustainabilityPage /></MainLayout>} />
          <Route path="/crowd-status" element={<MainLayout><CrowdMapPage /></MainLayout>} />

          {/* ── Protected Admin Routes ── */}
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

          {/* ── Protected Operator Routes ── */}
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
      </Suspense>
    </AdminSettingsProvider>
  );
};

export default AppRouter;
