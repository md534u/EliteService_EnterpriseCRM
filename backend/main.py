from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

# Create Data Dir if not exists
if not os.path.exists("crm_data"):
    os.makedirs("crm_data")

from routers import leads, accounts, contacts, opportunities, services, tickets, interactions, quotes, search, stats

app = FastAPI(title="EliteService CRM API", version="1.0.0")

# CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(leads.router)
app.include_router(accounts.router)
app.include_router(contacts.router)
app.include_router(opportunities.router)
app.include_router(services.router)
app.include_router(tickets.router)
app.include_router(interactions.router)
app.include_router(quotes.router)
app.include_router(search.router)
app.include_router(stats.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to EliteService CRM API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
