import os
import sys
from urllib.parse import urlparse
from dotenv import load_dotenv

# Ensure UTF-8 output on Windows consoles
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

load_dotenv()

def ensure_mysql_database_exists():
    """
    Connects to MySQL server and creates the database if it doesn't already exist.
    Prevents the '1049 Unknown database' error on first run or during fresh deployments!
    """
    db_url = os.getenv('DATABASE_URL', '')
    if 'mysql' in db_url:
        try:
            import pymysql
            clean_url = db_url.replace('mysql+pymysql://', 'mysql://')
            parsed = urlparse(clean_url)
            
            user = parsed.username or 'root'
            password = parsed.password or ''
            host = parsed.hostname or 'localhost'
            port = parsed.port or 3306
            dbname = (parsed.path or '/venue_booking').lstrip('/')
            if '?' in dbname:
                dbname = dbname.split('?')[0]

            print(f"🔍 Checking MySQL database '{dbname}' on {host}:{port}...")
            conn = pymysql.connect(
                host=host,
                port=port,
                user=user,
                password=password,
                charset='utf8mb4'
            )
            with conn.cursor() as cursor:
                cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{dbname}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
            conn.commit()
            conn.close()
            print(f"✅ MySQL database '{dbname}' is ready!")
        except Exception as e:
            print(f"ℹ️  Note on MySQL init: {e}")

# Ensure DB exists before app context creation
ensure_mysql_database_exists()

from app import create_app, db
from seed import seed_database

app = create_app('development')

def reset_database():
    """
    Drops all database tables, recreates schema, and reseeds with fresh classroom data.
    Very useful when testing or when database schema changes!
    """
    with app.app_context():
        print("⚠️  Resetting database...")
        db.drop_all()
        print("🗑️  All tables dropped.")
        db.create_all()
        print("🏗️  Schema created successfully.")
    
    # Re-seed
    seed_database()
    print("✨ Database has been completely reset and freshly seeded!")

if __name__ == '__main__':
    reset_database()
