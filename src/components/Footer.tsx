import React from 'react';
import Link from 'next/link'; // Added Link import
import { Container } from './Container';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin } from 'lucide-react'; // Added icons import

// Define interface for the expected contact data structure (subset of ContactData)
interface FooterContactData {
    email?: string;
    phone?: string;
    address?: string;
    socialLinks?: {
        facebook?: string;
        twitter?: string;
        linkedin?: string;
    };
}

// Fetch function specific for the footer data
async function getFooterContactData(): Promise<FooterContactData> {
    try {
        // Use the same environment variable setup as Header for consistency
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/contact`, {
            next: { revalidate: 3600 } // Revalidate hourly, adjust as needed
        });

        if (!res.ok) {
            console.error(`Footer: Failed to fetch contact data: ${res.status} ${res.statusText}`);
            return {}; // Return empty object on fetch error
        }
        const data = await res.json();
        // Return only the fields needed for the footer
        return {
            email: data.email,
            phone: data.phone,
            address: data.address,
            socialLinks: data.socialLinks,
        };
    } catch (error) {
        console.error("Footer: Error fetching contact data:", error);
        return {}; // Return empty object on general error
    }
}


// Make the Footer component async and update its structure
const Footer = async () => { // Changed to async function
    const currentYear = new Date().getFullYear();
    const contactData = await getFooterContactData(); // Fetch the data

    const { email, phone, address, socialLinks = {} } = contactData; // Destructure data

    return (
        <footer className="bg-muted py-8 border-t mt-auto"> {/* Increased padding */}
            <Container>
                {/* Changed from text-center div to grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Column 1: Navigation */}
                    <div className="space-y-2">
                       <h3 className="font-semibold text-lg mb-3 text-foreground">Quick Links</h3>
                       <Link href="/" className="block text-muted-foreground hover:text-primary transition-colors">Home</Link>
                       <Link href="/gallery" className="block text-muted-foreground hover:text-primary transition-colors">Gallery</Link>
                       <Link href="/members" className="block text-muted-foreground hover:text-primary transition-colors">Members</Link>
                       <Link href="/about" className="block text-muted-foreground hover:text-primary transition-colors">About</Link>
                       <Link href="/contact" className="block text-muted-foreground hover:text-primary transition-colors">Contact</Link>
                    </div>

                    {/* Column 2: Contact Info */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg mb-3 text-foreground">Get In Touch</h3>
                      {email && (
                        <div className="flex items-start space-x-3">
                          <Mail className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                          <a href={`mailto:${email}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">{email}</a>
                        </div>
                      )}
                      {phone && (
                        <div className="flex items-start space-x-3">
                          <Phone className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                          <a href={`tel:${phone.replace(/\D/g, '')}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">{phone}</a>
                        </div>
                      )}
                      {address && (
                         <div className="flex items-start space-x-3">
                            <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{address}</p>
                         </div>
                      )}
                    </div>

                    {/* Column 3: Social Media & Copyright */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg mb-3 text-foreground">Follow Us</h3>
                        {/* Social Links */}
                        {(socialLinks.facebook || socialLinks.twitter || socialLinks.linkedin) ? (
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
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No social links available.</p>
                        )}

                        {/* Copyright - moved down slightly */}
                         <div className="text-sm text-muted-foreground pt-6">
                            &copy; {currentYear} Heart2Heart Welfare. All rights reserved.
                         </div>
                    </div>

                </div>
            </Container>
        </footer>
    );
};

export default Footer;