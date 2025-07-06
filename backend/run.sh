#!/bin/bash

python3 -m venv env
source env/bin/activate
pip install -r requirements.txt # File missing. Download what bro?
python3 server.py

# rm courses.db # Why delete the database?