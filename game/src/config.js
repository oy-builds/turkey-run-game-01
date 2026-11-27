// config.js — every tuning number for Turkey Trot in one place.
// Distances in metres, speeds in pixels per second, canvas 960 x 540.

export const VIEW = { width: 960, height: 540, groundY: 452 };

export const RUN = {
  escapeDistance: 1500,          // metres to the woods
  baseSpeed: 300,                // px/s at the start line
  maxSpeed: 520,                 // px/s by the kitchen
  speedRampPerMetre: 0.16,       // extra px/s per metre run
  metresPerPixel: 0.055,         // distance credit per scrolled pixel
  gravity: 2300,
  jumpVelocity: -880,
  doubleJumpVelocity: -720,      // second jump in the air
  dashSpeed: 760,
  dashTime: 0.28,                // seconds of dash
  dashCooldown: 1.6,
  duckHeight: 30,                // turkey body height while ducking
  stumbleInvincible: 1.4,        // seconds of mercy after a hit
  farmerStartGap: 210,           // px behind the turkey at the start
  farmerCatchGap: 46,            // px — closer than this and Bram grabs Tilly
  farmerGainOnStumble: 62,       // px the farmer gains per stumble
  farmerGainPerSecond: 2.5,      // slow creep so dawdling is punished
  farmerLoseOnDash: 26,          // px shaken off per dash
  farmerLosePerCorn: 4,          // px shaken off per corn eaten
};

export const STAGES = [
  { name: 'FARMYARD', from: 0,    to: 500,  sky: ['#ffd98a', '#ffb35c'], far: '#c98a4b', near: '#8a5a2b', ground: '#a4713a' },
  { name: 'BARN',     from: 500,  to: 1000, sky: ['#e8a06a', '#c96a3f'], far: '#7d4a26', near: '#5d3418', ground: '#6e4423' },
  { name: 'KITCHEN',  from: 1000, to: 1500, sky: ['#f2b879', '#d97b4f'], far: '#8a4a3a', near: '#63332a', ground: '#7a4630' },
  { name: 'THE WOODS', from: 1500, to: 1e9, sky: ['#9dbb6a', '#5f8a4a'], far: '#3f6b34', near: '#2c4f24', ground: '#4a6b35' },
];

export const SCORE = {
  corn: 50,
  feather: 150,
  nearMiss: 25,
  metre: 1,
  escapeBonus: 1000,
};

export const SPAWN = {
  minGapPx: 250,
  maxGapPx: 450,   // a little more breathing room between hazards at speed
  cornChance: 0.5,
  featherChance: 0.07,
  puddleChance: 0.16,
};
