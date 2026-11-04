from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import get_settings
from routers.auth import auth_router
from routers.post import posts_router
from routers.upload import upload_router
from routers.subscribers import router as sub_router
from routers.embed import embeds_router
from routers.settings import settings_router
from mcp_server.oauth import oauth_router
from mcp_server.server import mcp, MCPRoutes


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with mcp.session_manager.run():
        yield


# Create app
app = FastAPI(lifespan=lifespan)

# CORS
cfg = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=cfg.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(posts_router, prefix="/api")
app.include_router(upload_router, prefix="/api")
app.include_router(sub_router, prefix="/api")
app.include_router(embeds_router, prefix="/api")
app.include_router(settings_router, prefix="/api")
app.include_router(oauth_router, prefix="/api")

# Added last so it runs first: MCP paths skip the site CORS policy (the SDK sets its own).
app.add_middleware(MCPRoutes)


# Root endpoint
@app.get("/")
def root():
    return {"message": "Welcome to the Blog API"}
