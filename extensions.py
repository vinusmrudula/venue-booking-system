from flask_sqlalchemy import SQLAlchemy

# Instantiate the SQLAlchemy extension without binding it to a specific app.
# This prevents circular imports when models import `db`.
db = SQLAlchemy()

