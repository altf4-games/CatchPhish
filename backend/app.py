from flask import Flask, render_template, request, redirect, url_for, session
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
import datetime

app = Flask(__name__)
app.secret_key = 'your_secret_key'

# Connect to local MongoDB
app.config["MONGO_URI"] = "mongodb+srv://pradyum_m:RXhlFA6MVx1i1yCl@cluster0.ej8bk.mongodb.net/"
mongo = PyMongo(app)

bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = "login"

# User Model for Authentication
class User(UserMixin):
    def __init__(self, user_id):
        self.id = user_id

@login_manager.user_loader
def load_user(user_id):
    return User(user_id) if mongo.db.users.find_one({"_id": user_id}) else None

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        password = bcrypt.generate_password_hash(request.form["password"]).decode("utf-8")
        
        existing_user = mongo.db.users.find_one({"username": username})
        if existing_user:
            return "Username already exists!"

        mongo.db.users.insert_one({"username": username, "password": password})
        return redirect(url_for("login"))
    
    return render_template("register.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        user = mongo.db.users.find_one({"username": username})

        if user and bcrypt.check_password_hash(user["password"], password):
            login_user(User(user["_id"]))
            return redirect(url_for("dashboard"))

    return render_template("login.html")

@app.route("/dashboard")
@login_required
def dashboard():
    phishing_logs = list(mongo.db.phishing_logs.find({"user_id": current_user.id}))
    return render_template("dashboard.html", logs=phishing_logs)

@app.route("/log_url", methods=["POST"])
@login_required
def log_url():
    url = request.form["url"]
    confidence_score = 80  # Assume detection logic is applied
    status = "Phishing" if confidence_score > 70 else "Safe"

    log_entry = {
        "user_id": current_user.id,
        "url": url,
        "confidence_score": confidence_score,
        "status": status,
        "date_logged": datetime.datetime.utcnow()
    }

    mongo.db.phishing_logs.insert_one(log_entry)
    return redirect(url_for("dashboard"))

if __name__ == "__main__":
    app.run(debug=True)
