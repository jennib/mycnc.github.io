import React, { useState } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  title?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, content, title }) => {
  const [visible, setVisible] = useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), 300); // Small delay
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  return (
    <span className="relative inline-block" onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
      {children}
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-surface/90 backdrop-blur-md border border-white/10 text-text-primary text-sm rounded-lg shadow-xl z-50 p-3 animate-in fade-in zoom-in-95 duration-200">
          {title && <h4 className="font-bold mb-1 border-b border-white/10 pb-1 text-primary">{title}</h4>}
          {typeof content === 'string' ? <p className="text-text-secondary">{content}</p> : content}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-surface/90"></div>
        </div>
      )}
    </span>
  );
};

export default Tooltip;