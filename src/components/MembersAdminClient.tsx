'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label"; // Ensure this import is present and correct
import { Trash2, Plus, Save, ChevronDown, ChevronUp, Edit } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
}

export default function MembersAdminClient() { // Ensure export default is here
  const [members, setMembers] = useState<Member[]>([]);
  const [headline, setHeadline] = useState(''); // Add state for headline
  const [description, setDescription] = useState(''); // Add state for description
  const [callToAction, setCallToAction] = useState(''); // Add state for CTA
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  // Fetch members on component mount
  useEffect(() => {
    const fetchMembersData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/members'); // Fetches { headline: ..., members: [...] }
        if (!response.ok) {
           const errorText = await response.text();
           console.error(`MembersAdmin Fetch Error: ${response.status} ${response.statusText} - ${errorText}`);
          throw new Error(`Failed to fetch members data: ${response.statusText}`);
        }
        const data = await response.json(); // Parse the whole object

        // --- CHANGE: Validate the OBJECT and extract parts ---
        if (data && typeof data === 'object') {
            setHeadline(data.headline || 'Our Team'); // Set headline state
            setDescription(data.description || 'Meet the team.'); // Set description state
            setCallToAction(data.callToAction || ''); // Set CTA state

            if (Array.isArray(data.members)) {
                setMembers(data.members as Member[]); // Set members array state
            } else {
                console.warn("MembersAdmin Warning: 'members' property in response was not an array.", data);
                setMembers([]); // Set empty if members array is missing/invalid
            }
        } else {
             console.error("MembersAdmin Error: API response was not a valid object.", data);
             throw new Error('Received invalid data format from API.');
        }
        // --- END CHANGE ---

      } catch (err: any) {
        setError(`Error loading members data: ${err.message || 'Unknown error'}`);
        console.error(err);
        setMembers([]); // Ensure members is empty on error
      } finally {
        setLoading(false);
      }
    };

    fetchMembersData();
  }, []);

  // Add a new empty member
  const addMember = () => {
    const newMember: Member = {
      id: Date.now().toString(), // Simple unique ID
      name: '',
      role: '',
      bio: '',
      imageUrl: ''
    };
    setMembers([...members, newMember]);
  };

  // Remove a member
  const removeMember = (id: string) => {
    setMembers(members.filter(member => member.id !== id));
  };

  // Update a member field
  const updateMember = (id: string, field: keyof Member, value: string) => {
    setMembers(members.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    ));
  };

  // Save all members
  // --- CHANGE: Update saveMembers to include headline, description, cta ---
  const saveMembers = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    // Prepare the full MembersDataDocument payload
    const payload = {
        headline,
        description,
        callToAction,
        members // The current state of the members array
    };

    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send the complete object structure
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response.' }));
        throw new Error(errorData.message || `Failed to save members (Status: ${response.status})`);
      }

      const result = await response.json();
      setSuccess(result.message || 'Members data saved successfully!');

      // Optionally refetch to confirm or rely on optimistic update
      // fetchMembersData(); // If you want to refetch after save

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(`Error saving members data: ${err.message || 'Unknown error'}`);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  // --- END CHANGE ---

  // Toggle expanded state for a member
  const toggleMemberExpanded = (id: string) => {
    setExpandedMemberId(expandedMemberId === id ? null : id);
  };

  if (loading) {
    // This part seems fine
    return <div className="text-center py-8">Loading members data...</div>;
  }

  // The main return block where the error occurs
  return ( // Opening parenthesis for the return statement's JSX block
    <div className="space-y-6"> {/* Line 154: This should be valid JSX */}
      {/* Card for editing Header info */}
      <Card>
        <CardHeader>
            <CardTitle>Members Section Header</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <Label htmlFor="membersHeadline">Headline</Label>
                <Input
                    id="membersHeadline"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g., Our Team"
                />
            </div>
            <div>
                <Label htmlFor="membersDescription">Description</Label>
                <Textarea
                    id="membersDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Meet the dedicated members..."
                    rows={3}
                />
            </div>
             {/* Optionally include CTA if you want to edit it here */}
             {/*
             <div>
                 <Label htmlFor="membersCta">Call To Action Text (Optional)</Label>
                 <Input
                     id="membersCta"
                     value={callToAction}
                     onChange={(e) => setCallToAction(e.target.value)}
                     placeholder="e.g., Join Us"
                 />
             </div>
             */}
        </CardContent>
      </Card>
      {/* --- END CHANGE --- */}


      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Team Members List</h2>
         {/* Buttons remain the same */}
         <div className="flex gap-2">
          <Button onClick={addMember} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
          <Button onClick={saveMembers} disabled={saving} size="sm">
            {saving ? 'Saving...' : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save ALL Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {error && ( <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">{error}</div>)}
      {success && (<div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50" role="alert">{success}</div>)}


      {/* Grid for mapping members */}
      <div className="grid gap-6">
        {/* Member mapping logic */}
        {members.map((member) => (
          <Card key={member.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleMemberExpanded(member.id)}
                    className="mr-2 p-1"
                  >
                    {expandedMemberId === member.id ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </Button>
                  <CardTitle className="text-lg">
                    {member.name || 'New Member'}
                  </CardTitle>
                  {member.role && (
                    <span className="ml-2 text-sm text-gray-500">({member.role})</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {expandedMemberId !== member.id && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleMemberExpanded(member.id)}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeMember(member.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {expandedMemberId === member.id && (
              <CardContent>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <Input
                      value={member.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMember(member.id, 'name', e.target.value)}
                      placeholder="Member name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <Input
                      value={member.role}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMember(member.id, 'role', e.target.value)}
                      placeholder="Member role or title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Bio</label>
                    <Textarea
                      value={member.bio}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateMember(member.id, 'bio', e.target.value)}
                      placeholder="Short biography"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Image URL</label>
                    <Input
                      value={member.imageUrl}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMember(member.id, 'imageUrl', e.target.value)}
                      placeholder="/images/members/name.jpg"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
        {/* Fallback when no members */}
        {members.length === 0 && (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <p className="text-gray-500">No members added yet. Click "Add Member" to get started.</p>
          </div>
        )}
      </div>

    </div> // Closing tag for the main div
  ); // Closing parenthesis for return statement
} // Closing curly brace for the component function