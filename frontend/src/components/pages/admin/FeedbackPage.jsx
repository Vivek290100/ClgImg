// src/components/pages/admin/FeedbackPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ADMIN_API_ENDPOINT } from "@/utils/constant";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${ADMIN_API_ENDPOINT}/feedbacks`, {
          withCredentials: true,
        });
        if (data.success) {
          setFeedbacks(data.feedbacks);
        } else {
          toast.error("Failed to fetch feedbacks");
        }
      } catch (error) {
        console.error("Feedback fetch error:", error.response || error);
        toast.error(error.response?.data?.message || "Error fetching feedbacks");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">User Feedback</h1>
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      ) : feedbacks.length === 0 ? (
        <p className="text-muted-foreground text-center">No feedback available.</p>
      ) : isMobile ? (
        // Mobile: Card-based layout
        <div className="space-y-3">
          {feedbacks.map((feedback) => (
            <Card key={feedback._id} className="w-full border border-border">
              <CardHeader className="p-3">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={feedback.user?.profilePhoto} className="object-cover" />
                    <AvatarFallback>
                      {feedback.user?.fullName
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{feedback.user?.fullName || "Unknown User"}</p>
                    <p className="text-xs text-muted-foreground">{feedback.user?.email}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2 text-xs sm:text-sm">
                  <p>
                    <strong>Type:</strong> <span className="capitalize">{feedback.type}</span>
                  </p>
                  <p>
                    <strong>Submitted At:</strong>{" "}
                    {format(new Date(feedback.createdAt), "PPp")}
                  </p>
                  <p>
                    <strong>Message:</strong>
                  </p>
                  <div className="max-h-32 sm:max-h-40 overflow-y-auto bg-muted rounded-md p-2 whitespace-pre-wrap break-words">
                    {feedback.message}
                  </div>
                  <Button variant="outline" size="sm" disabled className="mt-2 text-xs">
                    No Actions
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
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbacks.map((feedback) => (
                <TableRow key={feedback._id}>
                  <TableCell>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={feedback.user?.profilePhoto} className="object-cover" />
                      <AvatarFallback>
                        {feedback.user?.fullName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{feedback.user?.fullName || "Unknown User"}</p>
                      <p className="text-xs text-muted-foreground">{feedback.user?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize text-sm">{feedback.type}</TableCell>
                  <TableCell className="max-w-[150px] sm:max-w-[200px] md:max-w-[300px]">
                    <div className="max-h-40 overflow-y-auto text-sm bg-muted rounded-md p-2 whitespace-pre-wrap break-words">
                      {feedback.message}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{format(new Date(feedback.createdAt), "PPp")}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" disabled className="text-xs">
                      No Actions
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

export default FeedbackPage;