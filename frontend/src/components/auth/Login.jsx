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

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
        navigate(res.data.user.role === "admin" ? "/admin" : from, { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-card">
      {/* LEFT: Hero – Stacks on mobile */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-card">
        <div className="w-full max-w-xs sm:max-w-sm space-y-5 text-center text-white">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            Welcome Back
          </h1>
          <p className="text-lg sm:text-xl opacity-90">
            Your campus. Your stories. Your squad.
          </p>
          <div className="grid grid-cols-2 gap-6 text-sm sm:text-base">
            <div>
              <div className="text-3xl sm:text-4xl font-bold">10K+</div>
              <div className="opacity-80">Students</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold">500+</div>
              <div className="opacity-80">Events</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-card">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Login to CampusSnap</h2>
            <p className="text-muted-foreground mt-2">Continue your campus journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="email"
              type="email"
              required
              placeholder="you@college.edu"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
              onChange={handleChange}
            />
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
              onChange={handleChange}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white bg-card hover:shadow-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Snap Back In"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/signup" className="font-bold text-purple-400 hover:underline">
              Join the Squad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}