// src/components/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, TrendingUp, Sparkles, Globe } from "lucide-react";
import Footer from "@/components/common/Footer";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { USER_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const Home = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userCountRes, postsRes] = await Promise.all([
          axios.get(`${USER_API_ENDPOINT}/user-count`).catch((err) => {
            console.error("User count fetch error:", err.response?.data || err.message);
            return { data: { totalUsers: 0 } };
          }),
          axios.get(`${USER_API_ENDPOINT}/trending-posts`).catch((err) => {
            return { data: { posts: [] } };
          }),
        ]);

        const users = userCountRes.data.totalUsers || 0;
        setTotalUsers(users);

        const posts = postsRes.data.posts || [];
        const formattedPosts = posts.map((post) => ({
          id: post._id,
          user: post.user?.fullName || "Unknown User",
          profilePhoto: post.user?.profilePhoto || "", // Empty string if no profile photo
          firstLetter: post.user?.fullName ? post.user.fullName.charAt(0).toUpperCase() : "?", // First letter for fallback
          department: post.department || "N/A",
          time: post.createdAt
            ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
            : "Unknown",
          image: post.media?.[0]?.url || "https://via.placeholder.com/300",
          caption: post.caption || "",
          likes: post.likes?.length || 0,
          comments: post.comments?.length || 0,
        }));
        setTrendingPosts(formattedPosts);
      } catch (error) {
        toast.error("Failed to load trending posts or user count");
        console.error("Fetch error:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen text-foreground">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-card" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-5"
          style={{ backgroundImage: "url('/home/hero-bg.jpg')" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center space-y-6 lg:space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-sm">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 dark:text-purple-200">
                {loading ? "Loading..." : `Join ${totalUsers.toLocaleString()} students sharing their journey`}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500">
                Your Campus,
              </span>
              <br />
              <span className="text-foreground">Your Stories</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with your department, share moments, and build your college network. One snap at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/upload">
                <Button size="lg" className="bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 text-white hover:shadow-xl hover:shadow-purple-500/30 transition-all px-8">
                  <Camera className="mr-2 h-5 w-5" /> Start Sharing
                </Button>
              </Link>
              <Link to="/explore">
                <Button size="lg" variant="outline" className="border-2 border-border hover:bg-accent px-8">
                  <Globe className="mr-2 h-5 w-5" /> Explore Feed
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRENDING FEED */}
      <section className="py-12 lg:py-16 bg-gradient-to-b from-transparent to-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Trending on Campus</h2>
          </div>
          {loading ? (
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : trendingPosts.length === 0 ? (
            <p className="text-center text-muted-foreground">No trending posts available</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-card rounded-2xl overflow-hidden border border-border hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer"
                  onClick={() => navigate(`/post/${post.id}`)}
                >
                  <div className="p-4 flex items-center">
                    <div className="flex items-center gap-3">
                      {post.profilePhoto ? (
                        <img
                          src={post.profilePhoto}
                          alt={post.user}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => e.target.classList.add("hidden")} // Hide on error to show fallback
                        />
                      ) : null}
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                          post.profilePhoto ? "hidden" : ""
                        }`}
                      >
                        {post.firstLetter}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{post.user}</p>
                        <p className="text-xs text-muted-foreground">{post.department} • {post.time}</p>
                      </div>
                    </div>
                  </div>
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.caption}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      onError={(e) => (e.target.src = "https://via.placeholder.com/300")}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">{post.likes} Likes</span>
                      <span className="text-sm text-muted-foreground">{post.comments} Comments</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{post.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Link to="/explore">
              <Button size="lg" variant="outline" className="border-2 border-border hover:bg-accent">
                View All Posts
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-card" />
        <div className="relative max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            Ready to share your story?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of students capturing their college experience
          </p>
          <Link to="/explore">
            <Button
              size="lg"
              className="bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 text-white hover:shadow-2xl hover:shadow-purple-500/50 transition-all px-10 py-6 text-lg"
            >
              <Camera className="mr-2 h-5 w-5" /> Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* <Footer /> */}
    </div>
  );
};

export default Home;