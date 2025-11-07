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
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground">
      {/* Left: Text Hero */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="max-w-lg text-left space-y-6 animate-fadeIn">
          <h1 className="text-5xl lg:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600">
            Welcome Back
            <br />
            <span className="text-white">!</span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-200 leading-relaxed">
            Relive your campus moments.  
            Connect with friends.  
            Never miss an event again.
          </p>
          <div className="flex gap-4 mt-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400">10K+</div>
              <div className="text-sm text-gray-300">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-400">500+</div>
              <div className="text-sm text-gray-300">Events This Month</div>
            </div>
          </div>
          <p className="text-xs text-gray-400 italic mt-8">
            "CampusSnap turned my college into a movie." – Riya, Class of '25
          </p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Login to CampusSnap</h2>
            <p className="text-muted-foreground mt-2">Your campus, your story, your squad.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-4 py-2.5 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="you@college.edu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Password</label>
              <input
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-4 py-2.5 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-6 font-bold text-white bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 rounded-lg hover:shadow-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Snap Back In"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            New on campus?{" "}
            <Link to="/signup" className="text-purple-400 hover:underline font-bold">
              Join the Snap Squad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}