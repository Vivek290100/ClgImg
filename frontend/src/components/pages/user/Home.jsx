// src/components/pages/Home.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Camera, Users, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, TrendingUp, Sparkles, Globe } from "lucide-react";
import Footer from "@/components/common/Footer";
import { Link } from "react-router-dom";

const Home = () => {


  const trendingPosts = [
    {
      id: 1,
      user: "Alex Johnson",
      avatar: "AJ",
      department: "Computer Science",
      time: "2h ago",
      image: "/src/assets/pngwing.com.png",
      caption: "Hackathon vibes! Our team building the future #CSDept #Innovation",
      likes: 234,
      comments: 18,
      shares: 12
    },
    {
      id: 2,
      user: "Sarah Mitchell",
      avatar: "SM",
      department: "Business Admin",
      time: "4h ago",
      image: "/src/assets/pngwing.com.png",
      caption: "Campus life hits different during golden hour #StateU #CampusVibes",
      likes: 567,
      comments: 34,
      shares: 23
    },
    {
      id: 3,
      user: "Mike Chen",
      avatar: "MC",
      department: "Engineering",
      time: "6h ago",
      image: "/src/assets/pngwing.com.png",
      caption: "Lab work got us feeling like mad scientists #EngineeringLife",
      likes: 189,
      comments: 12,
      shares: 8
    }
  ];

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
              <span className="text-purple-300 dark:text-purple-200">Join 12.5K+ students sharing their journey</span>
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
              <Link to="/explore">
                <Button size="lg" className="bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 text-white hover:shadow-xl hover:shadow-purple-500/30 transition-all px-8">
                  <Camera className="mr-2 h-5 w-5" /> Start Sharing
                </Button>
              </Link>
                <Button size="lg" variant="outline" className="border-2 border-border hover:bg-accent px-8">
                  <Globe className="mr-2 h-5 w-5" /> Explore Feed
                </Button>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingPosts.map((post) => (
              <div
                key={post.id}
                className="bg-card rounded-2xl overflow-hidden border border-border hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/10"
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {post.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{post.user}</p>
                      <p className="text-xs text-muted-foreground">{post.department} • {post.time}</p>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.caption}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 transition group">
                        <Heart size={20} className="group-hover:fill-red-500" />
                        <span className="text-sm font-medium">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-muted-foreground hover:text-blue-400 transition">
                        <MessageCircle size={20} />
                        <span className="text-sm font-medium">{post.comments}</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-muted-foreground hover:text-green-400 transition">
                        <Share2 size={20} />
                        <span className="text-sm font-medium">{post.shares}</span>
                      </button>
                    </div>
                    <button className="text-muted-foreground hover:text-yellow-400 transition">
                      <Bookmark size={20} />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{post.caption}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button size="lg" variant="outline" className="border-2 border-border hover:bg-accent">
              View All Posts
            </Button>
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
          <Link to="login">
          <Button size="lg" className="bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 text-white hover:shadow-2xl hover:shadow-purple-500/50 transition-all px-10 py-6 text-lg">
            <Camera className="mr-2 h-5 w-5" /> Get Started Now
          </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;