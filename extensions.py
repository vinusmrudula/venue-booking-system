from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail

try:
    from flask_cors import CORS
    cors = CORS()
except ImportError:
    cors = None

# Instantiate the SQLAlchemy extension without binding it to a specific app.
# This prevents circular imports when models import `db`.
db = SQLAlchemy()
mail = Mail()
