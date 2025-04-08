'use client'; // Needs to be a client component for state and interactivity

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For feedback
import { Terminal, CheckCircle, AlertCircle, Loader2 } from "lucide-react"; // Icons

type SubmissionStatus = 'idle' | 'loading' | 'success' | 'error';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default browser submission
    setStatus('loading');
    setFeedbackMessage('');

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      // Success
      setStatus('success');
      setFeedbackMessage(result.message || 'Your message has been sent successfully!');
      // Clear form on success
      setName('');
      setEmail('');
      setMessage('');
      // Optionally hide form or show message permanently after success
      // setTimeout(() => setStatus('idle'), 5000); // Reset after 5s

    } catch (error: any) {
      console.error('Submission error:', error);
      setStatus('error');
      setFeedbackMessage(error.message || 'An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-semibold text-foreground mb-4">Send Us a Message</h2>

      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={status === 'loading'}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === 'loading'}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          disabled={status === 'loading'}
        />
      </div>

      {/* Feedback Area */}
      {status === 'success' && (
        <Alert variant="default" className="bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>
            {feedbackMessage}
          </AlertDescription>
        </Alert>
      )}
      {status === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {feedbackMessage}
          </AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={status === 'loading' || status === 'success'}>
        {status === 'loading' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          'Send Message'
        )}
      </Button>
    </form>
  );
}

// Make sure this component is exported if it wasn't already
export default ContactForm;