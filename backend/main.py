import sqlite3 as sq3
from fastapi import FastAPI
from backend.db import get_connection

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/catfacts")
def get_cat_facts():
    with get_connection() as conn: 
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM cat_facts")
        rows = cursor.fetchall()

    facts = [dict(row) for row in rows]

    return facts