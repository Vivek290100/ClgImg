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

    try {
      dispatch(setLoading(true));
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground">
      {/* Left: Hero Text */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-tr from-pink-800 via-purple-800 to-indigo-900">
        <div className="max-w-lg text-left space-y-6 animate-fadeIn">
          <h1 className="text-5xl lg:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-500">
            Join the
            <br />
            <span className="text-white">Campus Revolution</span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-100 leading-relaxed">
            One app. Endless memories.  
            From freshers to farewell —  
            <span className="font-bold text-yellow-300">Snap it all.</span>
          </p>

          <div className="grid grid-cols-3 gap-4 mt-8 text-center">
            <div>
              <div className="text-3xl font-bold text-pink-300">📸</div>
              <div className="text-xs text-gray-200 mt-1">Snap</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-300">🎉</div>
              <div className="text-xs text-gray-200 mt-1">Celebrate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-300">👥</div>
              <div className="text-xs text-gray-200 mt-1">Connect</div>
            </div>
          </div>

          <p className="text-sm text-gray-300 italic mt-10 border-l-4 border-yellow-400 pl-4">
            "Finally, an app that gets college life." – Aarav, CSE '26
          </p>
        </div>
      </div>

      {/* Right: Signup Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Create Your Snap ID</h2>
            <p className="text-muted-foreground mt-2">Start your campus story today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              name="fullName"
              type="text"
              placeholder="Your Full Name"
              required
              className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-purple-500"
              onChange={handleChange}
            />
            <input
              name="email"
              type="email"
              placeholder="you@college.edu"
              required
              className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-purple-500"
              onChange={handleChange}
            />
            <input
              name="password"
              type="password"
              placeholder="Choose a strong password"
              required
              className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-purple-500"
              onChange={handleChange}
            />

            <div className="border-2 border-dashed border-purple-500 rounded-xl p-6 text-center">
              <input
                id="profilePhoto"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <label
                htmlFor="profilePhoto"
                className="cursor-pointer text-purple-400 hover:text-purple-300 font-medium"
              >
                {formData.profilePhoto ? "✅ Photo Selected" : "📷 Upload Profile Pic"}
              </label>
              <p className="text-xs text-gray-500 mt-2">Make a great first snap!</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 font-bold text-white bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 rounded-xl hover:shadow-2xl transition-all disabled:opacity-70 flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span>🚀 Join CampusSnap</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already snapping?{" "}
            <Link to="/login" className="text-purple-400 font-bold hover:underline">
              Login Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}