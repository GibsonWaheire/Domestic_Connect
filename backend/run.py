from app import create_app, db
from flask_migrate import Migrate

app = create_app()

@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'app': app}

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
