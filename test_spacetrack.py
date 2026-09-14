import requests
import json
import datetime
import math

# Login credentials
username = 'eternallytanuj@gmail.com'
password = 'tanuJ!123456789'
site = 'https://www.space-track.org'

try:
    with requests.Session() as session:
        # Step 1: Login
        login_url = f"{site}/ajaxauth/login"
        resp = session.post(login_url, data={'identity': username, 'password': password})
        if resp.status_code != 200:
            print("Failed to login to Space-Track")
            exit(1)
            
        # Step 2: Fetch data (active satellites)
        # We query the gp (general perturbation) endpoint for active satellites
        # Note: limiting to 1000 for a quick test
        query_url = f"{site}/basicspacedata/query/class/gp/DECAY_DATE/null-val/EPOCH/%3Enow-30/orderby/NORAD_CAT_ID/limit/1000/format/json"
        
        print("Fetching data from Space-Track...")
        resp = session.get(query_url)
        if resp.status_code != 200:
            print(f"Failed to fetch data: {resp.status_code}")
            exit(1)
            
        data = resp.json()
        print(f"Successfully fetched {len(data)} records from Space-Track!")
        print("Sample element:")
        if len(data) > 0:
            print(json.dumps(data[0], indent=2))
except Exception as e:
    print(f"Exception occurred: {e}")
