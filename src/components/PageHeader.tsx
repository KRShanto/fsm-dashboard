import type { ReactNode } from "react";
import { FiArrowLeft } from "react-icons/fi";

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  backLabel?: string;
  actions?: ReactNode;
}

/**
 * Standardized page header component
 */
export default function PageHeader({
  title,
  onBack,
  backLabel = "Back",
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex items-center mb-6">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center text-foreground hover:text-primary mr-4 cursor-pointer"
        >
          <FiArrowLeft className="mr-1" /> {backLabel}
        </button>
      )}
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      {actions && <div className="flex-grow"></div>}
      {actions}
    </div>
  );
}
