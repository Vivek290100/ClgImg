import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";
import { USER_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const FollowListModal = ({ open, setOpen, type, userId }) => {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoading(true);
        const endpoint =
          type === "followers"
            ? `${USER_API_ENDPOINT}/followers/${userId}`
            : `${USER_API_ENDPOINT}/following/${userId}`;
        const res = await axios.get(endpoint, { withCredentials: true });
        setList(res.data.users || []);
        setFilteredList(res.data.users || []);
      } catch (err) {
        toast.error("Failed to fetch list");
        console.error("Fetch list error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchList();
    }
  }, [open, type, userId]);

  useEffect(() => {
    const filtered = list.filter((user) =>
      (user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       user.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredList(filtered);
  }, [searchQuery, list]);

  const getInitials = (fullName, email) => {
    if (fullName && typeof fullName === "string") {
      return fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email && typeof email === "string") {
      return email.split("@")[0].slice(0, 2).toUpperCase();
    }
    return "??";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{type === "followers" ? "Followers" : "Following"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          {loading ? (
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {filteredList.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  {searchQuery ? "No users found" : `No ${type} yet`}
                </p>
              ) : (
                filteredList.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer"
                    onClick={() => {
                      setOpen(false);
                      navigate(`/profile/${user._id}`);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.profilePhoto} />
                        <AvatarFallback>
                          {getInitials(user.fullName, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{user.fullName || "Unknown User"}</p>
                        <p className="text-xs text-muted-foreground">{user.email || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowListModal;