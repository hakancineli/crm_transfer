from PIL import Image
import os

def make_icons(logo_path, out_dir):
    try:
        img = Image.open(logo_path)
        # Favicon (ICO) - multiple sizes
        img.save(os.path.join(out_dir, 'favicon.ico'), sizes=[(16,16), (32,32), (48,48)])
        # Apple touch icon
        img_apple = img.resize((180, 180), Image.Resampling.LANCZOS)
        img_apple.save(os.path.join(out_dir, 'apple-touch-icon.png'))
        print("Generated icons.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    logo = "/Users/hakancineli/protransfer_site/public/images/logo.png"
    dest = "/Users/hakancineli/protransfer_site/public"
    make_icons(logo, dest)
