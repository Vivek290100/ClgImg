// src/components/auth/Login.jsx
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const location = useLocation();
const from = location.state?.from?.pathname || "/";

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
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      <div className=" lg:flex lg:w-1/2 items-center justify-center p-8">
        <img
          src="src/assets/image-from-rawpixel-id-12363052-png.png"
          alt="Login illustration"
          className="max-w-xl w-full"
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">Welcome Back</h2>
            <p className="text-muted-foreground mt-2">Login to your CampusSnap account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground">Email</label>
              <input
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-4 py-2.5 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">Password</label>
              <input
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-4 py-2.5 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-4 font-medium text-white bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 rounded-lg hover:shadow-lg transition disabled:opacity-70"
            >
              {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Login"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-purple-500 hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}