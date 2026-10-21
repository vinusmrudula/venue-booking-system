from extensions import db


class Premises(db.Model):
    __tablename__ = "premises"

    id = db.Column(db.Integer, primary_key=True)
    # Name of the physical building or complex (e.g., 'Academic Complex', 'New CSE')
    name = db.Column(db.String(100), unique=True, nullable=False)

    # Authority who receives booking emails for this building/premises
    authority_name = db.Column(db.String(100), nullable=False)
    authority_email = db.Column(db.String(120), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "authority_name": self.authority_name,
            "authority_email": self.authority_email,
        }

    def __repr__(self):
        return f"<Premises {self.name}>"
