import React from "react";
import "./SpotlightCard.css";

export type SpotlightCardProps = React.HTMLAttributes<HTMLDivElement>;

export default function SpotlightCard({ children, className = "", ...props }: SpotlightCardProps) {
  return (
    <div className={`spotlight-card${className ? ` ${className}` : ""}`} {...props}>
      {children}
    </div>
  );
}
