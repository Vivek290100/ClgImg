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
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-tr from-yellow-50 via-purple-50 to-pink-50">
      {/* Left: Fun Text Hero */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="max-w-lg text-center lg:text-left space-y-8">
          <div>
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900">
              Ready to
            </h1>
            <h2 className="text-6xl lg:text-8xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              SNAP IT?
            </h2>
          </div>
          <p className="text-xl lg:text-2xl text-gray-700 font-medium">
            Join thousands of students already <br />
            <span className="text-purple-600 font-bold">snapping their campus life!</span>
          </p>
          <div className="grid grid-cols-2 gap-4 mt-10">
            {["🎉 Freshers", "📸 Moments", "👥 Clubs", "🌟 Stories"].map((item, i) => (
              <div
                key={i}
                className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-lg text-center transform hover:scale-110 transition"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <p className="text-3xl mb-1">{item.split(" ")[0]}</p>
                <p className="text-sm font-semibold text-gray-700">{item.split(" ")[1]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Signup Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white/80 backdrop-blur-lg">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-600 mt-2">One snap away from campus fame</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              name="fullName"
              type="text"
              placeholder="Your Cool Name"
              required
              className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition text-gray-900"
              onChange={handleChange}
            />

            <input
              name="email"
              type="email"
              placeholder="you@college.ac.in"
              required
              className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition text-gray-900"
              onChange={handleChange}
            />

            <input
              name="password"
              type="password"
              placeholder="Secret Password"
              required
              className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition text-gray-900"
              onChange={handleChange}
            />

            <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 text-center cursor-pointer hover:border-purple-500 transition">
              <input
                id="profilePhoto"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <label htmlFor="profilePhoto" className="cursor-pointer">
                <p className="text-4xl mb-2">📸</p>
                <p className="text-purple-600 font-semibold">
                  {formData.profilePhoto ? "Photo Selected!" : "Tap to Add Selfie"}
                </p>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 font-bold text-xl text-white bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 rounded-xl hover:shadow-2xl transform hover:scale-105 transition disabled:opacity-70"
            >
              {loading ? (
                <Loader className="mx-auto h-7 w-7 animate-spin" />
              ) : (
                "Join CampusSnap! 🎉"
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Already snapping?{" "}
            <Link to="/login" className="text-purple-600 font-bold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}