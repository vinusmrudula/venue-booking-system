from extensions import db


class VenueCategory(db.Model):
    __tablename__ = "venue_categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)

    # Relationship to premises
    premises = db.relationship("Premises", back_populates="category", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
        }

    def __repr__(self):
        return f"<VenueCategory {self.name}>"

