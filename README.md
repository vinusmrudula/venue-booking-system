
# Venue Booking System

## Overview

A platform for simplifying the booking of college venues, including classrooms, seminar halls, and auditoriums.

## Core Features

- View available college venues.
- Check venue availability for a selected date and time.
- Create and manage reservations.
- Prevent conflicting bookings.
- View booking details and reservation status.

## Project Status

Initial setup and planning.

## Technology Stack

To be finalized after High-Level Design (HLD) and Low-Level Design (LLD).

## Setup Instructions

Setup instructions will be added after the technology stack is finalized.

## Team

Add team member names and responsibilities here.

## Development Workflow

- Develop features on separate branches.
- Use descriptive commits following `type: description`.
- Open pull requests for review.
- Merge reviewed pull requests into `main`.
## Flask Backend Setup

### Prerequisites
- Python installed
- Git installed

### Run the Backend Locally

1. Activate the Python virtual environment:

   ```cmd
   .venv\Scripts\activate.bat
   ```

2. Install the required dependencies:

   ```cmd
   python -m pip install -r requirements.txt
   ```

3. Start the Flask server:

   ```cmd
   python app.py
   ```

4. Open `http://127.0.0.1:5000/` in your browser.

### Current Backend Status
The Flask backend currently provides a basic API health-check endpoint. Venue availability, booking management, approval workflows, and automated email notifications will be implemented in subsequent development steps.

### Email Configuration
Email settings will be configured using environment variables. Keep credentials in a local `.env` file and never commit real credentials to GitHub.