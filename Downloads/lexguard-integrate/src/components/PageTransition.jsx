import React from 'react';

const PageTransition = ({ children }) => {
  return (
    <div className="animate-page-enter">
      {children}
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes page-enter {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-page-enter {
          animation: page-enter 0.4s ease-out;
        }
      `}} />
    </div>
  );
};

export default PageTransition;