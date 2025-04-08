import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from '@/components/Header'; // Assuming you have a Header component
import Footer from '@/components/Footer'; // Import the new Footer component
import { ThemeProvider } from "@/components/theme/ThemeProvider"; // Assuming ThemeProvider exists

const inter = Inter({ subsets: ["latin"] });

// Assuming Metadata is defined above or imported

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
         {/* Wrap content to push footer down */}
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
         >
            <div className="flex flex-col min-h-screen"> {/* Flex column and min height */}
              <Header /> {/* Your existing Header */}
              <main className="flex-grow">{children}</main> {/* Main content takes available space */}
              <Footer /> {/* Add the Footer at the end */}
            </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
