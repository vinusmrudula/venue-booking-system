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
    Venue / Premises model (Classroom, Seminar Hall, Auditorium, Lab / Facility).
    Note: Database stores only benches count. Seating capacity is dynamically
    computed as total = (2 * benches).
    """
    __tablename__ = 'venues'

    # 4 Standard Venue Categories
    CATEGORIES = ['Classroom', 'Seminar Hall', 'Auditorium', 'Lab / Facility']

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, index=True) # e.g. SC06, NC01
    category = db.Column(db.String(50), nullable=False, default='Classroom')
    benches = db.Column(db.Integer, default=0) # Only benches stored in database!
    
    # Foreign Keys
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    authority_id = db.Column(db.Integer, db.ForeignKey('authorities.id'), nullable=True)

    # Relationship to bookings
    bookings = db.relationship('Booking', backref='venue', lazy=True, cascade='all, delete-orphan')

    def __init__(self, **kwargs):
        # Database keeps only benches. If capacity is passed, safely derive benches if not provided
        if 'capacity' in kwargs:
            cap = kwargs.pop('capacity')
            if 'benches' not in kwargs and cap:
                kwargs['benches'] = cap // 2
        super().__init__(**kwargs)

    @property
    def capacity(self):
        """Computed total capacity = (2 * benches). 2 students per bench standard."""
        return (self.benches or 0) * 2

    def to_dict(self):
        """Convert venue to JSON-friendly dictionary with capacity formula."""
        benches_val = self.benches or 0
        total_cap = self.capacity
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'benches': benches_val,
            'capacity': total_cap,
            'capacity_formula': "total = (2 * benches)",
            'capacity_calculation': f"total = (2 * {benches_val})",
            'capacity_display': f"Capacity: total = (2 * {benches_val} benches) = {total_cap} Seats",
            'department_id': self.department_id,
            'department_name': self.department.name if self.department else None,
            'department_code': self.department.code if self.department else None,
            'authority_id': self.authority_id,
            'authority_name': self.authority.name if self.authority else None,
            'authority_email': self.authority.email if self.authority else None
        }

    def __repr__(self):
        return f'<Venue {self.name} ({self.category}) - Benches: {self.benches}, Total Capacity: {self.capacity}>'

