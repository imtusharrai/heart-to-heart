'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { Label } from "@/components/ui/label"; 
import { Switch } from '@/components/ui/switch';
import { Save, Trash2, Loader2 } from 'lucide-react';

// Reflects the structure in contact.json and the API route interface
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

export default function ContactAdminClient() {
  const [contactData, setContactData] = useState<ContactData>({ socialLinks: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch contact data on component mount
  useEffect(() => {
    const fetchContactData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/contact');
        if (!response.ok) {
          throw new Error(`Failed to fetch contact data: ${response.statusText}`);
        }
        const data: ContactData = await response.json();
        // Ensure socialLinks exists even if the file was empty initially
        setContactData({ socialLinks: {}, ...data });
      } catch (err) {
        setError(`Error loading contact data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContactData();
  }, []);

  // Save contact data
  const saveContactData = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save contact data' }));
        throw new Error(errorData.error || `Failed to save: ${response.statusText}`);
      }
      setSuccess('Contact data saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Error saving contact data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes for top-level fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactData(prev => ({ ...prev, [name]: value }));
  };

  // Handle switch changes (can be reused for different boolean fields)
  const handleGenericSwitchChange = (checked: boolean, fieldName: keyof ContactData) => {
    setContactData(prev => ({ ...prev, [fieldName]: checked }));
  };

  // Handle input changes for social links
  const handleSocialLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; // e.g., name="facebook"
    setContactData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value,
      },
    }));
  };

  // Function to clear a specific field
  const clearField = (field: keyof ContactData | `socialLinks.${keyof NonNullable<ContactData['socialLinks']>}`) => {
    // Optional: Add confirmation dialog here if desired
    // if (!window.confirm(`Are you sure you want to clear the content for "${field}"?`)) {
    //   return;
    // }
     if (field.startsWith('socialLinks.')) {
         const socialField = field.split('.')[1] as keyof NonNullable<ContactData['socialLinks']>;
         setContactData(prev => ({
            ...prev,
            socialLinks: { ...prev.socialLinks, [socialField]: '' },
         }));
     } else if (field === 'formEnabled') {
         // Set boolean to a default (e.g., true or false) instead of empty string
         setContactData(prev => ({ ...prev, [field]: true }));
     } else {
         setContactData(prev => ({ ...prev, [field]: '' }));
     }
  };


  if (loading) {
    return <div className="flex justify-center items-center py-8"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading contact settings...</div>;
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
         <h2 className="text-xl font-semibold">Manage Contact Page Content</h2>
         <Button onClick={saveContactData} disabled={saving || loading} size="sm">
            {/* Slightly simplified conditional rendering */}
            {saving 
              ? <span className="flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</span> 
              : <span className="flex items-center"><Save className="h-4 w-4 mr-2" />Save Changes</span>}
         </Button>
       </div>

       {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
       {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{success}</div>}

      <Card>
        <CardHeader>
            <CardTitle>Contact Page Text</CardTitle>
            <CardDescription>Set the headline and description shown on the contact page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="grid gap-2">
               <Label htmlFor="contactHeadline">Headline</Label>
                <Input id="contactHeadline" name="contactHeadline" value={contactData.contactHeadline || ''} onChange={handleInputChange} placeholder="e.g., Get In Touch" />
             </div>
             <div className="grid gap-2">
                <Label htmlFor="contactDescription">Description</Label>
                <Textarea id="contactDescription" name="contactDescription" value={contactData.contactDescription || ''} onChange={handleInputChange} placeholder="e.g., We'd love to hear from you..." rows={4} />
             </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
          <CardDescription>Enter the primary contact information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex items-center gap-2">
              <Input id="email" name="email" type="email" value={contactData.email || ''} onChange={handleInputChange} placeholder="info@example.com" />
              <Button variant="ghost" size="icon" onClick={() => clearField('email')} title="Clear Email">
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
          {/* Phone */}
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex items-center gap-2">
              <Input id="phone" name="phone" value={contactData.phone || ''} onChange={handleInputChange} placeholder="+1 (555) 123-4567" />
               <Button variant="ghost" size="icon" onClick={() => clearField('phone')} title="Clear Phone">
                 <Trash2 className="h-4 w-4 text-muted-foreground" />
               </Button>
            </div>
          </div>
          {/* Address */}
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
             <div className="flex items-center gap-2">
               <Textarea id="address" name="address" value={contactData.address || ''} onChange={handleInputChange} placeholder="123 Main St, Anytown, USA" rows={3} />
               <Button variant="ghost" size="icon" onClick={() => clearField('address')} title="Clear Address" className="self-start mt-1"> {/* Align button */}
                 <Trash2 className="h-4 w-4 text-muted-foreground" />
               </Button>
             </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Map & Form</CardTitle>
          <CardDescription>Configure the embedded map and contact form settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Map Embed URL */}
          <div className="grid gap-2">
            <Label htmlFor="mapEmbedUrl">Google Maps Embed URL</Label>
             <div className="flex items-center gap-2">
              <Input id="mapEmbedUrl" name="mapEmbedUrl" value={contactData.mapEmbedUrl || ''} onChange={handleInputChange} placeholder="https://www.google.com/maps/embed?pb=..." />
              <Button variant="ghost" size="icon" onClick={() => clearField('mapEmbedUrl')} title="Clear Map URL">
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
             </div>
             {/* Replace -> with HTML entity &rarr; */}
             <p className="text-xs text-muted-foreground">Find this under "Share" &rarr; "Embed a map" on Google Maps.</p>
          </div>
          {/* Enable Map Section */}
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="mapEnabled"
              checked={!!contactData.mapEnabled} // Ensure boolean
              onCheckedChange={(checked) => handleGenericSwitchChange(checked, 'mapEnabled')}
            />
            <Label htmlFor="mapEnabled">Enable Map Section on Page?</Label>
          </div>
          {/* ---- END EDIT ---- */}

          {/* Enable Contact Form */}
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="formEnabled"
              checked={!!contactData.formEnabled} // Ensure boolean
              onCheckedChange={(checked) => handleGenericSwitchChange(checked, 'formEnabled')}
            />
            <Label htmlFor="formEnabled">Enable Contact Form on Page?</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
          <CardDescription>Enter full URLs for your social profiles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Facebook */}
          <div className="grid gap-2">
            <Label htmlFor="facebook">Facebook URL</Label>
             <div className="flex items-center gap-2">
                <Input id="facebook" name="facebook" value={contactData.socialLinks?.facebook || ''} onChange={handleSocialLinkChange} placeholder="https://facebook.com/yourpage" />
                 <Button variant="ghost" size="icon" onClick={() => clearField('socialLinks.facebook')} title="Clear Facebook URL">
                   <Trash2 className="h-4 w-4 text-muted-foreground" />
                 </Button>
             </div>
          </div>
          {/* Twitter */}
          <div className="grid gap-2">
            <Label htmlFor="twitter">Twitter (X) URL</Label>
            <div className="flex items-center gap-2">
              <Input id="twitter" name="twitter" value={contactData.socialLinks?.twitter || ''} onChange={handleSocialLinkChange} placeholder="https://twitter.com/yourhandle" />
              <Button variant="ghost" size="icon" onClick={() => clearField('socialLinks.twitter')} title="Clear Twitter URL">
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
          {/* LinkedIn */}
          <div className="grid gap-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <div className="flex items-center gap-2">
              <Input id="linkedin" name="linkedin" value={contactData.socialLinks?.linkedin || ''} onChange={handleSocialLinkChange} placeholder="https://linkedin.com/company/yourcompany" />
              <Button variant="ghost" size="icon" onClick={() => clearField('socialLinks.linkedin')} title="Clear LinkedIn URL">
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
          {/* Add more social inputs here if needed */}
        </CardContent>
      </Card>

      {/* Add another Save Changes button at the bottom for convenience */}
      <div className="flex justify-end">
        <Button onClick={saveContactData} disabled={saving || loading} size="sm">
             {/* Slightly simplified conditional rendering */}
             {saving 
               ? <span className="flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</span> 
               : <span className="flex items-center"><Save className="h-4 w-4 mr-2" />Save Changes</span>}
        </Button>
      </div>
    </div>
  );
}