import os
from app import create_app, db
from app.models import Venue

# Production WSGI application object for Render, Railway, or Gunicorn
app = create_app(os.getenv('FLASK_ENV', 'production'))

with app.app_context():
    try:
        db.create_all()
        # Auto-seed initial venue data on fresh deployment if database is empty
        if Venue.query.count() == 0:
            from seed import seed_database
            seed_database()
            app.logger.info("Database initialized and seeded on first startup.")
    except Exception as e:
        app.logger.warning(f"Note on startup database initialization: {e}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
