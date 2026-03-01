import re
from sqlalchemy.orm import Session
from models.post import BlogPost


def generate_slug(title: str, db: Session) -> str:
    base_slug = title.lower().strip()
    base_slug = re.sub(r'[^\w\s-]', '', base_slug)  # Remove special chars
    base_slug = re.sub(r'[-\s]+', '-', base_slug)   # Replace spaces with -
   
    slug = base_slug
    counter = 2

    while db.query(BlogPost).filter(BlogPost.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug

