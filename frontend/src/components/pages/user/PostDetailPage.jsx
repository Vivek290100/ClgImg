import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";
import { USER_API_ENDPOINT } from "@/utils/constant";
import { useSelector } from "react-redux";
import {
  Heart, MessageCircle, Share2, MoreVertical, Send, Loader2,
  Trash2, Image as ImageIcon, Calendar, GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const getInitial = (name) => {
  return name?.trim()?.[0]?.toUpperCase() || "U";
};

const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((s) => s.auth);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [comments, setComments] = useState([]);
  
  const [commentPage, setCommentPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${USER_API_ENDPOINT}/post/${postId}`, {
        withCredentials: true,
      });
      const p = res.data.post;
      const images = (p.media || []).filter((m) => m.type === "image");
      const following = p.author.followers?.includes(currentUser?._id);

      setPost({
        ...p,
        images,
        isLiked: Array.isArray(p.likes) && p.likes.includes(currentUser?._id),
        likesCount: p.likes?.length || 0,
        commentsCount: p.comments?.length || 0,
      });
      setIsFollowing(following);
    } catch (err) {
      if (err.response?.status === 404) navigate("/explore", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [postId, currentUser?._id, navigate]);

  const fetchComments = useCallback(async (page = 1) => {
    try {
      const res = await axios.get(
        `${USER_API_ENDPOINT}/post/${postId}/comments?page=${page}&limit=10`,
        { withCredentials: true }
      );
      const newComments = res.data.comments || [];
      setComments((prev) => (page === 1 ? newComments : [...prev, ...newComments]));
      setHasMoreComments(res.data.hasMore ?? false);
    } catch (err) {
      console.error("Comments error:", err);
    }
  }, [postId]);

  useEffect(() => {
    if (currentUser?._id) {
      fetchPost();
      fetchComments(1);
    }
  }, [currentUser?._id, fetchPost, fetchComments]);

  const toggleLike = async () => {
    if (!post) return;
    const wasLiked = post.isLiked;
    setPost((p) => ({
      ...p,
      isLiked: !wasLiked,
      likesCount: wasLiked ? p.likesCount - 1 : p.likesCount + 1,
    }));
    try {
      await axios.post(`${USER_API_ENDPOINT}/post/${post._id}/like`, {}, { withCredentials: true });
    } catch (err) {
      setPost((p) => ({
        ...p,
        isLiked: wasLiked,
        likesCount: wasLiked ? p.likesCount + 1 : p.likesCount - 1,
      }));
    }
  };

  const toggleFollow = async () => {
    try {
      await axios.post(
        `${USER_API_ENDPOINT}/follow/${post.author._id}`,
        {},
        { withCredentials: true }
      );
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  const sendComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || sending) return;
    setSending(true);
    try {
      const res = await axios.post(
        `${USER_API_ENDPOINT}/post/${post._id}/comment`,
        { text: comment },
        { withCredentials: true }
      );
      setComments((prev) => [res.data.comment, ...prev]);
      setPost((p) => ({ ...p, commentsCount: p.commentsCount + 1 }));
      setComment("");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const deletePost = async () => {
    if (!confirm("Delete post?")) return;
    try {
      await axios.delete(`${USER_API_ENDPOINT}/post/${post._id}`, { withCredentials: true });
      navigate("/explore");
    } catch (err) {
      console.error(err);
    }
  };

  const loadMoreComments = () => {
    setCommentPage((p) => p + 1);
    fetchComments(commentPage + 1);
  };

  const prevImage = () => setCurrentImageIndex((i) => (i === 0 ? post.images.length - 1 : i - 1));
  const nextImage = () => setCurrentImageIndex((i) => (i === post.images.length - 1 ? 0 : i + 1));

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove = (e) => { touchEndX.current = e.touches[0].clientX; };
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) diff > 0 ? nextImage() : prevImage();
    touchStartX.current = touchEndX.current = 0;
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!post) return null;

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  const images = post.images || [];
  const isOwnPost = post.author._id === currentUser?._id;

  return (
    <div className="min-h-screen bg-background">
      <div className="pb-20">
        {/* POST AUTHOR */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Link to={`/profile/${post.author._id}`} className="flex-shrink-0">
                <Avatar className="w-14 h-14 ring-4 ring-background shadow-lg hover:scale-105 transition">
                  <AvatarImage
                    src={post.author.profilePicture}
                    alt={post.author.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-purple-600 text-white font-bold text-lg">
                    {getInitial(post.author.name)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link
                  to={`/profile/${post.author._id}`}
                  className="font-bold text-base hover:underline"
                >
                  {post.author.username}
                </Link>
                <p className="text-xs text-muted-foreground">{post.author.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isOwnPost && (
                <Button
                  onClick={toggleFollow}
                  size="sm"
                  className={`rounded-full font-medium px-6 ${
                    isFollowing
                      ? "bg-muted text-foreground hover:bg-muted/80"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              )}
              {isOwnPost && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={deletePost} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          <p className="text-foreground mb-3 leading-relaxed">{post.caption || "No caption"}</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {post.department && (
              <Badge variant="secondary" className="text-xs">
                <GraduationCap className="w-3 h-3 mr-1" /> {post.department}
              </Badge>
            )}
            {post.year && (
              <Badge variant="secondary" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" /> {post.year}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>

        <div className="relative bg-black">
          {images.length > 0 ? (
            <div
              className="overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
              >
                {images.map((img, i) => (
                  <div key={i} className="w-full flex-shrink-0">
                    <img
                      src={img.url}
                      alt="Post"
                      className="w-full max-h-screen object-contain bg-black"
                      style={{ maxHeight: "75vh" }}
                    />
                  </div>
                ))}
              </div>

              {images.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  {currentImageIndex + 1}/{images.length}
                </div>
              )}

              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full transition ${
                        i === currentImageIndex ? "bg-white w-8" : "bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center">
              <ImageIcon className="w-20 h-20 text-gray-500" />
            </div>
          )}
        </div>

        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={toggleLike} className="flex items-center gap-2">
                <Heart
                  className={`w-7 h-7 transition-all ${
                    post.isLiked ? "fill-red-500 text-red-500" : "text-foreground"
                  }`}
                />
                <span className="font-medium">{post.likesCount}</span>
              </button>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-7 h-7" />
                <span className="font-medium">{post.commentsCount}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-4 bg-background border-b sticky top-12 z-40">
          <form onSubmit={sendComment} className="flex gap-2">
            <Input
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1 text-sm"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!comment.trim() || sending}
              className="rounded-full"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </div>

<div className="bg-background">
  {comments.length === 0 ? (
    <p className="text-center text-muted-foreground py-8">
      No comments yet. Be the first!
    </p>
  ) : (
    <div className="divide-y">
      {comments.map((c) => (
        <div key={c._id} className="p-4 flex gap-3">
          <Link to={`/profile/${c.user._id}`} className="flex-shrink-0">
            <Avatar className="w-10 h-10 ring-2 ring-offset-2 ring-purple-500/20 hover:ring-purple-500 transition">
              <AvatarImage
                src={c.user.profilePhoto || ""}
                alt={c.user.fullName}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-black-500 to-black-500 text-white font-bold text-sm">
                {/* {c.user.fullName?.[0]?.toUpperCase() || "🙈"} */}
                { "🙈"}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <Link
              to={`/profile/${c.user._id}`}
              className="font-medium hover:underline block -mt-1 text-xs text-muted-foreground"
            >
              {c.user.fullName || "Unknown User"}
            </Link>
            <p className="text-sm break-all whitespace-pre-wrap leading-snug mt-0.5">
              {c.text}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )}

  {hasMoreComments && (
    <Button variant="ghost" className="w-full" onClick={loadMoreComments}>
      Load more
    </Button>
  )}
</div>

      </div>
    </div>
  );
};

export default PostDetailPage;