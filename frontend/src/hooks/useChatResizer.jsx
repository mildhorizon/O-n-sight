import { useState, useEffect, useRef } from 'react';

export default function useChatResizer(initialWidth = "40%") {
  const [chatWidth, setChatWidth] = useState(initialWidth);
  const [isResizingChat, setIsResizingChat] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingChat && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newWidth = containerRect.right - e.clientX;
        
        if (newWidth > 250 && newWidth < containerRect.width * 0.6) {
          setChatWidth(newWidth + "px");
        }
      }
    };
    
    const handleMouseUp = () => { 
      setIsResizingChat(false); 
      document.body.style.cursor = 'default'; 
      document.body.style.userSelect = ''; 
    };
    
    if (isResizingChat) { 
      document.addEventListener('mousemove', handleMouseMove); 
      document.addEventListener('mouseup', handleMouseUp); 
      document.body.style.userSelect = 'none'; 
    }
    
    return () => { 
      document.removeEventListener('mousemove', handleMouseMove); 
      document.removeEventListener('mouseup', handleMouseUp); 
    };
  }, [isResizingChat]);

  return { chatWidth, isResizingChat, setIsResizingChat, containerRef };
}