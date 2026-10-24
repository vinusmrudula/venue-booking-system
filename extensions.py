from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail

# Instantiate the SQLAlchemy extension without binding it to a specific app.
# This prevents circular imports when models import `db`.
db = SQLAlchemy()
mail = Mail()
