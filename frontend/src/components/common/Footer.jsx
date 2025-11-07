import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card text-card-foreground py-12 mt-16 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500">Campus</span>
              <span className="text-foreground">Snap</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Your college social network – share moments, tag departments, stay connected.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="hover:bg-accent">
                <Instagram size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-accent">
                <Facebook size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-accent">
                <Twitter size={20} />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-foreground">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/feed" className="hover:text-foreground transition">Feed</Link></li>
              <li><Link to="/upload" className="hover:text-foreground transition">Upload Photo</Link></li>
              <li><Link to="/departments" className="hover:text-foreground transition">Departments</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-foreground">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition">Help Center</a></li>
              <li><a href="#" className="hover:text-foreground transition">Report Issue</a></li>
              <li><a href="#" className="hover:text-foreground transition">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Contact</h4>
            <p className="text-sm text-muted-foreground">CampusSnap HQ</p>
            <p className="text-sm text-muted-foreground">info@campussnap.edu</p>
            <p className="text-sm text-muted-foreground">+91 98765 43210</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} CampusSnap. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;