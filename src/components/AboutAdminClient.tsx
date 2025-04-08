'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ChevronDown, ChevronUp, Save } from 'lucide-react';

interface AboutContent {
  aboutUs?: string;
  mission?: string;
  vision?: string;
  history?: string;
  values?: string[];
}

export default function AboutAdminClient() {
  const [aboutContent, setAboutContent] = useState<AboutContent>({
    aboutUs: '',
    mission: '',
    vision: '',
    history: '',
    values: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedValues, setExpandedValues] = useState(false);

  // Fetch about content on component mount
  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const response = await fetch('/api/about');
        if (!response.ok) {
          throw new Error('Failed to fetch about content');
        }
        const data = await response.json();
        setAboutContent(data);
      } catch (err) {
        setError('Error loading about content');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutContent();
  }, []);

  // Save about content
  const saveAboutContent = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/about', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aboutContent),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save about content');
      }
      
      setSuccess('About content saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error saving about content');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Update a text field
  const updateTextField = (field: keyof AboutContent, value: string) => {
    setAboutContent({
      ...aboutContent,
      [field]: value
    });
  };

  // Function to clear the content of a specific section
  const deleteSectionContent = (field: 'aboutUs' | 'mission' | 'vision' | 'history') => {
    // Optional: Add confirmation dialog here if desired
    // if (!window.confirm(`Are you sure you want to clear the content for "${field}"?`)) {
    //   return;
    // }
    setAboutContent(prevContent => ({
      ...prevContent,
      [field]: '' // Set the content to an empty string
    }));
  };

  const addValue = () => {
    // Add a simpler default value without HTML
    const newValues = [...(aboutContent.values || []), "New Value: Describe the value"];
    setAboutContent({
      ...aboutContent,
      values: newValues
    });
    setExpandedValues(true);
  };

  // Update a value
  const updateValue = (index: number, value: string) => {
    const newValues = [...(aboutContent.values || [])];
    newValues[index] = value;
    setAboutContent({
      ...aboutContent,
      values: newValues
    });
  };

  // Remove a value
  const removeValue = (index: number) => {
    const newValues = [...(aboutContent.values || [])];
    newValues.splice(index, 1);
    setAboutContent({
      ...aboutContent,
      values: newValues
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading about content...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage About Page Content</h2>
        <Button onClick={saveAboutContent} disabled={saving} size="sm">
          {saving ? 'Saving...' : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      
      <div className="grid gap-6">
        {/* About Us Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>About Us</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => deleteSectionContent('aboutUs')}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                title="Clear About Us content" // Added tooltip
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={aboutContent.aboutUs || ''}
              onChange={(e) => updateTextField('aboutUs', e.target.value)}
              placeholder="Enter about us content" 
              rows={6}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Enter plain text content for the About Us section. Line breaks will be preserved.
            </p>
          </CardContent>
        </Card>
        
        {/* Mission Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Our Mission</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => deleteSectionContent('mission')}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                title="Clear Mission content"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={aboutContent.mission || ''}
              onChange={(e) => updateTextField('mission', e.target.value)}
              placeholder="Enter mission content" 
              rows={6}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Enter plain text content for the Mission section. Line breaks will be preserved.
            </p>
          </CardContent>
        </Card>
        
        {/* Vision Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Our Vision</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => deleteSectionContent('vision')}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                title="Clear Vision content"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={aboutContent.vision || ''}
              onChange={(e) => updateTextField('vision', e.target.value)}
              placeholder="Enter vision content" 
              rows={6}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Enter plain text content for the Vision section. Line breaks will be preserved.
            </p>
          </CardContent>
        </Card>
        
        {/* History Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Our History</CardTitle>
               <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => deleteSectionContent('history')}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                title="Clear History content"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={aboutContent.history || ''}
              onChange={(e) => updateTextField('history', e.target.value)}
              placeholder="Enter history content" 
              rows={6}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Enter plain text content for the History section. Line breaks will be preserved.
            </p>
          </CardContent>
        </Card>
        
        {/* Values Section - Note: Delete functionality is per value, not whole section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setExpandedValues(!expandedValues)}
                  className="mr-2 p-1"
                >
                  {expandedValues ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </Button>
                <CardTitle>Our Values</CardTitle>
              </div>
              <Button onClick={addValue} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Value
              </Button>
            </div>
          </CardHeader>
          
          {expandedValues && (
            <CardContent>
              <div className="space-y-4">
                {aboutContent.values && aboutContent.values.length > 0 ? (
                  aboutContent.values.map((value, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Textarea
                        value={value}
                        onChange={(e) => updateValue(index, e.target.value)}
                        placeholder="Value Name: Value description" // Updated placeholder
                        rows={3}
                        // Removed className="font-mono text-sm flex-grow"
                        className="flex-grow" // Keep flex-grow if needed for layout
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeValue(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 border border-dashed rounded-lg">
                    <p className="text-gray-500">No values added yet. Click "Add Value" to get started.</p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Enter each value as plain text. Consider a format like "Value Name: Description".
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}