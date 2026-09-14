import urllib.request
import json
import math
import datetime

# Celestrak GP API
import subprocess

url = "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json"
try:
    result = subprocess.run(["curl", "-s", "-A", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", url], capture_output=True, text=True, check=True)
    data = json.loads(result.stdout)
except Exception as e:
    print(f"Failed to fetch data: {e}")
    exit(1)

satellites = []
for sat in data:
    try:
        mean_motion = sat["MEAN_MOTION"]
        if mean_motion <= 0:
            continue
        
        period = 86400 / mean_motion
        n = mean_motion * 2 * math.pi / 86400
        a = (3.986004418e14 / (n**2))**(1/3)
        alt = round(a/1000 - 6371)
        
        name = sat.get("OBJECT_NAME", "")
        cat = "other"
        name_upper = name.upper()
        if "STARLINK" in name_upper:
            cat = "starlink"
        elif "ONEWEB" in name_upper:
            cat = "oneweb"
        elif "NAVSTAR" in name_upper or "GPS" in name_upper:
            cat = "gps"
        elif "GLONASS" in name_upper:
            cat = "glonass"
        elif "GALILEO" in name_upper or "GSAT" in name_upper:
            cat = "galileo"
        elif "IRIDIUM" in name_upper:
            cat = "iridium"
        elif "NOAA" in name_upper or "GOES" in name_upper or "METEOSAT" in name_upper:
            cat = "weather"
        elif "LANDSAT" in name_upper or "SENTINEL" in name_upper:
            cat = "earth"
            
        sat_obj = {
            "name": name,
            "id": sat.get("NORAD_CAT_ID", 0),
            "incl": sat.get("INCLINATION", 0) * math.pi / 180,
            "raan": sat.get("RA_OF_ASC_NODE", 0) * math.pi / 180,
            "alt": alt,
            "phase": sat.get("MEAN_ANOMALY", 0) * math.pi / 180,
            "period": round(period),
            "ecc": sat.get("ECCENTRICITY", 0),
            "cat": cat,
            "labeled": False
        }
        satellites.append(sat_obj)
    except Exception:
        pass

out = {
    "count": len(satellites),
    "parseErrors": 0,
    "generatedAt": datetime.datetime.utcnow().isoformat() + "Z",
    "satellites": satellites
}

with open("src/api/satellites.json", "w") as f:
    json.dump(out, f, separators=(',', ':'))

print(f"Successfully saved {len(satellites)} satellites.")
