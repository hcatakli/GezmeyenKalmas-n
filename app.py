from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import sqlite3
import random
from datetime import datetime

app = Flask(__name__)
app.secret_key = "hafisa_53"

def get_db_connection():
    conn = sqlite3.connect('file:users.db?mode=rw', uri=True)

    conn.row_factory = sqlite3.Row     # Veritabanı dosyasının adı
    return conn

@app.route('/')
def main():
    conn = get_db_connection()

    # Rastgele gezilecek yerleri çek
    places = conn.execute('SELECT * FROM places').fetchall()
    random_places = random.sample(places, 3)  # 3 rastgele yer seç

    # Ülke ve şehir bilgilerini çek
    countries = conn.execute('SELECT * FROM country').fetchall()
    cities = conn.execute('SELECT * FROM city').fetchall()

    conn.close()
    
    # Verileri 'index.html' şablonuna gönder
    return render_template('main.html', places=random_places, countries=countries, cities=cities)



@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        conn=get_db_connection()
        cursor=conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = ? AND password =?",(username,password))
        user=cursor.fetchone()
        
        if user:
            session['username'] = username
            conn.close()
            return redirect(url_for('home'))
        else:
            conn.close()
            return render_template("login.html", error="Kullanıcı adı veya şifre hatalı!")
    return render_template("login.html")

@app.route("/home")
def home():
    conn = get_db_connection()  # Veritabanına bağlan
    places = conn.execute('SELECT * FROM places').fetchall()  # Veritabanından tüm yerleri al
    conn.close()

    # Rastgele 3 yer seçme
    random_places = random.sample(places, 3)
    return render_template('home.html', places=random_places)


@app.route("/profile")
def profile():
    return render_template("profile.html")




@app.route('/get_profile_data')
def get_profile_data():
    if 'username' not in session:
        return redirect(url_for('login', user_id=1))
    
    conn = get_db_connection()
    user_data = conn.execute("SELECT * FROM users WHERE username = ?", (session['username'],)).fetchone()
    conn.close()


    return render_template("bilgi.html", users=user_data)



@app.route('/get_hedef')
def get_hedef():
    
    conn = get_db_connection()
    tasks = conn.execute('SELECT * FROM hedefler').fetchall()  # Tüm görevleri al
    conn.close()
    return render_template("gezilecekyerler.html", tasks=tasks)


#Gezmeyi planladığı yerleri getiren API
# @app.route('/get_cities')
# def get_future_places():
#     if 'username' not in session:
#         return jsonify({'error': 'Unauthorized'}), 401

#     conn = get_db_connection()
    
#     cities = conn.execute('SELECT * FROM city JOIN country ON city.country_ID=country.country_ID').fetchall()

#     conn.close()

#     return jsonify([dict(place) for place in cities])

# @app.route('/create_plan', methods=['POST'])
# def create_plan():
#     data = request.get_json()
#     country_id = data['country_id']
#     city_id = data['city_id']
    
#     conn = get_db_connection()
#     conn.execute('INSERT INTO places_to_visit (country_id, city_id) VALUES (?, ?)', (country_id, city_id))
#     conn.commit()
#     conn.close()
    
#     return jsonify({'success': True})

@app.route('/add_task', methods=['POST'])
def add_task():
    task = request.form['task']  # Formdan gelen görev adını al
    conn = get_db_connection()
    conn.execute('INSERT INTO hedefler (hedef) VALUES (?)', (task,))
    conn.commit()
    conn.close()
    conn = get_db_connection()
    tasks = conn.execute('SELECT * FROM hedefler').fetchall()  # Tüm görevleri al
    conn.close()
    return render_template('gezilecekyerler.html', tasks=tasks)




@app.route('/save_task', methods=['POST'])
def save_task():
    data = request.get_json()
    task_id = data.get('id')

    conn = get_db_connection()
    # Seçilen görevin adını alın
    task = conn.execute('SELECT hedef FROM hedefler WHERE hedef_ID = ?', (task_id,)).fetchone()

    if task:
        # Seçilen görevi başka bir tabloya kaydedin
        conn.execute('INSERT INTO gorevler (gorev) VALUES (?)', (task['hedef'],))
        conn.execute('DELETE FROM hedefler WHERE hedef_ID = ?', (task_id,))
        conn.commit()
        conn.close()
        return jsonify(success=True)
    
    conn.close()
    return jsonify(success=False), 400

@app.route('/completed_tasks')
def completed_tasks():
    conn = get_db_connection()
    # 'completed_tasks' tablosundaki tüm görevleri al
    completed = conn.execute('SELECT * FROM gorevler').fetchall()
    conn.close()
    return render_template('gezilenyerler.html', tasks=completed)

@app.route('/forum')
def forum():
    return render_template('forum.html')

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect('/')



@app.route('/geziplan')
def geziplan():
    conn = get_db_connection()
    countries = conn.execute('SELECT * FROM country').fetchall()
    cities = conn.execute('SELECT * FROM city').fetchall()

    return render_template('geziplan.html',countries=countries, cities=cities)



if __name__ == "__main__":
    app.run(debug=True)
