"""Image storage helper.

Render's filesystem is ephemeral: anything saved to disk is deleted on every
redeploy, restart or free-tier spin-down. When CLOUDINARY_URL is set, images
are uploaded to Cloudinary (permanent URLs). Without it, the app falls back to
the local uploads folder so local development keeps working.
"""

import os
import re

import cloudinary
import cloudinary.uploader

CLOUDINARY_FOLDER = "cosmostore"


def cloudinary_enabled():
    return bool(os.environ.get("CLOUDINARY_URL"))


def save_image(file, upload_dir, unique_name):
    """Store an uploaded image and return the URL to save in the database."""
    if cloudinary_enabled():
        public_id = os.path.splitext(unique_name)[0]
        result = cloudinary.uploader.upload(
            file,
            public_id=public_id,
            folder=CLOUDINARY_FOLDER,
            resource_type="image",
            overwrite=False,
        )
        return result["secure_url"]

    os.makedirs(upload_dir, exist_ok=True)
    file.save(os.path.join(upload_dir, unique_name))
    return f"/static/uploads/{unique_name}"


def delete_image(image_url, upload_dir):
    """Best-effort removal of a stored image (never raises)."""
    try:
        if image_url and image_url.startswith("http"):
            if "res.cloudinary.com" in image_url and cloudinary_enabled():
                match = re.search(r"/upload/(?:v\d+/)?(.+)\.[A-Za-z0-9]+$", image_url)
                if match:
                    cloudinary.uploader.destroy(match.group(1), resource_type="image")
            return

        rel_path = image_url.replace("/static/uploads/", "")
        file_path = os.path.join(upload_dir, rel_path)
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception:
        pass
