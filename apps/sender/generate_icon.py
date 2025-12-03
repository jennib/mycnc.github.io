from PIL import Image, ImageDraw
import os

def create_icon():
    # Source paths
    source_path = 'public/mycnclogo.png'
    output_path = 'build/mycnc.ico'
    
    # Ensure build directory exists
    os.makedirs('build', exist_ok=True)
    
    # Open source image
    try:
        img = Image.open(source_path).convert('RGBA')
    except Exception as e:
        print(f"Error opening image: {e}")
        return

    # Define icon sizes
    sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
    icon_images = []

    # Background color (Dark grey to match app theme)
    bg_color = (26, 26, 26, 255) # #1a1a1a

    for size in sizes:
        # Create a new image with the background color
        new_img = Image.new('RGBA', size, (0, 0, 0, 0))
        
        # Create a rounded rectangle background (optional, but looks better)
        # For .ico, usually a full square or slightly rounded is fine.
        # Let's do a simple filled square for now, or a circle?
        # Windows 10/11 tiles often prefer full bleed or simple shapes.
        # Let's do a solid background with the logo centered.
        
        bg = Image.new('RGBA', size, bg_color)
        
        # Resize logo to fit with padding (e.g., 80% of size)
        padding = int(size[0] * 0.2)
        logo_size = (size[0] - padding, size[1] - padding)
        
        # Resize using LANCZOS for quality
        logo_resized = img.resize(logo_size, Image.Resampling.LANCZOS)
        
        # Calculate position to center
        pos = ((size[0] - logo_size[0]) // 2, (size[1] - logo_size[1]) // 2)
        
        # Paste logo onto background
        # Use the logo as a mask for itself if it has transparency
        bg.paste(logo_resized, pos, logo_resized)
        
        icon_images.append(bg)

    # Save as .ico
    # The first image is the primary one, others are appended
    try:
        icon_images[0].save(output_path, format='ICO', sizes=[(i.width, i.height) for i in icon_images], append_images=icon_images[1:])
        print(f"Successfully created {output_path}")
    except Exception as e:
        print(f"Error saving icon: {e}")

if __name__ == '__main__':
    create_icon()
