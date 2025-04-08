import React from 'react';
import { cn } from "@/lib/utils"; // Assuming you have a utility for conditional classes

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  // Add optional props for variations if needed, e.g., maxWidth
  // maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  // maxWidth = 'full', // Example default
  ...props
}) => {

  // Base classes for padding
  const baseClasses = "mx-auto px-4 sm:px-6 lg:px-8";

  // Optional max-width classes (uncomment and adjust if needed)
  /*
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: '', // No max-width constraint
  };
  */

  return (
    <div
      className={cn(
        baseClasses,
        // maxWidthClasses[maxWidth], // Uncomment if using maxWidth prop
        className // Allow additional classes to be passed
      )}
      {...props}
    >
      {children}
    </div>
  );
};