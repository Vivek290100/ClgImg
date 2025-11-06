// src/components/pages/user/Upload.jsx
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, X, Camera, Image as ImageIcon, UploadCloud, Sparkles } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { USER_API_ENDPOINT } from "@/utils/constant";
import { departments, years } from "@/utils/departments";

const Upload = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [caption, setCaption] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"], // NO VIDEO
    },
    maxFiles: 5,
    minFiles: 1,
    maxSize: 2 * 1024 * 1024, // 2MB
    onDrop: (acceptedFiles, rejectedFiles) => {
      // REJECTED FILES
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file, errors }) => {
          if (errors[0]?.code === "file-too-large") {
            toast.error(`${file.name} is larger than 2MB`);
          } else if (errors[0]?.code === "too-many-files") {
            toast.error("Maximum 5 images allowed");
          } else if (errors[0]?.code === "file-invalid-type") {
            toast.error("Only images allowed (no videos)");
          }
        });
        return;
      }

      // ACCEPTED FILES
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, { id: Math.random().toString(36) })
      );

      setFiles(newFiles);
      setPreviews(
        newFiles.map((file) => ({
          url: URL.createObjectURL(file),
          type: "image",
          id: file.id,
        }))
      );
    },
  });

  const removeFile = (id) => {
    const preview = previews.find((p) => p.id === id);
    if (preview) URL.revokeObjectURL(preview.url);
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setPreviews((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select 1–5 images");
      return;
    }
    if (!department || !year) {
      toast.error("Please select department and year");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("media", file));
    formData.append("caption", caption);
    formData.append("department", department);
    formData.append("year", year);

    try {
      const res = await axios.post(
        `${USER_API_ENDPOINT}/post/create`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success("Posted!");
        navigate(`/profile/${user?._id}`);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Camera className="w-7 h-7 text-purple-500" />
            Create Post
          </h1>
          <Button onClick={() => navigate(-1)} variant="ghost" size="icon" className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Dropzone + Preview */}
          <div className="lg:col-span-2">
            <Card className="p-6 border-border bg-card">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all
                  ${isDragActive ? "border-purple-500 bg-purple-500/5" : "border-border hover:border-purple-500/50"}
                `}
              >
                <input {...getInputProps()} />
                <UploadCloud className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                <p className="text-lg font-medium text-foreground mb-2">
                  {isDragActive ? "Drop images here..." : "Drag & drop up to 5 images"}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Max 5 images · 2MB each · JPG, PNG, WebP
                </p>
                <Button size="lg" className="bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 text-white hover:shadow-xl">
                  <ImageIcon className="mr-2 h-5 w-5" />
                  Choose Images
                </Button>
              </div>

              {previews.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    Preview ({previews.length}/5)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {previews.map((p) => (
                      <div key={p.id} className="relative group rounded-lg overflow-hidden border">
                        <img src={p.url} alt="preview" className="w-full h-40 object-cover" />
                        <button
                          onClick={() => removeFile(p.id)}
                          className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT: Form */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-5 border-border bg-card">
              <Label className="text-foreground font-medium mb-3 block">Caption (Optional)</Label>
              <Textarea
                placeholder="What's happening on campus? #Freshers #CSE"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="min-h-32 resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">{caption.length}/500</p>
            </Card>

            <Card className="p-5 border-border bg-card">
              <Label className="text-foreground font-medium mb-3 block">Department *</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Card>

            <Card className="p-5 border-border bg-card">
              <Label className="text-foreground font-medium mb-3 block">Year *</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Card>

            <Button
              onClick={handleUpload}
              disabled={isUploading || files.length === 0 || files.length > 5 || !department || !year}
              className="w-full h-12 text-lg font-medium bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 text-white hover:shadow-2xl disabled:opacity-70"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-5 w-5" />
                  Post Now
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;