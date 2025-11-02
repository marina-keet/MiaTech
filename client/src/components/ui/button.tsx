import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-primary";
    
    const variants = {
      default: "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-lg hover:shadow-xl",
      secondary: "bg-accent-200 text-neutral-800 hover:bg-accent-300 active:bg-accent-400",
      outline: "border-2 border-primary-600 text-primary-600 bg-transparent hover:bg-primary-50 active:bg-primary-100",
      ghost: "text-primary-600 hover:bg-primary-50 active:bg-primary-100",
      link: "text-primary-600 underline-offset-4 hover:underline",
      destructive: "bg-error-500 text-white hover:bg-error-600 active:bg-error-700 shadow-lg"
    };

    const sizes = {
      default: "h-11 px-6 py-3",
      sm: "h-9 px-4 py-2 text-sm",
      lg: "h-12 px-8 py-3 text-base",
      icon: "h-10 w-10 p-0"
    };

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };