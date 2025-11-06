// src/components/admin/AdminLayout.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "@/redux/authSlice";
import { persistor } from "@/redux/store";
import { toast } from "sonner";
import axios from "axios";
import { USER_API_ENDPOINT } from "@/utils/constant";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FiMenu, FiX, FiHome, FiUsers, FiSettings, FiLogOut, FiSun, FiMoon, FiMessageSquare } from "react-icons/fi";
import { Camera } from "lucide-react";
import { useTheme } from "@/context/ThemeContext.jsx";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const logout = async () => {
    try {
      const { data } = await axios.get(`${USER_API_ENDPOINT}/logout`, { withCredentials: true });
      if (data.success) {
        dispatch(setUser(null));
        await persistor.purge();
        navigate("/login", { replace: true });
        toast.success("Logged out");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Logout failed");
    }
  };

  const menuItems = [
    { icon: FiHome, label: "Dashboard", to: "/admin" },
    { icon: FiUsers, label: "Users", to: "/admin/users" },
    { icon: FiMessageSquare, label: "Feedbacks", to: "/admin/feedbacks" },
    { icon: FiSettings, label: "Settings", to: "/admin/settings" },
  ];

  const closeSidebar = () => {
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative z-50
          ${isMobile ? "w-64" : sidebarOpen ? "w-64" : "w-16"}
          bg-card border-r border-border transition-all duration-300 flex flex-col
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link
            to="/admin"
            onClick={closeSidebar}
            className={`flex items-center gap-2 ${!sidebarOpen && !isMobile && "justify-center"}`}
          >
            <div className="w-7 h-7 bg-gradient-to-br from-yellow-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-purple-500/30">
              <Camera className="w-6 h-6 text-white -rotate-3" />
            </div>
            {(sidebarOpen || isMobile) && (
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500">
                CampusSnap
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded hover:bg-accent transition md:block"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            // Exact match for /admin, partial match for others
            const isActive = item.to === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeSidebar}
                className={`flex items-center gap-3 p-2 rounded-lg transition group relative
                  ${isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent"}`}
              >
                <item.icon
                  size={20}
                  className={`flex-shrink-0 ${isActive ? "text-accent-foreground" : "text-foreground"}`}
                />
                {(sidebarOpen || isMobile) && <span>{item.label}</span>}
                {!sidebarOpen && !isMobile && (
                  <span className="absolute left-16 ml-2 px-2 py-1 bg-card text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-card border-b border-border px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded hover:bg-accent transition"
              >
                <FiMenu size={20} />
              </button>
            )}
            <h1 className="text-lg md:text-xl font-semibold">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-accent transition"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8 md:w-9 md:h-9 ring-2 ring-purple-500/30">
                <AvatarImage src={user?.profilePhoto} />
                <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-purple-600 text-white text-xs md:text-sm">
                  {(user?.fullName ?? "").split(" ").map((n) => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-red-600 text-xs md:text-sm"
              >
                <FiLogOut size={16} className="mr-1" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/20">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;