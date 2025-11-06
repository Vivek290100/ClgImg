// src/components/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ADMIN_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#EF4444"];

// Utility to validate and format dates
const formatDate = (date) => {
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return "Unknown Date";
    }
    return format(parsedDate, "PPp");
  } catch {
    return "Unknown Date";
  }
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    totalFeedback: 0,
    feedbackTypes: [],
    departmentDistribution: [],
    userActivity: [],
    recentUsers: [],
    recentFeedback: [],
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, feedbackRes] = await Promise.all([
          axios.get(`${ADMIN_API_ENDPOINT}/users`, { withCredentials: true }),
          axios.get(`${ADMIN_API_ENDPOINT}/feedbacks`, { withCredentials: true }),
        ]);

        const users = usersRes.data.users || [];
        const feedbacks = feedbackRes.data.feedbacks || [];

        users.map(u => ({
          _id: u._id,
          fullName: u.fullName,
          email: u.email,
          department: u.department,
          createdAt: u.createdAt,
        }))

        const totalUsers = users.length;
        const activeUsers = users.filter((u) => u.isActive).length;
        const blockedUsers = totalUsers - activeUsers;

        const feedbackTypesCount = feedbacks.reduce((acc, f) => {
          acc[f.type] = (acc[f.type] || 0) + 1;
          return acc;
        }, {});
        const feedbackTypes = Object.entries(feedbackTypesCount).map(([name, value]) => ({
          name,
          value,
        }));

        const departmentCount = users.reduce((acc, u) => {
          const dept = u.department || "Unknown";
          acc[dept] = (acc[dept] || 0) + 1;
          return acc;
        }, {});
        const departmentDistribution = Object.entries(departmentCount).map(([name, value]) => ({
          name,
          value,
        }));

        const userActivity = users
          .sort((a, b) => (b.postsCount || 0) - (a.postsCount || 0))
          .slice(0, 5)
          .map((u) => ({
            name: u.fullName || u.email?.split("@")[0] || "Unknown",
            posts: u.postsCount || 0,
            followers: u.followersCount || 0,
          }));

        const recentUsers = users
          .map((u) => ({
            ...u,
            createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
          }))
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 5);

        const recentFeedback = feedbacks
          .filter((f) => f.createdAt)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setMetrics({
          totalUsers,
          activeUsers,
          blockedUsers,
          totalFeedback: feedbacks.length,
          feedbackTypes,
          departmentDistribution,
          userActivity,
          recentUsers,
          recentFeedback,
        });
      } catch (err) {
        toast.error("Failed to fetch dashboard data");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card className="border border-border">
          <CardHeader className="p-3">
            <CardTitle className="text-sm sm:text-base">Total Users</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <p className="text-xl sm:text-2xl font-bold">{metrics.totalUsers}</p>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardHeader className="p-3">
            <CardTitle className="text-sm sm:text-base">Active Users</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <p className="text-xl sm:text-2xl font-bold">{metrics.activeUsers}</p>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardHeader className="p-3">
            <CardTitle className="text-sm sm:text-base">Blocked Users</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <p className="text-xl sm:text-2xl font-bold">{metrics.blockedUsers}</p>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardHeader className="p-3">
            <CardTitle className="text-sm sm:text-base">Total Feedback</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <p className="text-xl sm:text-2xl font-bold">{metrics.totalFeedback}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-6">
        <Card className="border border-border">
          <CardHeader className="p-3">
            <CardTitle className="text-sm sm:text-base">Department Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {metrics.departmentDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">No department data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
                <PieChart>
                  <Pie
                    data={metrics.departmentDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={isMobile ? 60 : 80}
                    fill="#8884d8"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={true}
                  >
                    {metrics.departmentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader className="p-3">
            <CardTitle className="text-sm sm:text-base">Feedback Types</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {metrics.feedbackTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">No feedback data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
                <PieChart>
                  <Pie
                    data={metrics.feedbackTypes}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={isMobile ? 60 : 80}
                    fill="#8884d8"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={true}
                  >
                    {metrics.feedbackTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border col-span-1 lg:col-span-2">
          <CardHeader className="p-3">
            <CardTitle className="text-sm sm:text-base">Top 5 Active Users</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {metrics.userActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">No user activity data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
                <BarChart data={metrics.userActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={isMobile ? 10 : 12} />
                  <YAxis fontSize={isMobile ? 10 : 12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="posts" fill="#8B5CF6" name="Posts" />
                  <Bar dataKey="followers" fill="#EC4899" name="Followers" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <Card className="border border-border">
          <CardHeader className="p-3">
            <CardTitle className="text-sm sm:text-base">Recent Users</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {metrics.recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">No recent users available</p>
            ) : isMobile ? (
              <div className="space-y-3">
                {metrics.recentUsers.map((user) => (
                  <Card key={user._id} className="border border-border">
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
                          <p className="text-xs text-muted-foreground">{user.email || "N/A"}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 text-xs sm:text-sm">
                      <p>
                        <strong>Joined:</strong> {formatDate(user.createdAt)}
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Photo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.recentUsers.map((user) => (
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
                      <TableCell className="text-sm">{user.email || "N/A"}</TableCell>
                      <TableCell className="text-sm">{formatDate(user.createdAt)}</TableCell>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader className="p-3">
            <CardTitle className="text-sm sm:text-base">Recent Feedback</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {metrics.recentFeedback.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">No recent feedback available</p>
            ) : isMobile ? (
              <div className="space-y-3">
                {metrics.recentFeedback.map((feedback) => (
                  <Card key={feedback._id} className="border border-border">
                    <CardHeader className="p-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={feedback.user?.profilePhoto} className="object-cover" />
                          <AvatarFallback>
                            {feedback.user?.fullName
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase() || "N/A"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {feedback.user?.fullName || "Unknown User"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {feedback.user?.email || "N/A"}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 text-xs sm:text-sm">
                      <p>
                        <strong>Type:</strong> <span className="capitalize">{feedback.type || "N/A"}</span>
                      </p>
                      <p>
                        <strong>Submitted:</strong> {formatDate(feedback.createdAt)}
                      </p>
                      <p>
                        <strong>Message:</strong>
                      </p>
                      <div className="max-h-32 sm:max-h-40 overflow-y-auto bg-muted rounded-md p-2 whitespace-pre-wrap break-words">
                        {feedback.message || "No message"}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Photo</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.recentFeedback.map((feedback) => (
                    <TableRow key={feedback._id}>
                      <TableCell>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={feedback.user?.profilePhoto} className="object-cover" />
                          <AvatarFallback>
                            {feedback.user?.fullName
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase() || "N/A"}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            {feedback.user?.fullName || "Unknown User"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {feedback.user?.email || "N/A"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm capitalize">{feedback.type || "N/A"}</TableCell>
                      <TableCell className="max-w-[150px] sm:max-w-[200px] md:max-w-[300px]">
                        <div className="max-h-40 overflow-y-auto text-sm bg-muted rounded-md p-2 whitespace-pre-wrap break-words">
                          {feedback.message || "No message"}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(feedback.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
};

export default AdminDashboard;