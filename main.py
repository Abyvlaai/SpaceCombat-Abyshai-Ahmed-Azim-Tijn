from flask import Flask, render_template # Importeert de Flask-bibliotheek en render_template-functie
import os # Importeert de os-module voor omgevingsvariabelen

app = Flask(__name__) # Maakt een Flask-app-instantie
app.secret_key = os.environ.get("SESSION_SECRET", "default-secret-key")

@app.route('/') # Definieert een route voor het rootpad van de website
def index(): # Definieert de functie die wordt uitgevoerd wanneer het rootpad wordt benaderd
    return render_template('index.html') # Geeft de index.html-sjabloon weer

if __name__ == '__main__': # Checkt of het script runt als main script

    app.run(host='0.0.0.0', port=5000, debug=True)
