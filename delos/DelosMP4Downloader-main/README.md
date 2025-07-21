# DelosMP4Downloader

DelosMP4Downloader is a Python Application with TKinter GUI that helps us download recorded lectures from Delos UOA.

## Features

- Download MP4 files by entering the Delos Player URL.
- Support for concurrent downloads to save time.
- User-friendly graphical interface.
- **CLI mode** for downloading videos without the GUI.

## How to run it

1. `pip install -r requirements.txt`
2. `python delosmp4.py`

### Running in CLI Mode

You can also use DelosMP4Downloader from the command line without the GUI:

```bash
python delosmp4.py --cli --urls <url1> <url2> ...
```

Or provide a file with URLs (one per line):

```bash
python delosmp4.py --cli --file urls.txt
```

You can specify the output directory with `-o` or `--output`:

```bash
python delosmp4.py --cli --file urls.txt --output /path/to/save
```

## Recommended: Use a Virtual Environment

It is recommended to use a Python virtual environment to avoid dependency conflicts.  
You can create and activate one with:

```bash
python3 -m venv env
source env/bin/activate
```

And install the requirements:

```bash
pip install -r requirements.txt
```

## Special Thanks 

Special Thanks to [Alex](https://github.com/DicRecharger) for making this script work as intented.

