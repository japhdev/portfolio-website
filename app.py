from flask import Flask, render_template, request, jsonify, g
from flask_mail import Mail, Message
import sqlite3
import json
from datetime import datetime
import os
import traceback
import re
from dotenv import load_dotenv
import uuid
from werkzeug.utils import secure_filename

# Load environment variables
load_dotenv()

# Required environment variables verification
required_env_vars = ['GMAIL_USER', 'GMAIL_APP_PASSWORD']
missing_vars = [var for var in required_env_vars if not os.getenv(var)]
if missing_vars:
    raise RuntimeError(f"Missing required environment variables: {', '.join(missing_vars)}")

app = Flask(__name__)

# Flask-Mail configuration for Gmail
app.config.update(
    MAIL_SERVER='smtp.gmail.com',
    MAIL_PORT=587,
    MAIL_USE_TLS=True,
    MAIL_USERNAME=os.getenv('GMAIL_USER'),
    MAIL_PASSWORD=os.getenv('GMAIL_APP_PASSWORD'),
    MAIL_DEFAULT_SENDER=os.getenv('GMAIL_USER'),
    MAIL_DEBUG=False,
    SECRET_KEY=os.getenv('FLASK_SECRET_KEY', 'dev-key-for-development-environment'),
)

mail = Mail(app)

# Database configuration
DATABASE = 'messages.db'

# Configuration for file uploads
UPLOAD_FOLDER = 'static/images/projects'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# Create upload folder if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db

def init_db():
    with app.app_context():
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='messages';")
        if not cursor.fetchone():
            cursor.execute('''
                CREATE TABLE messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    message TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            db.commit()
            print("✅ Database created successfully!")

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.route('/test-smtp')
def test_smtp():
    try:
        with mail.connect() as conn:
            return "✅ SMTP connection successful with Gmail"
    except Exception as e:
        return f"❌ SMTP connection error: {str(e)}", 500

# Create backup directory if it doesn't exist
if not os.path.exists('message_backups'):
    os.makedirs('message_backups')

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/certificados")
def certificados():
    return render_template("certificados.html")

def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

@app.route('/enviar-formulario', methods=['POST'])
def handle_form():
    try:
        data = request.form
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        message = data.get('message', '').strip()
        
        # Validations
        if not all([name, email, message]):
            return jsonify({'success': False, 'message': 'All fields are required'}), 400
            
        if not is_valid_email(email):
            return jsonify({'success': False, 'message': 'Please enter a valid email address'}), 400
        
        # Database operation
        try:
            db = get_db()
            cursor = db.cursor()
            cursor.execute(
                'INSERT INTO messages (name, email, message) VALUES (?, ?, ?)',
                (name, email, message)
            )
            db.commit()
        except sqlite3.Error as db_error:
            print(f"❌ Database error: {db_error}")
            traceback.print_exc()
            return jsonify({'success': False, 'message': 'Error saving message'}), 500
        finally:
            if 'db' in locals():
                db.close()
        
        # Email sending
        try:
            msg = Message(
                subject=f"New contact message from {name}",
                recipients=[os.getenv('GMAIL_USER')],
                reply_to=email,
                body=f"""You have received a new message through your portfolio:

Name: {name}
Email: {email}
Date: {datetime.now().strftime('%d/%m/%Y at %H:%M')}

Message:
{message}

---
This message was sent automatically."""
            )
            mail.send(msg)
            print("✅ Email sent successfully")
        except Exception as mail_error:
            print(f"❌ Error sending email: {str(mail_error)}")
            traceback.print_exc()
        
        # JSON backup
        try:
            message_data = {
                'name': name,
                'email': email,
                'message': message,
                'timestamp': datetime.now().isoformat()
            }
            
            today = datetime.now().strftime('%Y-%m-%d')
            backup_file = f'message_backups/messages_{today}.json'
            
            with open(backup_file, 'a') as f:
                f.write(json.dumps(message_data) + '\n')
        except IOError as io_error:
            print(f"⚠️ Backup save error: {io_error}")
        
        return jsonify({
            'success': True,
            'message': 'Your message has been sent successfully. Thank you for contacting me!'
        })
    
    except Exception as e:
        print(f"❌ Error processing form: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': 'An error occurred while processing your message. Please try again later.'
        }), 500

# =============================================
# PROJECTS ADMIN ROUTES
# =============================================

@app.route('/admin/save-projects', methods=['POST'])
def save_projects():
    """Save projects data to JSON file"""
    try:
        data = request.json
        
        # Validate data structure
        if 'projects' not in data:
            return jsonify({'success': False, 'error': 'Invalid data structure'}), 400
        
        # Save to JSON file
        with open('static/data/projects.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print("✅ Projects saved successfully")
        return jsonify({'success': True, 'message': 'Projects saved successfully'})
    
    except Exception as e:
        print(f"❌ Error saving projects: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/admin/upload-image', methods=['POST'])
def upload_image():
    """Handle project image uploads"""
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'No image file'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No selected file'}), 400
        
        if file and allowed_file(file.filename):
            # Generate unique filename
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4().hex}_{filename}"
            filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
            
            # Save file
            file.save(filepath)
            
            # Return relative path for web access
            web_path = f"images/projects/{unique_filename}"
            return jsonify({'success': True, 'image_path': web_path})
        else:
            return jsonify({'success': False, 'error': 'File type not allowed'}), 400
            
    except Exception as e:
        print(f"❌ Error uploading image: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/projects')
def get_projects():
    """API endpoint to get all projects"""
    try:
        with open('static/data/projects.json', 'r', encoding='utf-8') as f:
            projects_data = json.load(f)
        return jsonify(projects_data)
    except FileNotFoundError:
        # Return empty projects if file doesn't exist
        return jsonify({'projects': []})
    except Exception as e:
        print(f"❌ Error loading projects: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/admin/check-auth', methods=['POST'])
def check_auth():
    """Simple authentication check"""
    try:
        data = request.json
        password = data.get('password', '')
        
        # Change this password to whatever you want
        correct_password = os.getenv('ADMIN_PASSWORD')
        
        if password == correct_password:
            return jsonify({'success': True, 'authenticated': True})
        else:
            return jsonify({'success': True, 'authenticated': False})
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == "__main__":
    init_db()
    app.run(debug=os.getenv('FLASK_DEBUG', 'False').lower() in ('true', '1', 't'))