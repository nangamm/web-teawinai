// @desc    Generate placeholder image
// @route   GET /api/placeholder/:width/:height
// @access   Public
exports.getPlaceholderImage = (req, res) => {
  try {
    const { width, height } = req.params;
    
    // Validate dimensions
    const w = parseInt(width) || 300;
    const h = parseInt(height) || 200;
    
    // Limit maximum dimensions
    const maxWidth = Math.min(w, 1200);
    const maxHeight = Math.min(h, 1200);
    
    // Generate a simple SVG placeholder
    const svg = `
      <svg width="${maxWidth}" height="${maxHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="16" fill="#9ca3af">
          ${maxWidth} × ${maxHeight}
        </text>
      </svg>
    `;
    
    // Set headers for SVG
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.send(svg.trim());
    
  } catch (error) {
    console.error('Placeholder image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate placeholder image'
    });
  }
};
