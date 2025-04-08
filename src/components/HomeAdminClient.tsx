'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { HomeData } from '@/app/api/home/route'; // Import the interface
import { Checkbox } from "@/components/ui/checkbox" // Import Checkbox

// Define Member interface locally or import if defined globally
interface Member {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
}

// Update the defaultHomeData to include featuredMemberIds
const defaultHomeData: HomeData = {
    siteTitle: "Heart2Heart Welfare",
    hero: {
      headline: "",
      description: "",
      button1Text: "",
      button1Link: "",
      button2Text: "",
      button2Link: "",
      backgroundImage: "/images/default-hero.jpg"
    },
    aboutSummary: { title: "", description: "", buttonText: "", buttonLink: "" },
    cta: { title: "", description: "", button1Text: "", button1Link: "", button2Text: "", button2Link: "" },
    featuredMemberIds: [] // Initialize as empty array
};

export function HomeAdminClient() {
    const [homeData, setHomeData] = useState<HomeData>(defaultHomeData);
    const [members, setMembers] = useState<Member[]>([]); // State for members list
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingMembers, setIsLoadingMembers] = useState(true); // Loading state for members


    // Fetch members data
    const fetchMembers = useCallback(async () => {
        setIsLoadingMembers(true);
        setMembers([]); // Reset members initially or on re-fetch
        try {
            const response = await fetch('/api/members'); // Fetches { headline: ..., members: [...] }

            if (!response.ok) {
                let errorBody = 'Could not read error response body.';
                try { errorBody = await response.text(); } catch (readError) { /* ignore */ }
                console.error(`Failed to fetch members data object: ${response.status} ${response.statusText} - Body: ${errorBody}`);
                throw new Error(`Failed to fetch members data. Status: ${response.status} ${response.statusText}`);
            }

            // Parse the whole object returned by the API
            const membersData = await response.json();

            // --- CHANGE: Validate the OBJECT and extract the 'members' ARRAY ---
            if (membersData && typeof membersData === 'object' && Array.isArray(membersData.members)) {
                // Extract the members array from the response object
                setMembers(membersData.members as Member[]);
            } else {
                console.error("Fetch Members Error: API response is not the expected object structure or 'members' is not an array. Received:", membersData);
                toast.error('Received invalid data format for members list.');
                setMembers([]); // Set to empty array if data structure is wrong
            }
            // --- END CHANGE ---

        } catch (error) {
            console.error("Fetch Members Error (Home Admin):", error);
            // Avoid duplicate toasts
            if (!(error instanceof Error && error.message.includes('API response is not'))) {
                 const errorMessage = error instanceof Error ? error.message : 'Failed to load members list.';
                 toast.error(errorMessage);
            }
            setMembers([]); // Ensure state is an empty array on any error
        } finally {
            setIsLoadingMembers(false);
        }
    }, []);

    // Fetch existing home data
    const fetchHomeData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/home');
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.statusText}`);
            }
            const data: HomeData = await response.json();
             // Ensure featuredMemberIds is always initialized as an array
            setHomeData({ ...defaultHomeData, ...data, featuredMemberIds: data.featuredMemberIds || [] });
            toast.success('Homepage data loaded.');
        } catch (error) {
            console.error("Fetch Error:", error);
            toast.error('Failed to load homepage data. Using defaults.');
            setHomeData(defaultHomeData);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Fetch both home data and members list
        fetchHomeData();
        fetchMembers();
    }, [fetchHomeData, fetchMembers]); // Add fetchMembers dependency

    // Handle input changes generically
    const handleInputChange = (section: keyof Omit<HomeData, 'featuredMemberIds'>, field: string, value: string) => {
        setHomeData(prevData => ({
            ...prevData,
            [section]: {
                ...(prevData[section] as any),
                [field]: value,
            },
        }));
    };

    // Handle changes in featured member selection
    const handleMemberSelectionChange = (memberId: string, checked: boolean | 'indeterminate') => {
        setHomeData(prevData => {
            const currentIds = prevData.featuredMemberIds || [];
            let newIds: string[];

            if (checked) {
                // Add memberId if not already present and count is less than 3
                if (!currentIds.includes(memberId) && currentIds.length < 3) {
                    newIds = [...currentIds, memberId];
                } else if (currentIds.length >= 3) {
                     toast.warning('You can only select up to 3 featured members.');
                     return prevData; // Prevent adding more than 3
                 }else {
                     newIds = currentIds; // Already present, no change
                 }
            } else {
                // Remove memberId
                newIds = currentIds.filter(id => id !== memberId);
            }
            return { ...prevData, featuredMemberIds: newIds };
        });
    };


    // Save data
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/home', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Explicitly ensure featuredMemberIds is included
                body: JSON.stringify({
                    ...homeData,
                    featuredMemberIds: homeData.featuredMemberIds || [] // Ensure it's always an array
                }),
            });

            // Improved error handling
            if (!response.ok) {
                let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) { /* Ignore */ }
                throw new Error(errorMessage);
            }

             const result = await response.json();
             toast.success(result.message || 'Homepage updated successfully!');
             // Optionally re-fetch data after save to confirm state
             // fetchHomeData();

        } catch (error: any) {
            console.error("Save Error:", error);
            toast.error(`Failed to save homepage data: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || isLoadingMembers) { // Check both loading states
        return <div>Loading homepage editor...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Homepage Content</CardTitle>
                <CardDescription>Update the text and links displayed on the main homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Site Title Section */}
                <section className="space-y-4 border p-4 rounded-md">
                    <h3 className="text-lg font-semibold mb-2">Site Title / Logo</h3>
                    <div className="space-y-2">
                        <Label htmlFor="siteTitle">Site Title</Label>
                        <Input
                            id="siteTitle"
                            value={homeData.siteTitle}
                            onChange={(e) => setHomeData({...homeData, siteTitle: e.target.value})}
                            placeholder="e.g., Heart2Heart Welfare"
                        />
                        <p className="text-sm text-muted-foreground">This will be displayed as the logo text in the header.</p>
                    </div>
                </section>

                {/* Hero Section - no changes needed */}
                <section className="space-y-4 border p-4 rounded-md">
                    <h3 className="text-lg font-semibold mb-2">Hero Section</h3>
                    <div className="space-y-2">
                        <Label htmlFor="heroHeadline">Headline</Label>
                        <Input
                            id="heroHeadline"
                            value={homeData.hero.headline}
                            onChange={(e) => handleInputChange('hero', 'headline', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="heroDescription">Description</Label>
                        <Textarea
                            id="heroDescription"
                            value={homeData.hero.description}
                            onChange={(e) => handleInputChange('hero', 'description', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="heroBackgroundImage">Background Image URL</Label>
                        <Input
                            id="heroBackgroundImage"
                            value={homeData.hero.backgroundImage}
                            onChange={(e) => handleInputChange('hero', 'backgroundImage', e.target.value)}
                            placeholder="/images/hero-background.jpg"
                        />
                        <p className="text-sm text-muted-foreground">
                            Enter the path to an image in the public folder (e.g., /images/hero.jpg)
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="heroBtn1Text">Button 1 Text</Label>
                            <Input id="heroBtn1Text" value={homeData.hero.button1Text} onChange={(e) => handleInputChange('hero', 'button1Text', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="heroBtn1Link">Button 1 Link</Label>
                            <Input id="heroBtn1Link" value={homeData.hero.button1Link} onChange={(e) => handleInputChange('hero', 'button1Link', e.target.value)} placeholder="/example-page"/>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="heroBtn2Text">Button 2 Text</Label>
                            <Input id="heroBtn2Text" value={homeData.hero.button2Text} onChange={(e) => handleInputChange('hero', 'button2Text', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="heroBtn2Link">Button 2 Link</Label>
                            <Input id="heroBtn2Link" value={homeData.hero.button2Link} onChange={(e) => handleInputChange('hero', 'button2Link', e.target.value)} placeholder="/example-page"/>
                        </div>
                    </div>
                </section>

                {/* About Summary Section - no changes needed */}
                <section className="space-y-4 border p-4 rounded-md">
                    <h3 className="text-lg font-semibold mb-2">About Summary Section</h3>
                    <div className="space-y-2">
                         <Label htmlFor="aboutTitle">Title</Label>
                         <Input id="aboutTitle" value={homeData.aboutSummary.title} onChange={(e) => handleInputChange('aboutSummary', 'title', e.target.value)} />
                     </div>
                     <div className="space-y-2">
                         <Label htmlFor="aboutDescription">Description</Label>
                         <Textarea id="aboutDescription" value={homeData.aboutSummary.description} onChange={(e) => handleInputChange('aboutSummary', 'description', e.target.value)} />
                     </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="aboutBtnText">Button Text</Label>
                            <Input id="aboutBtnText" value={homeData.aboutSummary.buttonText} onChange={(e) => handleInputChange('aboutSummary', 'buttonText', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="aboutBtnLink">Button Link</Label>
                            <Input id="aboutBtnLink" value={homeData.aboutSummary.buttonLink} onChange={(e) => handleInputChange('aboutSummary', 'buttonLink', e.target.value)} placeholder="/example-page"/>
                        </div>
                    </div>
                </section>

                {/* Call to Action Section - updated to match data structure */}
                <section className="space-y-4 border p-4 rounded-md">
                    <h3 className="text-lg font-semibold mb-2">Call to Action Section</h3>
                    <div className="space-y-2">
                        <Label htmlFor="ctaTitle">Title</Label>
                        <Input id="ctaTitle" value={homeData.cta.title} onChange={(e) => handleInputChange('cta', 'title', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ctaDescription">Description</Label>
                        <Textarea id="ctaDescription" value={homeData.cta.description} onChange={(e) => handleInputChange('cta', 'description', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="ctaBtn1Text">Button 1 Text</Label>
                            <Input 
                                id="ctaBtn1Text" 
                                value={homeData.cta.button1Text} 
                                onChange={(e) => handleInputChange('cta', 'button1Text', e.target.value)} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ctaBtn1Link">Button 1 Link</Label>
                            <Input 
                                id="ctaBtn1Link" 
                                value={homeData.cta.button1Link} 
                                onChange={(e) => handleInputChange('cta', 'button1Link', e.target.value)} 
                                placeholder="/example-page"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="ctaBtn2Text">Button 2 Text</Label>
                            <Input 
                                id="ctaBtn2Text" 
                                value={homeData.cta.button2Text} 
                                onChange={(e) => handleInputChange('cta', 'button2Text', e.target.value)} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ctaBtn2Link">Button 2 Link</Label>
                            <Input 
                                id="ctaBtn2Link" 
                                value={homeData.cta.button2Link} 
                                onChange={(e) => handleInputChange('cta', 'button2Link', e.target.value)} 
                                placeholder="/example-page"
                            />
                        </div>
                    </div>
                </section>

                {/* --- Featured Members Section --- */}
                <section className="space-y-4 border p-4 rounded-md">
                    <h3 className="text-lg font-semibold mb-2">Featured Members</h3>
                    <p className="text-sm text-muted-foreground mb-4">Select up to 3 members to feature on the homepage.</p>
                     {/* Show loading state specifically for members */}
                     {isLoadingMembers ? (
                         <p>Loading members list...</p>
                     ) : members.length === 0 ? ( // Check length after loading is complete
                         <p>No members found or available to display.</p>
                     ) : (
                         <div className="space-y-3 max-h-60 overflow-y-auto border p-3 rounded-md">
                             {/* Ensure members is definitely an array here due to checks above */}
                             {members.map((member) => {
                                 // Defensive check for featuredMemberIds array before using .includes() or .length
                                 const featuredIds = Array.isArray(homeData.featuredMemberIds) ? homeData.featuredMemberIds : [];
                                 const isChecked = featuredIds.includes(member.id);
                                 const isDisabled = featuredIds.length >= 3 && !isChecked;

                                 return (
                                     <div key={member.id} className="flex items-center space-x-3">
                                         <Checkbox
                                             id={`member-${member.id}`}
                                             checked={isChecked}
                                             onCheckedChange={(checked) => handleMemberSelectionChange(member.id, checked)}
                                             disabled={isDisabled}
                                         />
                                         <Label htmlFor={`member-${member.id}`} className="cursor-pointer flex-1">
                                             {member.name} <span className="text-xs text-muted-foreground">({member.role})</span>
                                         </Label>
                                     </div>
                                 );
                             })}
                         </div>
                     )}
                </section>


                {/* --- Call to Action Section --- */}
                {/* ... existing cta fields ... */}

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}