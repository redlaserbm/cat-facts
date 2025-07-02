import requests 
import json
import sqlite3 as sq3

# Fetch 5 cat facts from the API
def fetch_cat_facts(connection): 
    res = requests.get('https://catfact.ninja/facts?limit=5')
    res = res.json()
    facts = res['data']

    with connection: 
        cursor = connection.cursor()

        for fact_object in facts:
            fact = fact_object['fact']
            cursor.execute('''
                INSERT OR IGNORE INTO cat_facts (fact) VALUES (?)
                ''', (fact,))
            
            if cursor.rowcount == 1:
                print(f"Inserted: {fact}")
            else:
                print(f"Ignored (duplicate): {fact}")
            
        connection.commit()