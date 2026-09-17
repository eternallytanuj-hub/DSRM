export interface SatellitePass {
  id: string;
  noradId?: number;
  name: string;
  operator: string;
  cat?: string;
  alt?: number | string;
  speed: string;
  window: string;
  price: string;
  reason?: string;
}

export const DEFAULT_REAL_PASSES: SatellitePass[] = [
  { id: 'STARLINK-32573', noradId: 61725, name: 'STARLINK-32573', operator: 'SpaceX / Starlink', cat: 'starlink', alt: 483, speed: '220 Mbps (Ku/Ka-Band)', window: '06:42 - 06:55 UTC (13m)', price: '$42' },
  { id: 'ONEWEB-0452', noradId: 52758, name: 'ONEWEB-0452', operator: 'Eutelsat OneWeb', cat: 'oneweb', alt: 1200, speed: '140 Mbps (Ku-Band Polar)', window: '07:15 - 07:31 UTC (16m)', price: '$38' },
  { id: 'IRIDIUM-142', noradId: 43073, name: 'IRIDIUM 142', operator: 'Iridium Communications', cat: 'iridium', alt: 780, speed: '128 Kbps (L-Band IoT Relay)', window: '08:02 - 08:14 UTC (12m)', price: '$28' },
  { id: 'SENTINEL-2A', noradId: 40697, name: 'SENTINEL-2A', operator: 'ESA / Copernicus MSI', cat: 'earth', alt: 786, speed: '600 Mbps (X-Band Optical)', window: '09:30 - 09:44 UTC (14m)', price: '$65' },
  { id: 'NAVSTAR-80', noradId: 46826, name: 'NAVSTAR 80 (USA 309)', operator: 'US Space Force / GPS', cat: 'gps', alt: 20200, speed: 'L1/L2 Attestation Beacon', window: '10:00 - 10:45 UTC (45m)', price: '$49' },
  { id: 'METEOSAT-11', noradId: 40732, name: 'METEOSAT-11', operator: 'EUMETSAT / Weather', cat: 'weather', alt: 35786, speed: '45 Mbps (HRIT Continuous)', window: 'GEO Stationary 24/7', price: '$55' },
  { id: 'STARLINK-32478', noradId: 61726, name: 'STARLINK-32478', operator: 'SpaceX / Starlink', cat: 'starlink', alt: 483, speed: '195 Mbps (Ku-Band LEO)', window: '11:10 - 11:22 UTC (12m)', price: '$40' },
  { id: 'ONEWEB-0182', noradId: 47942, name: 'ONEWEB-0182', operator: 'Eutelsat OneWeb', cat: 'oneweb', alt: 1200, speed: '125 Mbps (Ku-Band)', window: '12:05 - 12:20 UTC (15m)', price: '$36' },
  { id: 'LANDSAT-9', noradId: 49260, name: 'LANDSAT 9', operator: 'NASA / USGS OLI-2', cat: 'earth', alt: 705, speed: '384 Mbps (X-Band Multispectral)', window: '13:14 - 13:28 UTC (14m)', price: '$58' }
];
