import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Filter,
  Image as ImageIcon,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Loader2,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import axios from "axios";
import { USER_API_ENDPOINT } from "@/utils/constant";
import debounce from "lodash.debounce";
import { departments, years } from "@/utils/departments";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const Explore = () => {
  const { user } = useSelector((s) => s.auth);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [open, setOpen] = useState(false);

  const hasMoreRef = useRef(true);
  const searchRef = useRef("");
  const deptRef = useRef("All Departments");
  const yearRef = useRef("All Years");
  const pageRef = useRef(1);
  const isLoadingRef = useRef(false);
  const resetRef = useRef(false);
  const observer = useRef();

  const fetchPosts = useCallback(async () => {
    if (!user?._id || isLoadingRef.current) return;

    isLoadingRef.current = true;
    setLoading(true);

    try {
      const currentPage = resetRef.current ? 1 : pageRef.current;

      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        search: searchRef.current.trim(),
        department: deptRef.current === "All Departments" ? "" : deptRef.current,
        year: yearRef.current === "All Years" ? "" : yearRef.current,
      });

      const res = await axios.get(`${USER_API_ENDPOINT}/explore?${params}`, {
        withCredentials: true,
      });

      const formatted = (res.data.posts || []).map((p) => {
        const media = p.media ?? [];
        const primaryMedia = media[0] || null;
        const images = media.filter((m) => m.type === "image");
        const imageCount = images.length;

        const isLiked = Array.isArray(p.likes) && p.likes.includes(user._id);

        return {
          ...p,
          media,
          primaryMedia,
          images,
          imageCount,
          likes: p.likes?.length || 0,
          comments: p.comments?.length || 0,
          isLiked,
        };
      });

      setPosts((prev) => (resetRef.current ? formatted : [...prev, ...formatted]));
      setHasMore(res.data.hasMore ?? false);
      hasMoreRef.current = res.data.hasMore ?? false;

      if (resetRef.current) {
        pageRef.current = 2;
        resetRef.current = false;
      } else {
        pageRef.current += 1;
      }
    } catch (err) {
      console.error("Explore fetch error:", err);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [user?._id]);

  const likePost = useCallback(
    async (postId, e) => {
      e.preventDefault();
      e.stopPropagation();

      const post = posts.find((p) => p._id === postId);
      if (!post) return;

      const wasLiked = post.isLiked;
      const newLikesCount = wasLiked ? post.likes - 1 : post.likes + 1;

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, likes: newLikesCount, isLiked: !wasLiked }
            : p
        )
      );

      try {
        const res = await axios.post(
          `${USER_API_ENDPOINT}/post/${postId}/like`,
          {},
          { withCredentials: true }
        );

        const serverLiked = res.data.liked;
        const serverLikesCount = res.data.likes.length;

        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId
              ? { ...p, likes: serverLikesCount, isLiked: serverLiked }
              : p
          )
        );
      } catch (err) {
        console.error("Like toggle failed:", err);
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId
              ? { ...p, likes: post.likes, isLiked: wasLiked }
              : p
          )
        );
      }
    },
    [posts]
  );

  const debouncedSearch = useCallback(
    debounce((value) => {
      searchRef.current = value;
      resetRef.current = true;
      setPosts([]);
      fetchPosts();
    }, 400),
    [fetchPosts]
  );

  const handleSearchChange = (e) => debouncedSearch(e.target.value);

  const setDeptFilter = (dept) => {
    deptRef.current = dept;
    resetRef.current = true;
    setPosts([]);
    fetchPosts();
  };

  const setYearFilter = (year) => {
    yearRef.current = year;
    resetRef.current = true;
    setPosts([]);
    fetchPosts();
  };

  const clearFilters = () => {
    deptRef.current = "All Departments";
    yearRef.current = "All Years";
    resetRef.current = true;
    setPosts([]);
    fetchPosts();
  };

  useEffect(() => {
    if (user?._id) {
      resetRef.current = true;
      setPosts([]);
      fetchPosts();
    }
  }, [user?._id, fetchPosts]);

  const lastPostRef = useCallback(
    (node) => {
      if (loading || !hasMoreRef.current || isLoadingRef.current) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchPosts();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, fetchPosts]
  );

  const SkeletonCard = () => (
    <div className="relative aspect-square bg-muted rounded-lg animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
    </div>
  );

  const renderGrid = () => {
    if (loading && posts.length === 0) {
      return Array.from({ length: 12 }).map((_, i) => (
        <SkeletonCard key={`sk-${i}`} />
      ));
    }

    if (posts.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center py-20 text-center">
          <ImageIcon className="w-20 h-20 mb-4 text-muted-foreground/30" />
          <p className="text-lg text-muted-foreground">No snaps found.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting filters or search.
          </p>
        </div>
      );
    }

    return posts.map((post, index) => {
      const isMulti = post.imageCount > 1;
      const isLast = index === posts.length - 1;
      const attachObserver = isLast && !loading && hasMore;

      return (
        <Link
          ref={attachObserver ? lastPostRef : null}
          key={post._id}
          to={`/post/${post._id}`}
          className="relative group overflow-hidden rounded-lg bg-card border border-border aspect-square transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:z-10"
        >
          <div className="absolute inset-0">
            {post.primaryMedia ? (
              post.primaryMedia.type === "video" ? (
                <video
                  src={post.primaryMedia.url}
                  className="w-full h-full object-cover"
                  controls
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={post.primaryMedia.url}
                  alt={post.caption || "Post"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
              </div>
            )}
          </div>

          {isMulti && (
            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded flex items-center gap-1 z-10">
              <ImageIcon className="w-3 h-3" />
              {post.imageCount}
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
            <div className="flex gap-5 text-white text-sm font-medium">
              <button
                onClick={(e) => likePost(post._id, e)}
                className="flex items-center gap-1.5 transition-transform hover:scale-110 active:scale-95"
              >
                <Heart
                  className={`w-5 h-5 drop-shadow-md ${
                    post.isLiked
                      ? "fill-red-500 text-red-500"
                      : "fill-white text-white"
                  }`}
                />
                <span className="drop-shadow-md">{post.likes}</span>
              </button>

              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-5 h-5 fill-white text-white drop-shadow-md" />
                <span className="drop-shadow-md">{post.comments}</span>
              </div>
            </div>
          </div>

          <button className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <div className="p-1.5 bg-black/50 backdrop-blur-sm rounded-full">
              <MoreHorizontal className="w-5 h-5 text-white drop-shadow-md" />
            </div>
          </button>
        </Link>
      );
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search snaps..."
              className="pl-10 pr-4 w-full"
              onChange={handleSearchChange}
            />
          </div>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Filter className="w-4 h-4" />
                {deptRef.current !== "All Departments" || yearRef.current !== "All Years" ? (
                  <span className="truncate max-w-32">
                    {deptRef.current !== "All Departments" ? deptRef.current : ""}{" "}
                    {yearRef.current !== "All Years" ? yearRef.current : ""}
                  </span>
                ) : (
                  "Filter"
                )}
                {(deptRef.current !== "All Departments" || yearRef.current !== "All Years") && (
                  <X
                    className="w-3.5 h-3.5 ml-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFilters();
                      setOpen(false);
                    }}
                  />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <Command>
                <CommandInput placeholder="Search department or year..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>

                  <CommandGroup heading="Departments">
                    {departments.map((d) => (
                      <CommandItem
                        key={d}
                        onSelect={() => {
                          setDeptFilter(d);
                          setOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        {d}
                        {deptRef.current === d && <span className="ml-auto text-primary">Check</span>}
                      </CommandItem>
                    ))}
                  </CommandGroup>

                  <CommandSeparator />

                  <CommandGroup heading="Year">
                    {years.map((y) => (
                      <CommandItem
                        key={y}
                        onSelect={() => {
                          setYearFilter(y);
                          setOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        {y}
                        {yearRef.current === y && <span className="ml-auto text-primary">Check</span>}
                      </CommandItem>
                    ))}
                  </CommandGroup>

                  <CommandSeparator />

                  {(deptRef.current !== "All Departments" || yearRef.current !== "All Years") && (
                    <CommandItem
                      onSelect={() => {
                        clearFilters();
                        setOpen(false);
                      }}
                      className="text-red-600 cursor-pointer"
                    >
                      Clear filters
                    </CommandItem>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {/* GRID */}
      <section className="container mx-auto px-4 py-6">
        <div
          className="
            grid gap-1 md:gap-4
            grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
          "
        >
          {renderGrid()}
        </div>

        {loading && posts.length > 0 && (
          <div className="col-span-full flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        <div className="col-span-full text-center text-xs text-muted-foreground py-2" />
      </section>

      <Button
        size="icon"
        className="fixed bottom-6 right-6 md:hidden rounded-full w-14 h-14 shadow-2xl bg-gradient-to-r from-yellow-400 to-purple-600 hover:scale-110 transition-all z-50"
        asChild
      >
        <Link to="/upload">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      </Button>
    </div>
  );
};

export default Explore;
