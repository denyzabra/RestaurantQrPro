import snapServeLogo from "@assets/snap-serve-logo_1752595529889.jpeg";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12", 
  lg: "h-16 w-16",
  xl: "h-24 w-24"
};

export default function Logo({ className = "", size = "md", showText = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src={snapServeLogo} 
        alt="SnapServe Logo"
        className={`${sizeClasses[size]} object-contain`}
      />
      {showText && (
        <span className="font-bold text-xl bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
          SnapServe
        </span>
      )}
    </div>
  );
}