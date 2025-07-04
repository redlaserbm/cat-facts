import sqlite3 as sq3
from import_cat_facts import fetch_cat_facts

DB_PATH = "cat_facts.db"

def get_connection():
    conn = sq3.connect(DB_PATH)
    conn.row_factory = sq3.Row
    return conn

def seed_db():
    with get_connection() as conn:
        cursor = conn.cursor()

        cursor.execute('''
        DROP TABLE IF EXISTS cat_facts
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS cat_facts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fact TEXT NOT NULL UNIQUE,
            created_at DATE DEFAULT (DATE('now'))
        )
                    ''')

        # Prepopulate the database with some cat facts to get started
        fetch_cat_facts(conn)

        conn.commit()

seed_db()