import enum
from extensions import db


class VenueCategory(str, enum.Enum):
    CLASSROOM = "classroom"
    SEMINAR_HALL = "seminar_hall"
    AUDITORIUM = "auditorium"
    LAB = "lab"


class Venue(db.Model):
    __tablename__ = "venues"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

    # Category restricted to the four allowed values
    category = db.Column(
        db.Enum(VenueCategory, values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
    )

    capacity = db.Column(db.Integer, nullable=False, default=0)

    # Required foreign key to Premises (every venue is inside a physical building/premises)
    premises_id = db.Column(db.Integer, db.ForeignKey("premises.id"), nullable=False)

    # Optional foreign key to Department (null for college-wide venues like auditoriums)
    department_id = db.Column(db.Integer, db.ForeignKey("departments.id"), nullable=True)

    # Relationships using modern explicit back_populates
    premises = db.relationship("Premises", back_populates="venues")
    department = db.relationship("Department", back_populates="venues")

    def to_dict(self):
        category_value = self.category.value if isinstance(self.category, VenueCategory) else self.category
        return {
            "id": self.id,
            "name": self.name,
            "category": category_value,
            "capacity": self.capacity,
            "premises_id": self.premises_id,
            "premises_name": self.premises.name if self.premises else None,
            "department_id": self.department_id,
            "department_name": self.department.name if self.department else None,
        }

    def __repr__(self):
        return f"<Venue {self.name} ({self.category})>"

