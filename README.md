# ArgentinaCarpooling

A web-based carpooling platform designed specifically for Argentina, helping connect drivers and passengers for shared rides across the country.

## Features

- User Authentication (Register/Login)
- Interactive Trip Search with Map Integration
- City Autocomplete using Nominatim API
- Trip Creation and Management
- Booking System
- User Profiles
- Real-time Seat Availability
- Location-based Search
- Responsive Design

## Tech Stack

- Backend: Python/Flask
- Database: PostgreSQL
- Frontend: Bootstrap 5 + Vanilla JavaScript
- Maps: Leaflet.js with OpenStreetMap

## Prerequisites

- Python 3.11 or higher
- PostgreSQL database
- Git (for version control)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/argentina-carpooling.git
cd argentina-carpooling
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
# Required environment variables
FLASK_SECRET_KEY=your_secret_key
DATABASE_URL=postgresql://username:password@host:port/dbname

# PostgreSQL configuration (if not using DATABASE_URL)
PGHOST=your_db_host
PGDATABASE=your_db_name
PGUSER=your_db_user
PGPASSWORD=your_db_password
PGPORT=your_db_port
```

## Local Development

1. Create and set up the database:
```bash
# The application will automatically create tables when started
python main.py
```

2. Start the development server:
```bash
python main.py
```

3. Access the application:
Open your web browser and navigate to `http://localhost:5000`

## Usage

1. Register for a new account or login with existing credentials
2. To find a ride:
   - Enter your origin and destination cities
   - Select travel date and number of passengers
   - Click on the map to refine locations
   - Use the autocomplete suggestions for city names
   - Click "Search Trips" to view available rides

3. To offer a ride:
   - Click "Create Trip" in the navigation menu
   - Fill in the trip details including route, date, available seats, and price
   - Use the map to specify exact pickup and drop-off locations
   - Submit the form to create your trip

4. Managing your trips:
   - Visit your profile to view your created trips and bookings
   - Monitor booking requests and seat availability
   - Track your upcoming and past trips

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to your branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
