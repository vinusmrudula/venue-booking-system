
import { useState } from "react";
import { venues } from "../data/venues.js";

function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  
  const filteredVenues = venues.filter((venue) => {
  
  const normalize = (text) =>
    text.toLowerCase().replace(/\s+/g, "");

  const matchesSearch = normalize(venue.name).includes(
    normalize(searchTerm)
  );

  const matchesBuilding =
    selectedBuilding === "All" ||
    venue.building === selectedBuilding;

  const matchesAvailability =
    availabilityFilter === "All" ||
    (availabilityFilter === "Available" && venue.available) ||
    (availabilityFilter === "Unavailable" && !venue.available);

  return matchesSearch && matchesBuilding && matchesAvailability;
});

  const groupedVenues = filteredVenues.reduce((groups, venue) => {// Build a nested object structure to group venues by building and department
    if (!groups[venue.building]) {
      groups[venue.building] = {};
    }

    if (!groups[venue.building][venue.department]) {
      groups[venue.building][venue.department] = [];
    }

    groups[venue.building][venue.department].push(venue);

    return groups;
  }, {});

  return (
    <main className="results-page">
      <h1>Available Classrooms</h1>
      
      <div className="classroom-filters">
      <input
        type="text"
        placeholder="Search classroom (e.g. NC 27)"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />

      <select
        value={selectedBuilding}
        onChange={(event) => setSelectedBuilding(event.target.value)}
      >
        <option value="All">All Buildings</option>
        <option value="North Campus">North Campus</option>
        <option value="South Campus">South Campus</option>
      </select>

      <select
        value={availabilityFilter}
        onChange={(event) => setAvailabilityFilter(event.target.value)}
      >
        <option value="All">All Classrooms</option>
        <option value="Available">Available Only</option>
        <option value="Unavailable">Unavailable Only</option>
      </select>
      </div>

      <p className="page-description">
        Browse classrooms by building and department.
      </p>

      {Object.entries(groupedVenues).map(([building, departments]) => (
        <section className="building-section" key={building}>
          <h2 className="building-heading">{building}</h2>

          {Object.entries(departments).map(([department, departmentVenues]) => (
            <div key={department}>
              <h3 className="department-heading">{department}</h3>

              {departmentVenues.map((venue) => (
                <article className="classroom-result" key={venue.id}>
                  <header className="classroom-header">
                    <h4>
                      {venue.name} — Classroom
                    </h4>

                    <span
                      className={
                        venue.available
                          ? "availability available"
                          : "availability unavailable"
                      }
                    >
                      {venue.available ? "Available" : "Unavailable"}
                    </span>
                  </header>

                  <div className="classroom-content">
                    <p className="classroom-summary">
                      <strong>Building:</strong> {venue.building}
                      <span className="separator">|</span>
                      <strong>Capacity:</strong> {venue.capacity} students
                    </p>

                    <div className="classroom-details">
                      <div className="detail-box">
                        <strong>Department</strong>
                        <span>{venue.department}</span>
                      </div>

                      <div className="detail-box">
                        <strong>Room type</strong>
                        <span>Classroom</span>
                      </div>
                    </div>

                    <div className="classroom-actions">
                      <button
                        type="button"
                        disabled={!venue.available}
                        onClick={() => {
                          window.location.href = `/venues/${venue.id}`;
                        }}
                      >
                        Book Now
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => {
                          window.location.href = `/venues/${venue.id}`;
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}

export default HomePage;
