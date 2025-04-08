'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HomeData } from "@/app/api/home/route";
import React from "react"; // Import React

interface HomeClientWrapperProps {
  homeData: HomeData;
  // featuredMembers is no longer needed here if team section is passed as children/prop
  teamSection: React.ReactNode; // Add prop for the team section JSX
}

export function HomeClientWrapper({ homeData, teamSection }: HomeClientWrapperProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-screen flex items-center justify-center" // Full screen height
        style={{
          // Base image overlay (unchanged)
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${homeData.hero.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* This inner container holds the text and buttons */}
        <div className="container mx-auto px-4">
          {/* Adjust gradient, opacity, blur amount, padding, and max-width as desired */}
          <div
             // --- EDIT: Increase max-width ---
             className="p-8 md:p-12 rounded-xl text-center text-white max-w-5xl mx-auto /* Changed max-w-3xl to max-w-5xl */
             // --- END EDIT ---
                        bg-gradient-to-br from-black/50 to-black/30  /* Subtle gradient background */
                        backdrop-blur-sm                           /* Frosted glass effect */
                        border border-white/10                      /* Optional: faint border */
                        shadow-lg"                                  /* Optional: subtle shadow */
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">{homeData.hero.headline}</h1>
            <p className="text-xl md:text-2xl mb-8">
              {homeData.hero.description}
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg">
                <Link href={homeData.hero.button1Link}>{homeData.hero.button1Text}</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href={homeData.hero.button2Link}>{homeData.hero.button2Text}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{homeData.aboutSummary.title}</h2>
            <p className="text-lg text-muted-foreground mb-8">
              {homeData.aboutSummary.description}
            </p>
            <Button asChild variant="outline">
              <Link href={homeData.aboutSummary.buttonLink}>{homeData.aboutSummary.buttonText}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Render the passed Team Section */}
      {teamSection}

      {/* Call to Action - Now at the bottom */}
      <section className="py-20 bg-primary text-primary-foreground mt-auto"> 
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{homeData.cta.title}</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            {homeData.cta.description}
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild variant="secondary">
              <Link href={homeData.cta.button1Link}>{homeData.cta.button1Text}</Link>
            </Button>
            <Button asChild>
              <Link href={homeData.cta.button2Link}>{homeData.cta.button2Text}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}