import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { USER_API_ENDPOINT } from "@/utils/constant";
import { Loader } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "@/redux/authSlice";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "user",
    profilePhoto: null,
  });

  const { loading } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profilePhoto: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("role", formData.role);
    if (formData.profilePhoto) data.append("file", formData.profilePhoto);

    dispatch(setLoading(true));
    try {
      const res = await axios.post(`${USER_API_ENDPOINT}/register`, data, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-card">
      {/* Left: Hero Text */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-gradient-to-tl from-yellow-400 via-purple-500 to-pink-500">
        <div className="text-center space-y-6 max-w-md">
          <h1 className="text-5xl lg:text-6xl font-bold text-white">
            Join CampusSnap
          </h1>
          <p className="text-xl text-white/90">
            One app. Endless memories.
          </p>
          <div className="flex justify-center gap-6 text-white">
            <div>Camera Snap</div>
            <div>Party Celebrate</div>
            <div>Friends Connect</div>
          </div>
        </div>
      </div>

      {/* Right: Signup Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-card">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">Create Your Account</h2>
            <p className="text-muted-foreground mt-2">Start sharing your story</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              name="fullName"
              type="text"
              required
              placeholder="Your Full Name"
              className="w-full px-5 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
              onChange={handleChange}
            />
            <input
              name="email"
              type="email"
              required
              placeholder="you@college.edu"
              className="w-full px-5 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
              onChange={handleChange}
            />
            <input
              name="password"
              type="password"
              required
              placeholder="Choose a strong password"
              className="w-full px-5 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
              onChange={handleChange}
            />

            <div className="border-2 border-dashed border-purple-500 rounded-xl p-6 text-center cursor-pointer hover:border-purple-400 transition">
              <input
                id="file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <label htmlFor="file" className="text-purple-400 font-medium">
                {formData.profilePhoto ? "Photo Selected" : "Upload Profile Pic"}
              </label>
              <p className="text-xs text-muted-foreground mt-1">Make a great first snap!</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 hover:shadow-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? <Loader className="h-5 w-5 animate-spin" /> : "Join CampusSnap"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already snapping?{" "}
            <Link to="/login" className="font-bold text-purple-400 hover:underline">
              Login Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}