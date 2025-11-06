// src/components/pages/admin/UsersPage.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { ADMIN_API_ENDPOINT, USER_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${ADMIN_API_ENDPOINT}/users`, {
          withCredentials: true,
        });
        setUsers(res.data.users || []);
      } catch (err) {
        toast.error("Failed to fetch users");
        console.error("Fetch users error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchUsers();
    }
  }, [user]);

  const handleToggleBlock = async (userId, isActive) => {
    try {
      const endpoint = isActive
        ? `${USER_API_ENDPOINT}/admin/block/${userId}`
        : `${USER_API_ENDPOINT}/admin/unblock/${userId}`;
      await axios.post(endpoint, {}, { withCredentials: true });
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isActive: !isActive } : u
        )
      );
      toast.success(isActive ? "User blocked" : "User unblocked");
    } catch (err) {
      toast.error("Failed to update user status");
      console.error("Toggle block error:", err);
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Users</h1>
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      ) : users.length === 0 ? (
        <p className="text-muted-foreground text-center">No users found</p>
      ) : isMobile ? (
        // Mobile: Card-based layout
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user._id} className="w-full border border-border">
              <CardHeader className="p-3">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.profilePhoto} className="object-cover" />
                    <AvatarFallback>
                      {(user.fullName ?? "")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{user.fullName || "Unknown User"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2 text-xs sm:text-sm">
                  <p>
                    <strong>Username:</strong> {user.username || user.email.split("@")[0]}
                  </p>
                  <p>
                    <strong>Department:</strong> {user.department || "-"}
                  </p>
                  <p>
                    <strong>Bio:</strong>
                  </p>
                  <div className="max-h-32 sm:max-h-40 overflow-y-auto bg-muted rounded-md p-2 whitespace-pre-wrap break-words">
                    {user.bio || "-"}
                  </div>
                  <p>
                    <strong>Followers:</strong> {user.followersCount || 0}
                  </p>
                  <p>
                    <strong>Posts:</strong> {user.postsCount || 0}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive ? "Active" : "Blocked"}
                    </span>
                  </p>
                  <Button
                    variant={user.isActive ? "destructive" : "default"}
                    size="sm"
                    onClick={() => handleToggleBlock(user._id, user.isActive)}
                    className="mt-2 text-xs"
                  >
                    {user.isActive ? "Block" : "Unblock"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Desktop/Tablet: Table layout
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Photo</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Bio</TableHead>
                <TableHead>Followers</TableHead>
                <TableHead>Posts</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.profilePhoto} className="object-cover" />
                      <AvatarFallback>
                        {(user.fullName ?? "")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="text-sm">{user.fullName || "Unknown User"}</TableCell>
                  <TableCell className="text-sm">{user.email}</TableCell>
                  <TableCell className="text-sm">{user.username || user.email.split("@")[0]}</TableCell>
                  <TableCell className="text-sm">{user.department || "-"}</TableCell>
                  <TableCell className="max-w-[150px] sm:max-w-[200px] md:max-w-[300px]">
                    <div className="max-h-40 overflow-y-auto text-sm bg-muted rounded-md p-2 whitespace-pre-wrap break-words">
                      {user.bio || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{user.followersCount || 0}</TableCell>
                  <TableCell className="text-sm">{user.postsCount || 0}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive ? "Active" : "Blocked"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={user.isActive ? "destructive" : "default"}
                      size="sm"
                      onClick={() => handleToggleBlock(user._id, user.isActive)}
                      className="text-xs"
                    >
                      {user.isActive ? "Block" : "Unblock"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default UsersPage;