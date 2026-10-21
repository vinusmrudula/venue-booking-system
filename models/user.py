from werkzeug.security import check_password_hash, generate_password_hash
from extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    college_email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    # College role, such as 'student', 'faculty', or 'admin'
    role = db.Column(db.String(50), nullable=False, default="student")

    # Foreign key to Department (optional, as some administrative staff may not be tied to an academic dept)
    department_id = db.Column(db.Integer, db.ForeignKey("departments.id"), nullable=True)

    # Relationship to Department
    department = db.relationship("Department", back_populates="users")

    def set_password(self, password: str) -> None:
        """Hashes the plain password securely before saving."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Verifies the input password against the stored hash."""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        """Returns safe user details, intentionally excluding password_hash."""
        return {
            "id": self.id,
            "name": self.name,
            "college_email": self.college_email,
            "role": self.role,
            "department_id": self.department_id,
            "department_name": self.department.name if self.department else None,
        }

    def __repr__(self):
        return f"<User {self.name} ({self.college_email}) - {self.role}>"

