#!/usr/bin/env python3

print("Testing Flask app...")

try:
    import flask
    print(f"✅ Flask imported successfully - Version: {flask.__version__}")
except ImportError as e:
    print(f"❌ Flask import failed: {e}")

try:
    from flask import Flask
    app = Flask(__name__)
    
    @app.route('/')
    def hello():
        return "<h1>Hello World!</h1><p>Flask is working!</p>"
    
    print("✅ Flask app created successfully")
    print("Starting server on http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=True)
    
except Exception as e:
    print(f"❌ Error creating Flask app: {e}")
