import sqlite3
import os

db_path = 'db.sqlite3'
if not os.path.exists(db_path):
    print("Database not found")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("SELECT id, username, email FROM api_user")
    rows = cursor.fetchall()
    print("Found users:")
    for row in rows:
        print(row)
        # If email is empty or duplicate, fix it
    
    # Example fix: assign unique emails to those without one
    emails = {}
    for row_id, username, email in rows:
        if not email or email in emails:
            new_email = f"{username}_{row_id}@example.com"
            print(f"Assigning {new_email} to {username}")
            cursor.execute("UPDATE api_user SET email = ? WHERE id = ?", (new_email, row_id))
        else:
            emails[email] = True
    
    conn.commit()
    print("Email fixation complete.")
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
