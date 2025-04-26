import React, { useState, useRef, useEffect } from 'react';

const ImageRotator = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0, scale: 1, rotation: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouch, setLastTouch] = useState(null);
  const [initialDistance, setInitialDistance] = useState(null);
  const [initialAngle, setInitialAngle] = useState(null);
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'image/png') {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          setLoading(false);
          // Reset position when new image is loaded
          setImagePosition({ x: 0, y: 0, scale: 1, rotation: 0 });
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Touch handlers
  const handleTouchStart = (e) => {
    e.preventDefault();
    
    if (e.touches.length === 1) {
      // Single touch - start drag
      setIsDragging(true);
      setLastTouch({ 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY 
      });
    } 
    else if (e.touches.length === 2) {
      // Two touches - start pinch/zoom and rotation
      setIsDragging(false);
      
      // Set initial distance for scaling
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      setInitialDistance(Math.sqrt(dx * dx + dy * dy));
      
      // Set initial angle for rotation
      setInitialAngle(Math.atan2(
        e.touches[1].clientY - e.touches[0].clientY,
        e.touches[1].clientX - e.touches[0].clientX
      ));
      
      setLastTouch({
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      });
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    
    if (isDragging && e.touches.length === 1) {
      // Handle dragging
      const deltaX = e.touches[0].clientX - lastTouch.x;
      const deltaY = e.touches[0].clientY - lastTouch.y;
      
      setImagePosition(prev => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastTouch({ 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY 
      });
    } 
    else if (e.touches.length === 2) {
      // Handle pinch/zoom and rotation
      const currentCenterX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const currentCenterY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      
      // Calculate new distance for scaling
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.sqrt(dx * dx + dy * dy);
      const scaleFactor = currentDistance / initialDistance;
      
      // Calculate new angle for rotation
      const currentAngle = Math.atan2(
        e.touches[1].clientY - e.touches[0].clientY,
        e.touches[1].clientX - e.touches[0].clientX
      );
      const angleDelta = currentAngle - initialAngle;
      
      // Set new position
      setImagePosition(prev => ({
        ...prev,
        scale: prev.scale * scaleFactor,
        rotation: prev.rotation + angleDelta * (180 / Math.PI),
        x: prev.x + (currentCenterX - lastTouch.x),
        y: prev.y + (currentCenterY - lastTouch.y)
      }));
      
      // Update references
      setInitialDistance(currentDistance);
      setInitialAngle(currentAngle);
      setLastTouch({
        x: currentCenterX,
        y: currentCenterY
      });
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) {
      setIsDragging(false);
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      setLastTouch({ 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY 
      });
    }
  };
  
  // Mouse handlers for desktop
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setLastTouch({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastTouch.x;
    const deltaY = e.clientY - lastTouch.y;
    
    setImagePosition(prev => ({
      ...prev,
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setLastTouch({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Wheel handler for desktop zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const scaleFactor = e.deltaY < 0 ? 1.1 : 0.9;
    
    setImagePosition(prev => ({
      ...prev,
      scale: prev.scale * scaleFactor
    }));
  };
  
  // Render canvas whenever image position changes
  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Set canvas size based on container
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.width; // Square aspect ratio
      } else {
        canvas.width = 500;
        canvas.height = 500;
      }
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Center point for clock
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Draw 12 rotated versions
      for (let i = 0; i < 12; i++) {
        // Save current context
        ctx.save();
        
        // Translate to canvas center
        ctx.translate(centerX, centerY);
        
        // Rotate by i * 30 degrees (clock rotation)
        const clockAngle = i * 30 * Math.PI / 180;
        ctx.rotate(clockAngle);
        
        // Apply image transformations
        ctx.translate(imagePosition.x, imagePosition.y);
        ctx.rotate(imagePosition.rotation * Math.PI / 180);
        ctx.scale(imagePosition.scale, imagePosition.scale);
        
        // Draw image centered at origin
        ctx.drawImage(image, -image.width / 2, -image.height / 2);
        
        // Restore context for next iteration
        ctx.restore();
      }
    }
  }, [image, imagePosition]);
  
  return (
    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow max-w-4xl mx-auto">
      <h2 className="text-xl md:text-2xl font-bold mb-3 text-gray-800">PNG Clock/Mandala Maker</h2>
      <p className="mb-3 text-sm md:text-base text-gray-600 text-center">
        Upload a PNG and use touch gestures to manipulate it:
      </p>
      <ul className="text-sm text-gray-600 mb-4 list-disc pl-5">
        <li>Drag with one finger to move</li>
        <li>Pinch with two fingers to zoom</li>
        <li>Twist with two fingers to rotate</li>
      </ul>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png"
        onChange={handleImageUpload}
        className="hidden"
      />
      
      {/* Mobile-friendly upload button */}
      <button 
        onClick={triggerFileInput}
        className="mb-4 w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded text-lg font-medium transition-colors"
      >
        Upload PNG Image
      </button>
      
      {loading && <p className="text-gray-500">Loading image...</p>}
      
      <div 
        ref={containerRef}
        className="w-full max-w-md mt-2 border border-gray-300 rounded overflow-hidden bg-white"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ touchAction: 'none' }}
      >
        <canvas 
          ref={canvasRef}
          style={{ 
            width: '100%',
            height: 'auto',
            display: image ? 'block' : 'none'
          }}
        />
        
        {!image && (
          <div className="flex items-center justify-center bg-gray-100 text-gray-400 p-8 h-64 w-full">
            Upload a PNG to get started
          </div>
        )}
      </div>
      
      {image && (
        <button 
          className="mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded transition-colors w-full md:w-auto text-lg font-medium"
          onClick={() => {
            const link = document.createElement('a');
            link.download = 'rotated-image.png';
            link.href = canvasRef.current.toDataURL();
            link.click();
          }}
        >
          Download Result
        </button>
      )}
    </div>
  );
};

export default ImageRotator;