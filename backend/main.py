# main.py

from redis import asyncio as aioredis
from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    redis = aioredis.from_url("redis://localhost", encoding="utf8", decode_responses=True)
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")
    yield

app = FastAPI(lifespan=lifespan)
from routers import node, env, pod, pvc, resources, file_manager

# Crucial: Allow React (port 5173 or 3000) to talk to Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your frontend URL
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(node.router)
app.include_router(env.router)
app.include_router(pod.router)
app.include_router(pvc.router)
app.include_router(resources.router)
app.include_router(file_manager.router)

# To test, run uvicorn main:app --reload --port 5000
# Read /etc/supervisord.d/k8s_visualizer_app.ini for details of monitoring
# Run the following in local terminal and access localhost:9001 in the browser.
# ssh -L 9001:localhost:9001 admin@trcv1171079.trc.sas.com