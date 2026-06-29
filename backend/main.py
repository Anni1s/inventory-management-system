from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine
from .routers import products, customers, orders

# Create all tables in the database
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inventory & Order Management System API",
    description="API for managing products, customers, and orders.",
    version="1.0.0"
)

# Configure CORS for frontend access
origins = [
    "http://localhost",
    "http://localhost:80",
    "http://localhost:3000",
    "http://localhost:5173",
    "*" # For testing/deployment purposes, allow all or configure strictly
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Inventory & Order Management System API. Go to /docs for the API documentation."}
