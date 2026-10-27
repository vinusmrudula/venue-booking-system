from app.models import db

class Department(db.Model):
    """
    Department model (e.g. Civil Engineering, Computer New Building, etc.)
    """
    __tablename__ = 'departments'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), unique=True, nullable=False, index=True)
    code = db.Column(db.String(20), nullable=True)

    # Relationships
    venues = db.relationship('Venue', backref='department', lazy=True)
    authorities = db.relationship('Authority', backref='department', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'venue_count': len(self.venues) if self.venues else 0
        }

    def __repr__(self):
        return f'<Department {self.name}>'


class Authority(db.Model):
    """
    Authority model for venue approval (e.g., HOD with their official email)
    """
    __tablename__ = 'authorities'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False, index=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=True)

    # Relationship
    venues = db.relationship('Venue', backref='authority', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'department_id': self.department_id,
            'department_name': self.department.name if self.department else None
        }

    def __repr__(self):
        return f'<Authority {self.name} ({self.email})>'


class Venue(db.Model):
    """
    Venue / Premises model (Classroom, Seminar Hall, Auditorium, Lab / Facility)
    """
    __tablename__ = 'venues'

    # 4 Standard Venue Categories
    CATEGORIES = ['Classroom', 'Seminar Hall', 'Auditorium', 'Lab / Facility']

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, index=True) # e.g. SC06, NC01
    category = db.Column(db.String(50), nullable=False, default='Classroom')
    benches = db.Column(db.Integer, default=0)
    capacity = db.Column(db.Integer, default=0) # Typically benches * 2
    
    # Foreign Keys
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    authority_id = db.Column(db.Integer, db.ForeignKey('authorities.id'), nullable=True)

    # Relationship to bookings
    bookings = db.relationship('Booking', backref='venue', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        """Convert venue to JSON-friendly dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'benches': self.benches,
            'capacity': self.capacity,
            'department_id': self.department_id,
            'department_name': self.department.name if self.department else None,
            'department_code': self.department.code if self.department else None,
            'authority_id': self.authority_id,
            'authority_name': self.authority.name if self.authority else None,
            'authority_email': self.authority.email if self.authority else None
        }

    def __repr__(self):
        return f'<Venue {self.name} ({self.category}) - Dept: {self.department_id}>'

