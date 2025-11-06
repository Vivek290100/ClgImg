// src/components/pages/Settings.jsx
import React, { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { FiMoon, FiSun } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { USER_API_ENDPOINT } from "@/utils/constant";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    type: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "message" && value.length > 5000) {
      toast.error("Feedback message cannot exceed 5000 characters.");
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.type || !formData.message.trim()) {
      toast.error("Please select a feedback type and enter a message.");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(
        `${USER_API_ENDPOINT}/feedback`,
        {
          type: formData.type,
          message: formData.message,
        },
        { withCredentials: true }
      );
      toast.success("Feedback submitted successfully!");
      setFormData({ type: "", message: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit feedback. Please try again.");
      console.error("Feedback submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Theme</h3>
              <Button
                onClick={toggleTheme}
                variant="outline"
                size="icon"
                className="rounded-full hover:bg-accent transition"
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <FiMoon size={20} className="text-foreground" />
                ) : (
                  <FiSun size={20} className="text-foreground" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium">
                  Feedback Type
                </Label>
                <Select onValueChange={handleTypeChange} value={formData.type}>
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="report">Report an Issue</SelectItem>
                    <SelectItem value="opinion">Opinion about the App</SelectItem>
                    <SelectItem value="update">Suggest an Update</SelectItem>
                    <SelectItem value="feature">Request a New Feature</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium">
                  Your Message (max 5000 characters)
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Enter your feedback here..."
                  rows={5}
                  className="w-full"
                  maxLength={5000}
                />
                <p className="text-sm text-muted-foreground">
                  {formData.message.length}/5000 characters
                </p>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;