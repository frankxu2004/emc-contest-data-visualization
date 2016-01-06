from flask import Flask
from flask import jsonify
import sqlite3
from crossdomain import crossdomain
app = Flask(__name__)

@app.route("/map/<day>/<grade>")
@crossdomain(origin='*')
def mapdatedata(day, grade):
    conn = sqlite3.connect('WifiNet.db')
    c = conn.cursor()
    c.execute('SELECT location, count, requests, bytes FROM locationstats WHERE day=? AND grade=? ORDER BY count DESC LIMIT 15',(day, grade))
    rows = c.fetchall()
    results = {}
    results['map'] = []
    for row in rows:
        c.execute('SELECT longitude, latitude FROM locations WHERE location=?', (row[0],))
        data = c.fetchone()
        if data is not None:
            longitude = data[0]
            latitude = data[1]
        else:
            longitude = None
            latitude = None

        results['map'].append({'location': row[0], 'count': row[1], 'requests': row[2], 'bytes': row[3], 'longitude': longitude, 'latitude': latitude})
    return jsonify(**results)

@app.route("/similar/<user_id>")
@crossdomain(origin='*')
def similardata(user_id):
    conn = sqlite3.connect('WifiNet.db')
    c = conn.cursor()
    c.execute('SELECT similar_id, similarity FROM similaruser WHERE user_id=?',(user_id,))
    rows = c.fetchall()
    results = {}
    c.execute('SELECT services FROM usertop5 WHERE user_id=?', (user_id,))
    data = c.fetchone()
    results['self'] = {'user_id': user_id, 'services': data[0]}
    results['similar'] = []

    for row in rows:
        c.execute('SELECT services FROM usertop5 WHERE user_id=?', (row[0],))
        data = c.fetchone()
        services = data[0]
        results['similar'].append({'similar_id': row[0], 'similarity': row[1],'services': services})
    return jsonify(**results)

@app.route("/score/<user_id>")
@crossdomain(origin='*')
def scoredata(user_id):
    conn = sqlite3.connect('WifiNet.db')
    c = conn.cursor()
    c.execute('SELECT score FROM userscore WHERE user_id=?',(user_id,))
    row = c.fetchone()
    results = {'score': row[0]}
    return jsonify(**results)

if __name__ == "__main__":
    app.run()
