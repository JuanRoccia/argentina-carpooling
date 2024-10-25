from flask import render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from app import app, db
from models import User, Trip, Booking
from forms import LoginForm, RegisterForm, TripForm, BookingForm
from datetime import datetime

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    form = RegisterForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user:
            flash('Email already registered', 'danger')
            return redirect(url_for('register'))
        
        user = User(
            username=form.username.data,
            email=form.email.data,
            password_hash=generate_password_hash(form.password.data)
        )
        db.session.add(user)
        db.session.commit()
        flash('Registration successful!', 'success')
        return redirect(url_for('login'))
    
    return render_template('auth/register.html', form=form)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and check_password_hash(user.password_hash, form.password.data):
            login_user(user)
            return redirect(url_for('index'))
        flash('Invalid email or password', 'danger')
    
    return render_template('auth/login.html', form=form)

@app.route('/trips/new', methods=['GET', 'POST'])
@login_required
def create_trip():
    form = TripForm()
    if form.validate_on_submit():
        trip = Trip(
            driver_id=current_user.id,
            origin=form.origin.data,
            destination=form.destination.data,
            origin_lat=form.origin_lat.data,
            origin_lon=form.origin_lon.data,
            dest_lat=form.dest_lat.data,
            dest_lon=form.dest_lon.data,
            departure_date=form.departure_date.data,
            seats_available=form.seats_available.data,
            price=form.price.data
        )
        db.session.add(trip)
        db.session.commit()
        flash('Trip created successfully!', 'success')
        return redirect(url_for('trips'))
    
    return render_template('trips/create.html', form=form)

@app.route('/trips')
def trips():
    page = request.args.get('page', 1, type=int)
    query = Trip.query.filter(Trip.departure_date >= datetime.utcnow())

    # Apply search filters if provided
    origin = request.args.get('origin')
    destination = request.args.get('destination')
    date_str = request.args.get('date')

    if origin:
        query = query.filter(Trip.origin.ilike(f'%{origin}%'))
    if destination:
        query = query.filter(Trip.destination.ilike(f'%{destination}%'))
    if date_str:
        try:
            search_date = datetime.strptime(date_str, '%Y-%m-%d')
            query = query.filter(
                db.func.date(Trip.departure_date) == search_date.date()
            )
        except ValueError:
            pass

    trips = query.order_by(Trip.departure_date).paginate(page=page, per_page=10)
    return render_template('trips/list.html', trips=trips)

@app.route('/trips/<int:trip_id>', methods=['GET', 'POST'])
@login_required
def trip_detail(trip_id):
    trip = Trip.query.get_or_404(trip_id)
    form = BookingForm()
    
    if form.validate_on_submit():
        if trip.seats_available < form.seats.data:
            flash('Not enough seats available', 'danger')
            return redirect(url_for('trip_detail', trip_id=trip.id))
            
        booking = Booking(
            trip_id=trip.id,
            passenger_id=current_user.id,
            seats=form.seats.data
        )
        db.session.add(booking)
        trip.seats_available -= form.seats.data
        db.session.commit()
        flash('Booking request sent!', 'success')
        return redirect(url_for('trips'))
        
    return render_template('trips/detail.html', trip=trip, form=form)

@app.route('/profile')
@login_required
def profile():
    return render_template('profile.html', 
                         trips_created=current_user.trips_created,
                         bookings=current_user.bookings)

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('index'))
