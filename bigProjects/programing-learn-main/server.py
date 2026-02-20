from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

users = []

@app.route('/web/<path:filename>')
def serve_static(filename):
    return send_from_directory('web', filename)

@app.route("/register", methods=["POST"])
def register():
    first_name = request.form.get("first_name")
    last_name = request.form.get("last_name")
    email = request.form.get("email")
    password = request.form.get("password")

    print("Received:", first_name, last_name, email)

    if not (first_name and last_name and email and password):
        return jsonify({"success": False, "message": "All fields required"})

    for user in users:
        if user["email"] == email:
            return jsonify({"success": False, "message": "Email already exists"})

    users.append({
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "password": password
    })

    return jsonify({"success": True})

if __name__ == "__main__":
    app.run(debug=True)


@app.route("/login", methods=["POST"])
def login():
    email = request.form.get("email")
    password = request.form.get("password")

    if not (email and password):
        return jsonify({"success": False, "message": "Email and password required"})

    for user in users:
        if user["email"] == email and user["password"] == password:
            return jsonify({"success": True})

    return jsonify({"success": False, "message": "Invalid email or password"})