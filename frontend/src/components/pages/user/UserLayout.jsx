// src/components/user/UserLayout.jsx
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "@/redux/authSlice";
import { persistor } from "@/redux/store";
import { toast } from "sonner";
import axios from "axios";
import { USER_API_ENDPOINT } from "@/utils/constant";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { FiMenu, FiX, FiHome, FiSearch, FiUser, FiLogOut, FiSun, FiMoon, FiCamera, FiSettings, FiBookmark } from "react-icons/fi";
import { Camera } from "lucide-react";
import { useTheme } from "@/context/ThemeContext.jsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const UserLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Axios Interceptor to detect blocked user
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 403 && error.response?.data?.blocked) {
          setIsBlocked(true);
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on component unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

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
        setIsBlocked(false); // Close popup after logout
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Logout failed");
    }
  };

  const menuItems = [
    { icon: FiHome, label: "Home", to: "/" },
    { icon: FiSearch, label: "Explore", to: "/explore" },
    { icon: FiCamera, label: "Upload", to: "/upload" },
    { icon: FiBookmark, label: "Saved", to: "/saved" },
    { icon: FiUser, label: "Profile", to: `/profile/${user?._id}` },
    { icon: FiSettings, label: "Settings", to: "/settings" },
  ];

  const closeSidebar = () => {
    if (isMobile) setSidebarOpen(false);
  };

  // Profile Popover
  const ProfilePopover = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Avatar className="cursor-pointer w-8 h-8 md:w-9 md:h-9 ring-2 ring-purple-500/30">
          <AvatarImage
            src={user?.profilePhoto}
            className="object-cover w-full h-full"
          />
          <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-purple-600 text-white text-xs md:text-sm">
            {(user?.fullName ?? "").split(" ").map(n => n[0]).join("").toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4 bg-card rounded-lg shadow-lg mt-2 mr-2 border border-border">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage
              src={user?.profilePhoto}
              className="object-cover w-full h-full"
            />
            <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-purple-600 text-white">
              {(user?.fullName ?? "").split(" ").map(n => n[0]).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{user?.fullName}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to={`/profile/${user?._id}`} onClick={closeSidebar}>
              <FiUser className="mr-2" size={22} /> My Profile
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-red-600" onClick={logout}>
            <FiLogOut className="mr-2" size={22} /> Logout
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Blocked User Popup */}
      <Dialog open={isBlocked} onOpenChange={setIsBlocked}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Account Blocked</DialogTitle>
            <DialogDescription>
              Your account has been blocked. Please log out to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button
              variant="destructive"
              onClick={logout}
              className="flex items-center gap-2"
            >
              <FiLogOut size={18} />
              Logout
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 fixed md:relative z-50
          ${isMobile ? "w-64" : sidebarOpen ? "w-64" : "w-16"}
          bg-card border-r border-border transition-all duration-300 flex flex-col
        `}
      >
        <div className="p-4 border-b border-border">
          <Link
            to="/"
            onClick={closeSidebar}
            className={`flex items-center gap-2 ${!sidebarOpen && !isMobile && "justify-center"}`}
          >
            <div className="w-8 h-7 bg-gradient-to-br from-yellow-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-purple-500/30">
              <Camera className="w-6 h-6 text-white -rotate-3" />
            </div>
            {(sidebarOpen || isMobile) && (
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500">
                CampusSnap
              </span>
            )}
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeSidebar}
                className={`flex items-center gap-3 p-3 rounded-lg transition group relative
                  ${isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50"}
                `}
              >
                <item.icon size={22} className="flex-shrink-0" />
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-card border-b border-border px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded hover:bg-accent transition"
              >
                <FiMenu size={22} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {user && <ProfilePopover />}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default UserLayout;