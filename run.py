import os
import sys

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from app import create_app, db
from app.models import Venue

app = create_app(os.getenv('FLASK_ENV', 'development'))

if __name__ == '__main__':
    with app.app_context():
        try:
            db.create_all()
            if Venue.query.count() == 0:
                from seed import seed_database
                seed_database()
        except Exception as e:
            print(f"ℹ️  Database startup notice: {e}")

    port = int(os.getenv('PORT', 5000))
    debug_mode = os.getenv('FLASK_DEBUG', 'false').lower() in ('true', '1', 'yes')
    print(f"[*] Venue Booking Backend running at: http://127.0.0.1:{port}")
    print(f"[*] Frontend Web App available at: http://127.0.0.1:{port}/")
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
