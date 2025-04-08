'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Try to import Separator, but have a fallback
let Separator: React.FC<{ className?: string }>;
try {
  Separator = require("@/components/ui/separator").Separator;
} catch (e) {
  // Create a simple div as fallback if Separator is not available
  Separator = ({ className }: { className?: string }) => (
    <div className={`h-[1px] w-full bg-border ${className || ''}`} />
  );
}

interface AboutContent {
  aboutUs?: string;
  mission?: string;
  vision?: string;
  history?: string;
  values?: string[];
}

export default function AboutClientWrapper() {
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/about');
      if (!res.ok) {
        throw new Error('Failed to fetch about content');
      }
      
      const data = await res.json();
      setAboutContent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      // Set fallback content if fetch fails
      setAboutContent({
        aboutUs: "Heart2Heart Welfare Society is dedicated to improving healthcare accessibility.",
        mission: "Our mission is to foster a healthier society through accessible healthcare.",
        vision: "We envision a world where healthcare disparities are eliminated."
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !aboutContent) {
    return (
      <div className="text-destructive text-center py-12">
        <p>Error loading about content: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in">
      {/* About Us Section */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="bg-card">
          <CardTitle className="text-2xl md:text-3xl font-bold text-primary">About Us</CardTitle>
        </CardHeader>
        <Separator className="bg-border" />
        <CardContent className="p-6 md:p-8 bg-card text-card-foreground">
          <div className="prose dark:prose-invert max-w-none">
            {aboutContent?.aboutUs ? (
              <div dangerouslySetInnerHTML={{ __html: aboutContent.aboutUs }} />
            ) : (
              <p>Information about our organization is coming soon.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rest of the component remains the same */}
      {/* Mission Section */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="bg-card">
          <CardTitle className="text-2xl md:text-3xl font-bold text-primary">Our Mission</CardTitle>
        </CardHeader>
        <Separator className="bg-border" />
        <CardContent className="p-6 md:p-8 bg-card text-card-foreground">
          <div className="prose dark:prose-invert max-w-none">
            {aboutContent?.mission ? (
              <div dangerouslySetInnerHTML={{ __html: aboutContent.mission }} />
            ) : (
              <p>Our mission information is coming soon.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vision Section */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="bg-card">
          <CardTitle className="text-2xl md:text-3xl font-bold text-primary">Our Vision</CardTitle>
        </CardHeader>
        <Separator className="bg-border" />
        <CardContent className="p-6 md:p-8 bg-card text-card-foreground">
          <div className="prose dark:prose-invert max-w-none">
            {aboutContent?.vision ? (
              <div dangerouslySetInnerHTML={{ __html: aboutContent.vision }} />
            ) : (
              <p>Our vision information is coming soon.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* History Section - Only show if content exists */}
      {aboutContent?.history && (
        <Card className="border border-border shadow-sm">
          <CardHeader className="bg-card">
            <CardTitle className="text-2xl md:text-3xl font-bold text-primary">Our History</CardTitle>
          </CardHeader>
          <Separator className="bg-border" />
          <CardContent className="p-6 md:p-8 bg-card text-card-foreground">
            <div className="prose dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: aboutContent.history }} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Values Section - Only show if content exists */}
      {aboutContent?.values && aboutContent.values.length > 0 && (
        <Card className="border border-border shadow-sm">
          <CardHeader className="bg-card">
            <CardTitle className="text-2xl md:text-3xl font-bold text-primary">Our Values</CardTitle>
          </CardHeader>
          <Separator className="bg-border" />
          <CardContent className="p-6 md:p-8 bg-card text-card-foreground">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aboutContent.values.map((value, index) => (
                <li key={index} className="bg-accent/10 p-5 rounded-lg shadow-sm border border-border">
                  <div dangerouslySetInnerHTML={{ __html: value }} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}