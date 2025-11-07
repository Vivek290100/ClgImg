import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { IoIosLogOut } from "react-icons/io";
import { CiUser } from "react-icons/ci";
import { FiMenu, FiSun, FiMoon } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx";
import { toast } from "sonner";
import { USER_API_ENDPOINT } from "@/utils/constant";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setUser } from "@/redux/authSlice";
import { Camera } from "lucide-react";
import { persistor } from "@/redux/store.js";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  const MobilePopover = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Avatar className="cursor-pointer w-9 h-9 ring-2 ring-purple-500/50">
          <AvatarImage src={user?.profile?.profilePhoto} />
          <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-purple-600 text-white">
            {(user?.fullName ?? "").split(" ").map(n => n[0]).join("").toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-64 p-0 mt-2 mr-2 rounded-lg shadow-xl border bg-card/95 backdrop-blur-sm">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user?.profile?.profilePhoto} />
              <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-purple-600 text-white">
                {(user?.fullName ?? "").split(" ").map(n => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to="/profile"><CiUser className="mr-2" size={20} /> My Profile</Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-red-600" onClick={logout}>
            <IoIosLogOut className="mr-2" size={20} /> Logout
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <nav className="bg-card text-card-foreground fixed w-full z-50 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-purple-500/30">
                <Camera className="w-6 h-6 text-white -rotate-3" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500">
                CampusSnap
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              {/* {[
                { to: "/", label: "Home" },
                { to: "/feed", label: "Feed" },
                { to: "/upload", label: "Upload" },
                { to: "/departments", label: "Departments" },
              ].map((i) => (
                <Link key={i.to} to={i.to} className="text-foreground hover:text-purple-600 font-medium transition">
                  {i.label}
                </Link>
              ))} */}

              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-accent transition">
                {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
              </button>

              {!user ? (
                <div className="flex gap-2">
                  <Link to="/login"><Button className="bg-gradient-to-r from-yellow-400 to-purple-600">Login</Button></Link>
                  <Link to="/signup"><Button variant="outline">Sign Up</Button></Link>
                </div>
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <Avatar className="cursor-pointer ring-2 ring-purple-500/50">
                      <AvatarImage src={user?.profile?.profilePhoto} />
                      <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-purple-600 text-white">
                        {(user?.fullName ?? "").split(" ").map(n => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-4 bg-card rounded-lg shadow-lg mt-2 mr-2 border border-border">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user?.profile?.profilePhoto} />
                        <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-purple-600 text-white">
                          {(user?.fullName ?? "").split(" ").map(n => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">{user?.fullName}</p>
                        <p className="text-sm text-muted-foreground">{user?.department ?? "User"}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link to="/profile"><CiUser className="mr-2" size={22} /> My Profile</Link>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-red-600" onClick={logout}>
                        <IoIosLogOut className="mr-2" size={22} /> Logout
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            <div className="md:hidden flex items-center gap-2">
              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-accent">
                {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
              </button>
              <button onClick={() => setIsOpen(v => !v)} className="p-2">
                {isOpen ? <IoMdClose size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden bg-card/95 backdrop-blur-sm border-t border-border z-50">
            <div className="px-4 pt-2 pb-3 space-y-1">
              {/* {[
                { to: "/", label: "Home" },
                { to: "/feed", label: "Feed" },
                { to: "/upload", label: "Upload" },
                { to: "/departments", label: "Departments" },
              ].map((i) => (
                <Link
                  key={i.to}
                  to={i.to}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent"
                >
                  {i.label}
                </Link>
              ))} */}
            </div>
            <div className="px-4 py-3 border-t border-border">
              {!user ? (
                <div className="flex flex-col gap-2">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-yellow-400 to-purple-600">Login</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">Sign Up</Button>
                  </Link>
                </div>
              ) : (
                <MobilePopover />
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;