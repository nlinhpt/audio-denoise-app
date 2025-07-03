import os
from flask import Flask, render_template, request, send_from_directory, redirect, url_for, flash
from utils import filter_combined
from werkzeug.utils import secure_filename
from pydub import AudioSegment

UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'flac', 'ogg', 'm4a'}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PROCESSED_FOLDER'] = PROCESSED_FOLDER
app.secret_key = 'supersecretkey'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def convert_to_wav(input_path, wav_path):
    audio = AudioSegment.from_file(input_path)
    audio = audio.set_channels(1)
    audio.export(wav_path, format="wav")

@app.route('/', methods=['GET', 'POST'])
def index():
    result_url = None
    if request.method == 'POST':
        if 'audio_file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['audio_file']
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            input_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(input_path)
            # Convert to wav for processing
            wav_path = input_path.rsplit('.',1)[0] + '.wav'
            convert_to_wav(input_path, wav_path)

            output_filename = 'filtered_' + os.path.basename(wav_path)
            output_path = os.path.join(app.config['PROCESSED_FOLDER'], output_filename)
            # Run denoise
            filter_combined(
                input_file=wav_path,
                output_file=output_path,
                freq_range=(92,101),
                start_time=0,
                end_time=147,
                threshold=0.7,
                kernel_size=50,
                kernel_width=3.0
            )
            result_url = url_for('download_file', filename=output_filename)
            return render_template('index.html', result_url=result_url)
        else:
            flash('File type not allowed!')
            return redirect(request.url)
    return render_template('index.html', result_url=result_url)

@app.route('/processed/<filename>')
def download_file(filename):
    return send_from_directory(app.config['PROCESSED_FOLDER'], filename, as_attachment=True)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8080)