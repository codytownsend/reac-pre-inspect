// src/data/nspireDeficiencies.js

/**
 * NSPIRE deficiencies with severity ratings and repair timeframes
 * Based on the NSPIRE Standards document
 */
export const nspireDeficiencies = {
  // Fire and Life Safety
  "call_for_aid_blocked": {
    category: "fire_life_safety",
    description: "Call-for-aid pull cord is blocked",
    severity: "lifeThreatening",
    repairDue: 24,
    hcvRating: "fail"
  },
  "call_for_aid_high": {
    category: "fire_life_safety",
    description: "Pull cord end is higher than 6 inches from the floor",
    severity: "lifeThreatening",
    repairDue: 24,
    hcvRating: "fail"
  },
  "smoke_alarm_missing": {
    category: "fire_life_safety",
    description: "Smoke alarm not installed where required",
    severity: "lifeThreatening",
    repairDue: 24,
    hcvRating: "fail"
  },
  "smoke_alarm_obstructed": {
    category: "fire_life_safety",
    description: "Smoke alarm is obstructed",
    severity: "lifeThreatening",
    repairDue: 24,
    hcvRating: "fail"
  },
  "carbon_monoxide_missing": {
    category: "fire_life_safety",
    description: "Carbon monoxide alarm is missing, not installed, or not installed in a proper location",
    severity: "lifeThreatening",
    repairDue: 24,
    hcvRating: "fail"
  },
  "sprinkler_obstruction": {
    category: "fire_life_safety",
    description: "Obstruction within 18in. of sprinkler head assembly",
    severity: "lifeThreatening",
    repairDue: 24,
    hcvRating: "fail"
  },
  "fire_extinguisher_expired": {
    category: "fire_life_safety",
    description: "Fire extinguisher service tag is missing, illegible, or expired",
    severity: "lifeThreatening",
    repairDue: 24,
    hcvRating: "fail"
  },
  "exit_sign_damaged": {
    category: "fire_life_safety",
    description: "Exit sign is damaged, missing, obstructed, or not adequately illuminated",
    severity: "lifeThreatening",
    repairDue: 24,
    hcvRating: "fail"
  },
  
  // Bathroom/Laundry
  "bathroom_exhaust_inoperable": {
    category: "bathroom",
    description: "Bathroom ventilation system is inoperable",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "bathroom_cabinet_damaged": {
    category: "bathroom",
    description: "50%+ of cabinet components are missing/damaged/inoperable in a bathroom or laundry",
    severity: "moderate", 
    repairDue: 30,
    hcvRating: "fail"
  },
  "sink_damaged": {
    category: "bathroom",
    description: "Sink or sink component is damaged or missing (affects functionality)",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "toilet_missing": {
    category: "bathroom",
    description: "Toilet is missing (only toilet in unit)",
    severity: "lifeThreatening",
    repairDue: 24,
    hcvRating: "fail"
  },
  "toilet_damaged": {
    category: "bathroom",
    description: "Toilet is damaged or inoperable (only toilet in unit)",
    severity: "severe",
    repairDue: 24,
    hcvRating: "fail"
  },
  "tub_shower_inoperable": {
    category: "bathroom",
    description: "Bath/shower inoperable or not draining (only bath in unit)",
    severity: "severe",
    repairDue: 24,
    hcvRating: "fail",
    hcvRepairDue: 30
  },
  "grab_bar_loose": {
    category: "bathroom",
    description: "Any movement whatsoever is detected in the grab bar",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  
  // Kitchen
  "cabinet_missing": {
    category: "kitchen",
    description: "More than 50% of cabinet components are missing, damaged, or inoperable",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "countertop_damaged": {
    category: "kitchen",
    description: "10%+ or more of the Countertop is damaged or has exposed substrate",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "food_prep_area_missing": {
    category: "kitchen",
    description: "Food preparation area is not present",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "kitchen_sink_missing": {
    category: "kitchen",
    description: "Sink is missing or not installed within the primary kitchen",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "refrigerator_missing": {
    category: "kitchen",
    description: "Refrigerator is missing",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "refrigerator_inoperable": {
    category: "kitchen",
    description: "Refrigerator is inoperable",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "cooking_device_missing": {
    category: "kitchen",
    description: "Primary cooking appliance is missing",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "range_not_heating": {
    category: "kitchen",
    description: "No burner on the cooking range or cooktop produces heat",
    severity: "severe",
    repairDue: 24,
    hcvRating: "fail",
    hcvRepairDue: 30
  },
  
  // Finishes & Railings
  "floor_exposed_substrate": {
    category: "finishes",
    description: "10% or more of the floor substrate area is exposed in any room",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "ceiling_unstable": {
    category: "finishes",
    description: "Ceiling has an unstable surface",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "ceiling_hole": {
    category: "finishes",
    description: "Ceiling has a hole 2in. or more in diameter",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "wall_hole": {
    category: "finishes",
    description: "Interior wall has hole greater than 2in",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "stair_tread_missing": {
    category: "finishes",
    description: "Tread on a set of stairs is missing",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "guardrail_missing": {
    category: "finishes",
    description: "Guardrail is missing on an elevated (30in. or more) walking surface",
    severity: "lifeThreatening",
    repairDue: 24,
    hcvRating: "fail"
  },
  "handrail_missing": {
    category: "finishes",
    description: "Handrail is missing (Evidence of Prior Installation)",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  
  // Electrical & Lighting
  "exposed_electrical": {
    category: "electrical",
    description: "Exposed electrical conductor",
    severity: "lifeThreatening",
    repairDue: 24,
    hcvRating: "fail"
  },
  "water_electrical_contact": {
    category: "electrical",
    description: "Water is currently in contact with an electrical conductor",
    severity: "lifeThreatening",
    repairDue: 24,
    hcvRating: "fail"
  },
  "outlet_damaged": {
    category: "electrical",
    description: "Outlet or switch is damaged",
    severity: "lifeThreatening",
    repairDue: 24,
    hcvRating: "fail"
  },
  "gfci_missing": {
    category: "electrical",
    description: "Missing GFCI protection on outlet within Six Feet of water source",
    severity: "severe",
    repairDue: 24,
    hcvRating: "fail",
    hcvRepairDue: 30
  },
  "service_panel_obstructed": {
    category: "electrical",
    description: "Electric service panel is obstructed and not readily accessible",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "min_outlets_missing": {
    category: "electrical",
    description: "Habiltable rooms missing 2+ Outlets or 1 Outlet/1 Light Fixture",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "exterior_light_missing": {
    category: "electrical",
    description: "A permanently installed light fixture is missing",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "interior_light_missing": {
    category: "electrical",
    description: "A kitchen or bathroom is missing a permanently installed light fixture",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  
  // Windows & Doors
  "window_not_open": {
    category: "windows_doors",
    description: "A unit window will not open or stay open",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "window_not_lock": {
    category: "windows_doors",
    description: "A unit window cannot be secured/locked",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "window_not_close": {
    category: "windows_doors",
    description: "A unit window will not close",
    severity: "severe",
    repairDue: 24,
    hcvRating: "fail",
    hcvRepairDue: 30
  },
  "garage_door_hole": {
    category: "windows_doors",
    description: "Garage door has a hole that penetrates to the interior",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "entry_door_not_close": {
    category: "windows_doors",
    description: "A Unit Entry door will not close",
    severity: "severe",
    repairDue: 24,
    hcvRating: "fail",
    hcvRepairDue: 30
  },
  "entry_door_not_lock": {
    category: "windows_doors",
    description: "A Unit Entry door cannot be secured/locked",
    severity: "severe",
    repairDue: 24,
    hcvRating: "fail",
    hcvRepairDue: 30
  },
  "entry_door_hole": {
    category: "windows_doors",
    description: "1⁄4 inch or greater penetrative hole in door surface",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "entry_door_missing": {
    category: "windows_doors",
    description: "Entry door is missing",
    severity: "lifeThreatening",
    repairDue: 24,
    hcvRating: "fail"
  },
  "fire_door_missing": {
    category: "windows_doors",
    description: "Fire-labeled door is missing (evidence of prior installation)",
    severity: "lifeThreatening",
    repairDue: 24,
    hcvRating: "fail"
  },
  
  // Mechanical
  "elevator_inoperable": {
    category: "mechanical",
    description: "Elevator is inoperable",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "gas_leak": {
    category: "mechanical",
    description: "Natural gas, propane, or oil leak",
    severity: "lifeThreatening",
    repairDue: 24,
    hcvRating: "fail"
  },
  "plumbing_leak": {
    category: "mechanical",
    description: "Plumbing leaks",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "sewage_leak": {
    category: "mechanical",
    description: "Leak in the sewage system",
    severity: "severe",
    repairDue: 24,
    hcvRating: "fail",
    hcvRepairDue: 30
  },
  "water_heater_missing_discharge": {
    category: "mechanical",
    description: "Pressure relief valve discharge piping is missing",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "water_heater_flue_issue": {
    category: "mechanical",
    description: "Chimney or flue piping is blocked, misaligned, missing, or has a negative downward slope",
    severity: "lifeThreatening",
    repairDue: 24,
    hcvRating: "fail"
  },
  "dryer_duct_detached": {
    category: "mechanical",
    description: "Electric dryer transition duct is detached or missing",
    severity: "lifeThreatening",
    repairDue: 24,
    hcvRating: "fail"
  },
  "hvac_inoperable_cold": {
    category: "mechanical",
    description: "HVAC system is damaged/inoperable/missing (interior temp less than 64 degrees)",
    severity: "lifeThreatening",
    repairDue: 24,
    hcvRating: "fail"
  },
  
  // Hazards
  "blocked_egress": {
    category: "hazards",
    description: "Obstructed means of egress in a Common Area",
    severity: "lifeThreatening",
    repairDue: 24,
    hcvRating: "fail"
  },
  "sharp_edge": {
    category: "hazards",
    description: "Any item or component has a sharp edge that can puncture or cut",
    severity: "severe",
    repairDue: 24,
    hcvRating: "fail",
    hcvRepairDue: 30
  },
  "infestation_roaches": {
    category: "hazards",
    description: "Evidence of cockroaches (One Live Roach or Evidence of Infestation)",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "infestation_bedbugs": {
    category: "hazards",
    description: "Evidence of bedbugs",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "tripping_hazard": {
    category: "hazards",
    description: "Tripping hazard – 3/4\" vertical difference",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "flammables_near_source": {
    category: "hazards",
    description: "Combustible/Flammables material is on or within 3 feet of an HVAC appliance",
    severity: "lifeThreatening",
    repairDue: 24,
    hcvRating: "fail"
  },
  "lead_paint_large": {
    category: "hazards",
    description: "On a large interior surface on a pre-1978 building, MORE than 2 S.F. of paint has deteriorated",
    severity: "severe",
    repairDue: 24,
    hcvRating: "fail",
    hcvRepairDue: 30
  },
  "mold_extensive": {
    category: "hazards",
    description: "Moisture damage on a surface more than 9 S.F. (Units)",
    severity: "lifeThreatening",
    repairDue: 24,
    hcvRating: "fail"
  },
  "litter_common_area": {
    category: "hazards",
    description: "Ten or more discarded items or pieces of litter in a 100 S.F. area in the Common Areas",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  
  // Site & Grounds
  "address_signage": {
    category: "site_grounds",
    description: "Address, signage, or building identification codes are broken, illegible, or not visible",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "fence_hole": {
    category: "site_grounds",
    description: "Hole in Security Fence Larger than 20% of a Section",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "retaining_wall_leaning": {
    category: "site_grounds",
    description: "Retaining wall is leaning away from the fill side",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "parking_pothole": {
    category: "site_grounds",
    description: "Any one pothole is greater than 4\" deep and 1 SF in area",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "road_blocked": {
    category: "site_grounds",
    description: "Road or driveway access to the property is blocked or impassable",
    severity: "severe",
    repairDue: 24,
    hcvRating: "fail",
    hcvRepairDue: 30
  },
  "walkway_blocked": {
    category: "site_grounds",
    description: "Sidewalk, walkway, or ramp is blocked or impassable",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "drain_grate_missing": {
    category: "site_grounds",
    description: "Grate is not secure or does not cover the site drain opening",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  
  // Structural
  "structural_failure": {
    category: "structural",
    description: "Any load-bearing device, wall, or ceiling that exhibits signs of structural failure",
    severity: "lifeThreatening",
    repairDue: 24,
    hcvRating: "fail"
  },
  "roof_ponding": {
    category: "structural",
    description: "25 SF +/- ponding water above/around a roof drain",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "roof_substrate_exposed": {
    category: "structural",
    description: "Any amount of roofing substrate is exposed",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "fire_escape_damage": {
    category: "structural",
    description: "Any stair, ladder, platform, guardrail, or handrail is damaged",
    severity: "lifeThreatening",
    repairDue: 24,
    hcvRating: "fail"
  },
  "exterior_wall_missing": {
    category: "structural",
    description: "Exterior wall with missing section greater than 12×12\"",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "foundation_crack": {
    category: "structural",
    description: "Crack is present with a width of 1⁄4-inch or greater and a length of 12\" or greater",
    severity: "moderate",
    repairDue: 30,
    hcvRating: "fail"
  },
  "chimney_damage": {
    category: "structural",
    description: "Wood burning fireplace/appliance chimney is damaged",
    severity: "lifeThreatening",
    repairDue: 24,
    hcvRating: "fail"
  }
};

/**
 * Get a NSPIRE deficiency by ID
 * @param {String} id - The deficiency ID
 * @returns {Object} - The deficiency object or null if not found
 */
export const getDeficiency = (id) => {
  return nspireDeficiencies[id] || null;
};

/**
 * Get all deficiencies by category
 * @param {String} category - The category to filter by
 * @returns {Array} - Array of deficiency objects with their IDs
 */
export const getDeficienciesByCategory = (category) => {
  return Object.entries(nspireDeficiencies)
    .filter(([_, deficiency]) => deficiency.category === category)
    .map(([id, deficiency]) => ({ id, ...deficiency }));
};

/**
 * Get all deficiencies by severity
 * @param {String} severity - The severity to filter by
 * @returns {Array} - Array of deficiency objects with their IDs
 */
export const getDeficienciesBySeverity = (severity) => {
  return Object.entries(nspireDeficiencies)
    .filter(([_, deficiency]) => deficiency.severity === severity)
    .map(([id, deficiency]) => ({ id, ...deficiency }));
};

/**
 * Get all HOTMA Life-Threatening deficiencies
 * @returns {Array} - Array of deficiency objects with their IDs
 */
export const getHOTMADeficiencies = () => {
  // These are the specific deficiencies listed in the HOTMA LT list
  const hotmaDeficiencyIds = [
    'call_for_aid_blocked',
    'call_for_aid_high',
    'carbon_monoxide_missing',
    'chimney_damage',
    'dryer_duct_detached',
    'entry_door_missing',
    'blocked_egress',
    'exposed_electrical',
    'water_electrical_contact',
    'outlet_damaged',
    'exit_sign_damaged',
    'fire_escape_damage',
    'fire_extinguisher_expired',
    'flammables_near_source',
    'guardrail_missing',
    'hvac_inoperable_cold',
    'gas_leak',
    'mold_extensive',
    'smoke_alarm_missing',
    'smoke_alarm_obstructed',
    'sprinkler_obstruction',
    'structural_failure',
    'toilet_missing',
    'water_heater_flue_issue'
  ];
  
  return hotmaDeficiencyIds
    .map(id => nspireDeficiencies[id] ? { id, ...nspireDeficiencies[id] } : null)
    .filter(Boolean);
};