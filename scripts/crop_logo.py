from PIL import Image
import sys

def crop_image(path):
    img = Image.open(path)
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    bbox = img.getbbox()
    if bbox:
        img_cropped = img.crop(bbox)
        img_cropped.save(path)
        print(f"Cropped {path} to {bbox}")
    else:
        print(f"Nothing to crop in {path}")

if __name__ == "__main__":
    for arg in sys.argv[1:]:
        crop_image(arg)
