import sys
import argparse
import os
import re
import concurrent.futures
import requests
from tqdm import tqdm
from PyQt6 import QtWidgets, QtGui, QtCore

# --- Shared Downloader Class ---
class DelosDownloader:
    """Handles the business logic for downloading Delos videos."""
    def __init__(self):
        self.session = requests.Session()
        # These specific headers are crucial for the delos.uoa.gr server.
        # A 406 error occurs without the correct 'Accept' header.
        self.session.headers = {
            'Accept': 'application/xml, text/xml, */*; q=0.01',
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive',
            'Referer': 'https://delos.uoa.gr/opendelos/player',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 OPR/107.0.0.0',
            'X-Requested-With': 'XMLHttpRequest',
            'sec-ch-ua': '"Not A(Brand";v="99", "Opera GX";v="107", "Chromium";v="121"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
        }

    def fetch_title(self, data):
        match = re.search(r'<title>(.+?)</title>', data)
        return match.group(1).strip() if match else None

    def fetch_mp4_url(self, data):
        match = re.search(r'>([^"\'<]+\.mp4)<', data)
        return match.group(1) if match else None

    def fetch_presentation_data(self, rid):
        try:
            url = f'https://delos.uoa.gr/opendelos/services/presentationplayer/{rid}'
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            return response.text, None
        except requests.exceptions.RequestException as e:
            return None, f"Network error for rid {rid}: {e}"

    def sanitize_path_component(self, component):
        """Removes characters that are invalid in filenames or directory names."""
        return re.sub(r'[\\/*?:"<>|]', "-", component).strip()

    def download_video(self, url, base_directory):
        """
        Downloads a single video, creating a subdirectory for its course.
        Returns a tuple (success: bool, message: str).
        """
        rid_match = re.search(r'(player|show)\?rid=([a-zA-Z0-9]+)', url)
        if not rid_match:
            return False, f"Invalid URL format: {url}"

        rid = rid_match.group(2)
        data, error = self.fetch_presentation_data(rid)
        if error:
            return False, error

        full_title = self.fetch_title(data)
        mp4_url = self.fetch_mp4_url(data)

        if not mp4_url:
            return False, f"MP4 video not found for URL: {url}"

        if full_title:
            # First, get the main part of the title before lecture-specific info like ' - '
            base_title_part = re.split(r'\s*-\s*|\s*:\s*', full_title, 1)[0]
            
            # Now, get the course name by splitting at the first parenthesis and taking the text before it
            course_name = base_title_part.split('(', 1)[0].strip()
            
            sanitized_course_name = self.sanitize_path_component(course_name)
            sanitized_filename = self.sanitize_path_component(full_title) + '.mp4'
            
            course_directory = os.path.join(base_directory, sanitized_course_name)
        else:
            # Fallback for untitled videos
            course_directory = base_directory
            sanitized_course_name = ""
            sanitized_filename = os.path.basename(mp4_url)
        
        os.makedirs(course_directory, exist_ok=True)
        filepath = os.path.join(course_directory, sanitized_filename)

        try:
            with self.session.get(mp4_url, stream=True, timeout=60) as r:
                r.raise_for_status()
                with open(filepath, 'wb') as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        f.write(chunk)
            
            # Create a clean relative path for the log message
            log_path = os.path.join(sanitized_course_name, sanitized_filename) if sanitized_course_name else sanitized_filename
            return True, f"Downloaded: {log_path}"
        except requests.exceptions.RequestException as e:
            return False, f"Download failed for {sanitized_filename}: {e}"


# --- GUI Implementation ---
STYLESHEET_CONTENT = """
QWidget { background-color: #f0f0f0; font-family: 'Segoe UI', Arial, sans-serif; }
QLabel { font-size: 14px; }
QTextEdit { background-color: white; border: 1px solid #dcdcdc; border-radius: 5px; font-size: 14px; padding: 5px; }
QPushButton { background-color: #007bff; color: white; border: none; padding: 10px 15px; font-size: 14px; border-radius: 5px; font-weight: bold; }
QPushButton:hover { background-color: #0056b3; }
QPushButton:disabled { background-color: #a0a0a0; }
QProgressBar { border: 1px solid #dcdcdc; border-radius: 5px; text-align: center; font-size: 14px; height: 28px; }
QProgressBar::chunk { background-color: #007bff; border-radius: 4px; }
QListWidget { background-color: white; border: 1px solid #dcdcdc; border-radius: 5px; font-size: 12px; }
"""

class DownloaderWorker(QtCore.QObject):
    """Worker thread for handling downloads without freezing the GUI."""
    progress = QtCore.pyqtSignal(int)
    log_message = QtCore.pyqtSignal(str, str)
    finished = QtCore.pyqtSignal()

    def __init__(self, urls, directory, downloader):
        super().__init__()
        self.urls = urls
        self.directory = directory
        self.downloader = downloader

    def run(self):
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = {executor.submit(self.downloader.download_video, url, self.directory): url for url in self.urls}
            completed_count = 0
            for future in concurrent.futures.as_completed(futures):
                success, message = future.result()
                color = "green" if success else "red"
                self.log_message.emit(message, color)
                completed_count += 1
                self.progress.emit(completed_count)
        self.finished.emit()


class URLDownloaderApp(QtWidgets.QWidget):
    def __init__(self, downloader):
        super().__init__()
        self.downloader = downloader
        # Set default directory and ensure it exists
        self.directory = "lectures"
        os.makedirs(self.directory, exist_ok=True)
        self.init_ui()
        self.setStyleSheet(STYLESHEET_CONTENT)

    def init_ui(self):
        self.setWindowTitle("Delos MP4 Downloader")
        self.setMinimumSize(600, 500)
        main_layout = QtWidgets.QVBoxLayout(self)
        main_layout.setContentsMargins(20, 20, 20, 20)
        main_layout.setSpacing(15)
        title_label = QtWidgets.QLabel("Delos Player URLs", self)
        title_label.setFont(QtGui.QFont("Segoe UI", 18, QtGui.QFont.Weight.Bold))
        title_label.setAlignment(QtCore.Qt.AlignmentFlag.AlignCenter)
        main_layout.addWidget(title_label)
        self.text_area = QtWidgets.QTextEdit(self)
        self.text_area.setPlaceholderText("Enter URLs, one per line...")
        main_layout.addWidget(self.text_area)
        dir_layout = QtWidgets.QHBoxLayout()
        self.dir_button = QtWidgets.QPushButton("Select Directory", self)
        self.dir_button.clicked.connect(self.select_directory)
        dir_layout.addWidget(self.dir_button)
        self.dir_label = QtWidgets.QLabel(f"Saving to: {self.directory}", self)
        self.dir_label.setStyleSheet("font-style: italic; color: #555;")
        dir_layout.addWidget(self.dir_label, 1)
        main_layout.addLayout(dir_layout)
        self.download_button = QtWidgets.QPushButton("Download Videos", self)
        self.download_button.clicked.connect(self.start_download)
        main_layout.addWidget(self.download_button)
        self.progress_bar = QtWidgets.QProgressBar(self)
        main_layout.addWidget(self.progress_bar)
        self.log_area = QtWidgets.QListWidget(self)
        main_layout.addWidget(self.log_area)

    def select_directory(self):
        directory = QtWidgets.QFileDialog.getExistingDirectory(self, "Select Directory", self.directory)
        if directory:
            self.directory = directory
            self.dir_label.setText(f"Saving to: {self.directory}")

    def start_download(self):
        urls = [url for url in self.text_area.toPlainText().strip().split('\n') if url]
        if not urls:
            QtWidgets.QMessageBox.warning(self, "No URLs", "Please enter at least one URL.")
            return
        self.set_controls_enabled(False)
        self.progress_bar.setValue(0)
        self.progress_bar.setMaximum(len(urls))
        self.log_area.clear()
        self.thread = QtCore.QThread()
        self.worker = DownloaderWorker(urls, self.directory, self.downloader)
        self.worker.moveToThread(self.thread)
        self.worker.progress.connect(self.progress_bar.setValue)
        self.worker.log_message.connect(self.log_message)
        self.worker.finished.connect(self.on_download_finished)
        self.worker.finished.connect(self.thread.quit)
        self.worker.finished.connect(self.worker.deleteLater)
        self.thread.finished.connect(self.thread.deleteLater)
        self.thread.started.connect(self.worker.run)
        self.thread.start()

    def on_download_finished(self):
        self.set_controls_enabled(True)
        QtWidgets.QMessageBox.information(self, "Complete", "All download tasks have been processed.")
    
    def set_controls_enabled(self, enabled):
        self.download_button.setEnabled(enabled)
        self.dir_button.setEnabled(enabled)
        self.text_area.setEnabled(enabled)

    def log_message(self, message, color):
        item = QtWidgets.QListWidgetItem(message)
        item.setForeground(QtGui.QColor(color))
        self.log_area.addItem(item)
        self.log_area.scrollToBottom()


# --- CLI Implementation ---
def run_cli(args):
    """Runs the application in command-line interface mode."""
    print("--- Delos MP4 Downloader (CLI Mode) ---")
    urls = args.urls
    if args.file:
        try:
            with open(args.file, 'r') as f:
                urls.extend([line.strip() for line in f if line.strip()])
        except FileNotFoundError:
            print(f"Error: The file '{args.file}' was not found.")
            sys.exit(1)
    if not urls:
        print("\nNo URLs provided via arguments. Please paste URLs below (one per line).")
        print("Press Ctrl+D (Linux/macOS) or Ctrl+Z then Enter (Windows) when done.")
        urls = [line.strip() for line in sys.stdin if line.strip()]
    if not urls:
        print("No URLs provided. Exiting.")
        sys.exit(0)
    base_output_dir = args.output
    os.makedirs(base_output_dir, exist_ok=True)
    print(f"\nFound {len(urls)} URL(s). Videos will be saved in subdirectories inside: {base_output_dir}")
    downloader = DelosDownloader()
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        with tqdm(total=len(urls), desc="Downloading", unit="video", bar_format="{l_bar}{bar}| {n_fmt}/{total_fmt} [{elapsed}<{remaining}]") as pbar:
            futures = {executor.submit(downloader.download_video, url, base_output_dir): url for url in urls}
            for future in concurrent.futures.as_completed(futures):
                success, message = future.result()
                pbar.update(1)
                pbar.write(f"-> {message}")
    print("\nAll downloads have been processed.")


# --- Main Entry Point ---
def main():
    parser = argparse.ArgumentParser(description="Download recorded lectures from Delos UOA into organized subdirectories.")
    parser.add_argument('--cli', action='store_true', help='Run the application in command-line mode.')
    parser.add_argument('-o', '--output', default='lectures', help='Base output directory for downloads (CLI mode only). Defaults to "./lectures".')
    parser.add_argument('--urls', nargs='*', default=[], help='Space-separated list of Delos URLs to download (CLI mode only).')
    parser.add_argument('--file', help='Path to a text file containing URLs, one per line (CLI mode only).')
    args = parser.parse_args()

    if args.cli:
        run_cli(args)
    else:
        app = QtWidgets.QApplication(sys.argv)
        downloader = DelosDownloader()
        window = URLDownloaderApp(downloader)
        window.show()
        sys.exit(app.exec())

if __name__ == '__main__':
    main()