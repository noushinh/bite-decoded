// Sample locations for the app. Replace with your real data source.
// Each location may include a `country` field which we use to style markers.
const locations = [
  // USA examples
  {
    id: 'loc-nyc-1',
    title: 'Central Park Cafe',
    description: 'Cozy cafe near Central Park.',
    coordinates: [-73.9712, 40.7831],
    country: 'USA',
  },
  {
    id: 'loc-nyc-2',
    title: 'Downtown Diner',
    description: 'All-day breakfast in downtown.',
    coordinates: [-74.006, 40.7128],
    country: 'USA',
  },

  // India example
  {
    id: 'loc-mumbai-1',
    title: 'Marine Drive Bites',
    description: 'Sea-facing snacks and chai.',
    coordinates: [72.8167, 18.9433],
    country: 'India',
  },

  // Mexico example
  {
    id: 'loc-mex-1',
    title: 'Ciudad Tacos',
    description: 'Authentic tacos and salsas.',
    coordinates: [-99.1332, 19.4326],
    country: 'Mexico',
  },

  // United Kingdom example
  {
    id: 'loc-ldn-1',
    title: 'Riverside Grill',
    description: 'Pub grub by the Thames.',
    coordinates: [-0.1276, 51.5074],
    country: 'United Kingdom',
  },

  // South Africa example
  {
    id: 'loc-cpt-1',
    title: 'Cape Town Corner',
    description: 'Local plates and coffee.',
    coordinates: [18.4241, -33.9249],
    country: 'South Africa',
  },
];

export default locations;
