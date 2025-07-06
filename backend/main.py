import sqlite3 as sq3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import get_connection
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can limit this to http://localhost:3000 if preferred
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CatFact(BaseModel):
    fact: str

# Test route
@app.get("/")
def read_root():
    return {"Hello": "World"}

# GET all cat facts from the database
@app.get("/catfacts")
def get_cat_facts(page: int = 1, limit: int = 5):
    offset = (page - 1) * limit

    with get_connection() as conn: 
        cursor = conn.cursor()
        if limit > 0:
            cursor.execute("SELECT * FROM cat_facts ORDER BY id LIMIT ? OFFSET ?", (limit, offset))
        else:
            # If the limit is set to 0, return *all* facts
            cursor.execute("SELECT * FROM cat_facts ORDER BY id")
        rows = cursor.fetchall()

    facts = [dict(row) for row in rows]
    print(facts)
    return facts

# GET the total number of cat facts
@app.get('/catfacts/count')
def get_cat_facts_count():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM cat_facts")
        count = cursor.fetchone()[0]
    return {"count": count}

# GET a random cat fact from the database
@app.get('/catfacts/random')
def get_random_cat_fact():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM cat_facts ORDER BY RANDOM() LIMIT 1")
        row = cursor.fetchone()

    return dict(row) if row else {"error": "No cat facts found"}

# POST a new cat fact to the database
@app.post('/catfacts')
def post_cat_fact(cat_fact: CatFact):
    with get_connection() as conn:
        cursor = conn.cursor()

        if len(cat_fact.fact) > 0:
            cursor.execute("INSERT OR IGNORE INTO cat_facts (fact) VALUES (?)", (cat_fact.fact,))
            if cursor.rowcount > 0:
                print(f"Inserted: {cat_fact.fact}")
            else:
                print(f"Ignored (duplicate fact): {cat_fact.fact}")
                return {"message": "Fact already exists, not added"}
        else:
            print("Ignored (empty fact)")
            return {"message": "Empty fact, not added"}
        
        conn.commit()

    return {"message": "Cat fact added successfully"}

# DELETE a cat fact by ID
@app.delete('/catfacts/{fact_id}')
def delete_cat_fact(fact_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM cat_facts WHERE id = ?", (fact_id,))
        if cursor.rowcount > 0:
            print(f"Deleted cat fact with ID: {fact_id}")
            conn.commit()
            return {"message": "Cat fact deleted successfully"}
        else:
            print(f"Cat fact with ID {fact_id} not found")
            conn.commit()
            return {"message": "Cat fact not found"}