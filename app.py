import os
from dotenv import load_dotenv
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from sqlalchemy.orm import DeclarativeBase

# Cargar variables de entorno al inicio
load_dotenv()

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
# create the app
app = Flask(__name__)
# setup a secret key, required by sessions
# app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "a secret key"
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "a secret key")
# configure the database
database_url = os.getenv("DATABASE_URL")
if not database_url:
    database_url = "sqlite:///site.db"
    print("Warning: DATABASE_URL not found in environment, using SQLite")
# configure the database, relative to the app instance folder
app.config["SQLALCHEMY_DATABASE_URI"] = database_url
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
# initialize the app with the extension, flask-sqlalchemy >= 3.0.x
db.init_app(app)

# Setup Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(id):
    from models import User
    return User.query.get(int(id))

with app.app_context():
    # Make sure to import the models here or their tables won't be created
    import models  # noqa: F401
    db.create_all()

# Import routes after db initialization to avoid circular imports
import routes  # noqa: F401
