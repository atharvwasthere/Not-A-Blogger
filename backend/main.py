from fastapi import FastAPI, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db
from models.post import BlogPost
from config import get_settings
from routers.auth import auth_router
from routers.post import posts_router
from routers.upload import upload_router
from routers.subscribers import router as sub_router

# Create app
app = FastAPI()

# CORS
cfg = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=cfg.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/sitemap.xml")
def get_sitemap(db: Session = Depends(get_db)):
    """
    Dynamic sitemap.xml for SEO crawlers.
    """
    posts = db.query(BlogPost).filter(BlogPost.is_published).all()

    base_url = cfg.SITE_URL.rstrip("/")
    sitemap_xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    # Homepage
    sitemap_xml += f"  <url>\n    <loc>{base_url}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n"

    # Posts
    for post in posts:
        lastmod = (
            post.updated_at.strftime("%Y-%m-%d")
            if post.updated_at
            else post.created_at.strftime("%Y-%m-%d")
        )
        sitemap_xml += f"  <url>\n    <loc>{base_url}/blog/{post.slug}</loc>\n    <lastmod>{lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n"

    sitemap_xml += "</urlset>"

    return Response(content=sitemap_xml, media_type="application/xml")


# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(posts_router, prefix="/api")
app.include_router(upload_router, prefix="/api")
app.include_router(sub_router, prefix="/api")


# Root endpoint
@app.get("/")
def root():
    return {"message": "Welcome to the Blog API"}
