from pytube import YouTube
import tkinter as tk
from tkinter import filedialog


def download_video(url, save_path):
    try:
        yt = YouTube(url)
        stream = yt.streams.get_highest_resolution()
        stream.download(output_path=save_path)
        print("Video downloaded successfully!")
        
    except Exception as e:
        print(f"Error downloading video: {e}")
        
        
def open_file_dialog():
    root = tk.Tk()
    root.withdraw()  # Hide the main window
    save_path = filedialog.askdirectory(title="Select Download Location")
    return save_path

root = tk.Tk()
root.title("YouTube Video Downloader")