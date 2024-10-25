from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, DateTimeField, FloatField, IntegerField
from wtforms.validators import DataRequired, Email, Length, NumberRange

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])

class RegisterForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=64)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])

class TripForm(FlaskForm):
    origin = StringField('Origin', validators=[DataRequired()])
    destination = StringField('Destination', validators=[DataRequired()])
    origin_lat = FloatField('Origin Latitude', validators=[DataRequired()])
    origin_lon = FloatField('Origin Longitude', validators=[DataRequired()])
    dest_lat = FloatField('Destination Latitude', validators=[DataRequired()])
    dest_lon = FloatField('Destination Longitude', validators=[DataRequired()])
    departure_date = DateTimeField('Departure Date', validators=[DataRequired()], format='%Y-%m-%dT%H:%M')
    seats_available = IntegerField('Available Seats', validators=[DataRequired(), NumberRange(min=1, max=8)])
    price = FloatField('Price per Seat', validators=[DataRequired(), NumberRange(min=0)])

class BookingForm(FlaskForm):
    seats = IntegerField('Number of Seats', validators=[DataRequired(), NumberRange(min=1, max=8)])

class SearchForm(FlaskForm):
    origin = StringField('Origin')
    destination = StringField('Destination')
    date = DateTimeField('Date', format='%Y-%m-%d', validators=[DataRequired()])
    passengers = IntegerField('Passengers', validators=[NumberRange(min=1, max=8)], default=1)
