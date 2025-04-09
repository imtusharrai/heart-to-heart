
'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Mail, Phone, MapPin, Facebook, Twitter, Linkedin } from 'lucide-react';
// --- EDIT: Import Card components ---
import { Card, CardContent } from "@/components/ui/card"; // Added Card imports
// --- END EDIT ---

// Reuse the same interface
interface ContactData {
  email?: string;
  phone?: string;
  address?: string;
  mapEmbedUrl?: string;
  mapEnabled?: boolean; // Add this line
  formEnabled?: boolean;
  contactHeadline?: string;
  contactDescription?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
}

// Basic Contact Form Placeholder
import ContactForm from './ContactForm'; // Ensure ContactForm is imported

export default function ContactClientWrapper() {
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContactData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/contact');
        if (!res.ok) {
          throw new Error('Failed to fetch contact information');
        }
        const data: ContactData = await res.json();
        setContactData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error(err);
        // Optionally set default data on error
        // setContactData({ contactHeadline: "Contact Us", contactDescription: "Error loading details." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchContactData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mr-3" />
        Loading Contact Information...
      </div>
    );
  }

  if (error || !contactData) {
    return (
      <div className="text-center py-10 px-4">
        <h2 className="text-2xl font-semibold text-destructive mb-2">Oops!</h2>
        <p className="text-destructive-foreground">
          {error || 'Could not load contact information. Please try again later.'}
        </p>
      </div>
    );
  }

  const {
    email,
    phone,
    address,
    mapEmbedUrl,
    mapEnabled, // Destructure the new field
    formEnabled,
    contactHeadline,
    contactDescription,
    socialLinks = {},
  } = contactData;

  return (
    <div className="space-y-12">
      {/* Optional Headline and Description */}
      {(contactHeadline || contactDescription) && (
         <div className="text-center mb-12">
             {contactHeadline && <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">{contactHeadline}</h1>}
             {contactDescription && <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{contactDescription}</p>}
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Contact Info Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">Our Details</h2>
          {email && (
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-foreground">Email</h3>
                <a href={`mailto:${email}`} className="text-muted-foreground hover:text-primary transition-colors">{email}</a>
              </div>
            </div>
          )}
          {phone && (
            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-foreground">Phone</h3>
                {/* Basic attempt to make it a tel link, might need adjustment for different formats */}
                <a href={`tel:${phone.replace(/\D/g, '')}`} className="text-muted-foreground hover:text-primary transition-colors">{phone}</a>
              </div>
            </div>
          )}
          {address && (
             <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-foreground">Address</h3>
                  {/* Use pre-wrap to respect newlines entered in the address */}
                  <p className="text-muted-foreground whitespace-pre-wrap">{address}</p>
                </div>
             </div>
          )}

          {/* Social Links */}
          {(socialLinks.facebook || socialLinks.twitter || socialLinks.linkedin) && (
            <div className="pt-4">
              <h3 className="font-medium text-foreground mb-3">Follow Us</h3>
              <div className="flex items-center space-x-4">
                {socialLinks.facebook && (
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" title="Facebook">
                    <Facebook className="h-6 w-6" />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" title="Twitter/X">
                    <Twitter className="h-6 w-6" />
                  </a>
                )}
                 {socialLinks.linkedin && (
                   <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" title="LinkedIn">
                     <Linkedin className="h-6 w-6" />
                   </a>
                 )}
                 {/* Add icons for other social platforms here */}
              </div>
            </div>
          )}
          {/* Conditionally render map */}
          {mapEnabled && mapEmbedUrl && (
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Find Us</h2>
              <div className="aspect-video overflow-hidden rounded-lg border border-border shadow-md">
                <iframe
                  src={mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location Map"
                ></iframe>
              </div>
            </div>
          )}
        </div>
        
        {/* Map and Form Section */}
        <div className="space-y-8">
        {formEnabled && (
             <Card> {/* Replaced div with Card */}
                <CardContent className="pt-6"> {/* Added CardContent with top padding */}
                   {/* Make sure the ContactForm component is rendered here */}
                   <ContactForm />
                </CardContent>
             </Card>
           )}

          {/* ---- START CHECK ---- */}
          {/* Conditionally render the Contact Form */}
          {/* Ensure this block exists and checks the formEnabled flag */}
          {/* --- EDIT: Wrap ContactForm in Card --- */}
           {/* --- END EDIT --- */}
           {/* ---- END CHECK ---- */}
        </div>
      </div>
    </div>
  );
}
