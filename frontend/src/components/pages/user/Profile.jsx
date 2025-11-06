// src/components/pages/user/Profile.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Link as LinkIcon,
  Edit2,
  Heart,
  MessageCircle,
  Image as ImageIcon,
  ArrowLeft,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import UpdateProfileModal from "@/components/modals/UpdateProfileModal";
import FollowListModal from "@/components/modals/FollowListModal"; // NEW
import axios from "axios";
import { USER_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((s) => s.auth);

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [followModal, setFollowModal] = useState({ open: false, type: "" }); // NEW

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id || !currentUser?._id) return;
      try {
        setLoading(true);
        const res = await axios.get(`${USER_API_ENDPOINT}/user/${id}`, {
          withCredentials: true,
        });

        const user = res.data.user;
        const formattedPosts = (res.data.posts || []).map((post) => ({
          _id: post._id,
          primaryImage: post.primaryImage,
          imageCount: post.imageCount,
          likes: post.likes,
          comments: post.comments,
          isLiked: post.isLiked,
        }));

        setProfile(user);
        setPosts(formattedPosts);
        setIsOwnProfile(user._id === currentUser._id);
        setFollowing(res.data.isFollowing || false);
        setFollowersCount(res.data.followers || 0);
        setFollowingCount(res.data.following || 0);
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Profile not found");
        navigate("/explore");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, currentUser?._id, navigate]);

  const handleFollowToggle = async () => {
    const endpoint = following
      ? `${USER_API_ENDPOINT}/unfollow/${id}`
      : `${USER_API_ENDPOINT}/follow/${id}`;

    try {
      await axios.post(endpoint, {}, { withCredentials: true });
      setFollowing(!following);
      setFollowersCount((prev) => (following ? prev - 1 : prev + 1));
      toast.success(following ? "Unfollowed" : "Following");
    } catch (err) {
      toast.error("Failed");
    }
  };

  const handleLike = async (postId, e) => {
    e.stopPropagation();

    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );

    try {
      const res = await axios.post(
        `${USER_API_ENDPOINT}/post/${postId}/like`,
        {},
        { withCredentials: true }
      );

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, likes: res.data.likes.length, isLiked: res.data.liked }
            : p
        )
      );
    } catch (err) {
      toast.error("Failed");
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes + 1 : p.likes - 1 }
            : p
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const initials = (profile.fullName ?? "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const joinedDate = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="w-28 h-28 md:w-36 md:h-36 ring-4 ring-background shadow-xl">
  <AvatarImage src={profile.profilePhoto} className="object-cover" />
  <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-yellow-400 to-purple-600 text-white">
    {initials}
  </AvatarFallback>
</Avatar>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{profile.fullName}</h1>
                  <p className="text-muted-foreground">
                    @{profile.username || profile.email.split("@")[0]}
                  </p>
                </div>

                {isOwnProfile ? (
                  <Button
                    variant="outline"
                    className="rounded-full px-6"
                    onClick={() => setOpen(true)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button
                      onClick={handleFollowToggle}
                      variant={following ? "outline" : "default"}
                      className="rounded-full px-6"
                    >
                      {following ? (
                        <>
                          <UserMinus className="w-4 h-4 mr-2" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                    <Button variant="outline" className="rounded-full pointer-events-none blur-sm">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>
                )}
              </div>

              <p className="text-foreground max-w-xl mx-auto md:mx-0">
                {profile.bio || "No bio yet."}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <LinkIcon className="w-4 h-4" />
                    {profile.website.replace(/^https?:\/\//, "").split("/")[0]}
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {joinedDate}
                </span>
              </div>

              <div className="flex justify-center md:justify-start gap-10 text-center">
                <div
                  className="cursor-pointer hover:underline"
                  onClick={() => setFollowModal({ open: true, type: "followers" })}
                >
                  <p className="text-3xl font-bold">{followersCount}</p>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div
                  className="cursor-pointer hover:underline"
                  onClick={() => setFollowModal({ open: true, type: "following" })}
                >
                  <p className="text-3xl font-bold">{followingCount}</p>
                  <p className="text-sm text-muted-foreground">Following</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{posts.length}</p>
                  <p className="text-sm text-muted-foreground">Posts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-6">Posts</h2>
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon className="w-20 h-20 mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground">No posts yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-1 md:gap-4">
            {posts.map((post) => {
              const isMulti = post.imageCount > 1;
              return (
                <div
                  key={`${post._id}-${post.isLiked}-${post.likes}`}
                  className="relative group overflow-hidden rounded-lg bg-card border aspect-square cursor-pointer"
                  onClick={() => navigate(`/post/${post._id}`)}
                >
                  {post.primaryImage ? (
                    <img
                      src={post.primaryImage}
                      alt="Post"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                  )}

                  {isMulti && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      <ImageIcon className="w-3 h-3 inline" /> {post.imageCount}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
                    <div className="flex gap-6 text-white">
                      <button
                        onClick={(e) => handleLike(post._id, e)}
                        className="flex items-center gap-2 hover:scale-110 transition"
                      >
                        <Heart
                          className={`w-6 h-6 drop-shadow-lg transition-all ${
                            post.isLiked
                              ? "fill-red-500 text-red-500 scale-110"
                              : "text-white"
                          }`}
                        />
                        <span className="font-medium text-sm">{post.likes}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-6 h-6 text-white drop-shadow-lg" />
                        <span className="font-medium text-sm">{post.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {isOwnProfile && <UpdateProfileModal open={open} setOpen={setOpen} />}
      <FollowListModal
        open={followModal.open}
        setOpen={(open) => setFollowModal({ ...followModal, open })}
        type={followModal.type}
        userId={id}
      />
    </div>
  );
};

export default ProfilePage;