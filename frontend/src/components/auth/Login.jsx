import axios from "axios";
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { USER_API_ENDPOINT } from "@/utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "@/redux/authSlice";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { loading } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    try {
      const res = await axios.post(`${USER_API_ENDPOINT}/login`, formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(setUser(res.data.user));
        toast.success(res.data.message);
        const redirectTo = res.data.user.role === "admin" ? "/admin" : from;
        navigate(redirectTo, { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      {/* Left: Animated Text Hero */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="max-w-lg text-center lg:text-left space-y-6">
          <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 bg-clip-text text-transparent animate-pulse">
            Welcome to
          </h1>
          <h2 className="text-6xl lg:text-7xl font-extrabold text-gray-900">
            Campus<span className="text-purple-600">Snap</span>
          </h2>
          <p className="text-lg lg:text-xl text-gray-700 leading-relaxed">
            Snap moments. Share vibes. <br />
            <span className="font-semibold text-purple-600">Live the campus life.</span>
          </p>
          <div className="flex gap-3 justify-center lg:justify-start mt-8">
            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium animate-bounce">
              Events
            </span>
            <span className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-medium animate-bounce delay-200">
              Friends
            </span>
            <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium animate-bounce delay-500">
              Memories
            </span>
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white/80 backdrop-blur-lg">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Hey, Snapper! 👋</h2>
            <p className="text-muted-foreground mt-2">Log in and join the fun</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition"
                placeholder="you@college.edu"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition"
                placeholder="••••••••"
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-6 font-bold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 rounded-xl hover:shadow-2xl transform hover:scale-105 transition disabled:opacity-70"
            >
              {loading ? <Loader2 className="mx-auto h-6 w-6 animate-spin" /> : "Let's Go! 🚀"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            New on campus?{" "}
            <Link to="/signup" className="text-purple-600 hover:underline font-bold">
              Join the Snap Squad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}