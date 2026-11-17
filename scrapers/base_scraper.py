import os
import json
import hashlib
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

_supabase_url = os.environ.get("SUPABASE_URL")
_supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = None
if _supabase_url and _supabase_key:
    try:
        supabase = create_client(_supabase_url, _supabase_key)
    except Exception as e:
        print(f"[BASE_SCRAPER] Supabase initialization skipped: {e}")


def compute_hash(data: dict) -> str:
    stringified = json.dumps(data, sort_keys=True)
    return hashlib.sha256(stringified.encode('utf-8')).hexdigest()

def insert_into_bronze(source_url: str, raw_content: dict):
    content_hash = compute_hash(raw_content)
    try:
        supabase.table("schemes_raw").insert({
            "scraped_at": datetime.utcnow().isoformat(),
            "source_url": source_url,
            "raw_content": raw_content,
            "content_hash": content_hash
        }).execute()
        print(f"Inserted bronze record for {source_url}")
    except Exception as e:
        print(f"Error inserting to bronze: {e}")
