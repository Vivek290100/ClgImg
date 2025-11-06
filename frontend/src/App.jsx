// src/App.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "sonner";
import store, { persistor } from "./redux/store.js";
import Login from "./components/auth/Login.jsx";
import SignUp from "./components/auth/SignUp.jsx";
import Home from "./components/pages/user/Home.jsx";
import ProfilePage from "./components/pages/user/Profile.jsx";
import AdminDashboard from "./components/pages/admin/AdminDashboard.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import AdminLayout from "./components/pages/admin/AdminLayout.jsx";
import UserLayout from "./components/pages/user/UserLayout.jsx";
import { Loader2 } from "lucide-react";
import Upload from "./components/pages/user/Upload.jsx";
import Explore from "./components/pages/user/Explore.jsx";
import PostDetailPage from "./components/pages/user/PostDetailPage.jsx";
import Settings from "./components/pages/user/Settings.jsx";
import UsersPage from "./components/pages/admin/UsersPage.jsx";
import FeedbackPage from "./components/pages/admin/FeedbackPage.jsx";

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <ThemeProvider>
          <div className="min-h-screen bg-background text-foreground">

            <Routes>
              {/* ---------- PUBLIC ---------- */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />

              {/* ---------- USER ROUTES ---------- */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <UserLayout>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/profile/:id" element={<ProfilePage />} />
                        <Route path="/explore" element={<Explore/>} />
                        <Route path="/upload" element={<Upload/>} />
                        <Route path="/notifications" element={<div>Notifications</div>} />
                        <Route path="/saved" element={<div>Saved</div>} />
                        <Route path="/settings" element={<Settings/>} />
                        <Route path="/post/:postId" element={<PostDetailPage />} />
                        {/* <Route path="/user/:id" element={<OtherUserProfile />} /> */}
                        
                      </Routes>
                    </UserLayout>
                  </ProtectedRoute>
                }
              />

              {/* ---------- ADMIN ROUTES ---------- */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminLayout>
                      <Routes>
                        <Route index element={<AdminDashboard />} />
                        <Route path="users" element={<UsersPage />} />
                        <Route path="feedbacks" element={<FeedbackPage />} />
                      </Routes>
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>

          </div>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
  </div>
);

export default App;