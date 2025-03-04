import os
from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")

# Configure the SQLite database
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///game.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize the app with the extension
db.init_app(app)

# Import models after db initialization
from models import HighScore

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/highscores/<int:level>')
def get_highscores(level):
    scores = HighScore.query.filter_by(level=level).order_by(HighScore.score.desc()).limit(5).all()
    return jsonify([{
        'player_name': score.player_name,
        'score': score.score,
        'level': score.level
    } for score in scores])

@app.route('/api/save_score', methods=['POST'])
def save_score():
    data = request.get_json()
    new_score = HighScore(
        player_name=data['player_name'],
        score=data['score'],
        level=data['level']
    )
    db.session.add(new_score)
    db.session.commit()
    return jsonify({'success': True})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)