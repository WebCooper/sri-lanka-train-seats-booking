import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../lib/prisma';
import {
  DEFAULT_COACH_CLASS_MULTIPLIERS,
  DEFAULT_FARE_SETTINGS,
  FARE_SETTINGS_ID,
  defaultCoachClassMultipliers,
} from '../src/common/fare.util';

// Well-known Sri Lankan Railway station codes mapping
const KNOWN_CODES: Record<string, string> = {
  'colombo fort': 'FOT',
  'maradana': 'MDA',
  'ragama': 'RGM',
  'gampaha': 'GPH',
  'veyangoda': 'VGD',
  'polgahawela': 'PLW',
  'kurunegala': 'KGL',
  'maho jnc': 'MHO',
  'anuradhapura': 'ANP',
  'vavniya': 'VAV',
  'kilinochchi': 'KIL',
  'jaffna': 'JAF',
  'kankesanthurai': 'KKE',
  'kankasnthurai': 'KKE2',
  'kandy': 'KDA',
  'peradeniya jnc': 'PDA',
  'gampola': 'GPL',
  'hatton': 'HTN',
  'nanuoya': 'NOA',
  'ambewela': 'AMW',
  'pattipola': 'PTP',
  'haputale': 'HPT',
  'bandarawela': 'BDA',
  'ella': 'ELL',
  'badulla': 'BAD',
  'mount lavinia': 'MLV',
  'panadura': 'PND',
  'kalutara south': 'KTS',
  'aluthgama': 'ALT',
  'ambalangoda': 'ABG',
  'hikkaduwa': 'HKD',
  'galle': 'GLE',
  'weligama': 'WLM',
  'matara': 'MTR',
  'heliatta': 'BLT',
  'avissawella': 'AVW',
  'negambo': 'NGB',
  'puttalam': 'PTM',
  'trincomalee': 'TCO',
  'tricomalee': 'TCO2',
  'baticaloa': 'BTC',
};

function generateCode(name: string, usedCodes: Set<string>): string {
  const normalized = name.toLowerCase().trim();
  if (KNOWN_CODES[normalized] && !usedCodes.has(KNOWN_CODES[normalized])) {
    usedCodes.add(KNOWN_CODES[normalized]);
    return KNOWN_CODES[normalized];
  }

  // Generate 3-4 letter code from name
  const words = name.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/);
  let baseCode = '';

  if (words.length >= 3) {
    baseCode = (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
  } else if (words.length === 2) {
    baseCode = (words[0].substring(0, 2) + words[1].substring(0, 2)).toUpperCase();
  } else {
    baseCode = words[0].substring(0, 4).toUpperCase();
  }

  if (baseCode.length < 3) {
    baseCode = baseCode.padEnd(3, 'X');
  }

  let code = baseCode;
  let counter = 1;
  while (usedCodes.has(code)) {
    code = `${baseCode.substring(0, 3)}${counter}`;
    counter++;
  }

  usedCodes.add(code);
  return code;
}

async function main() {
  console.log('🌱 Seeding Sri Lanka Railway Stations...');

  const filePath = path.join(__dirname, '../stations-with-cumulative-distances.md');
  if (!fs.existsSync(filePath)) {
    console.error('❌ Station markdown file not found at:', filePath);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  // Parse markdown rows matching "| Station Name | Cumulative Distance (Km) |"
  const regex = /\|\s*([^|\n]+?)\s*\|\s*([\d.]+)\s*/g;
  let match;
  const stations: Array<{ name: string; distance: number }> = [];

  while ((match = regex.exec(content)) !== null) {
    const rawName = match[1].trim();
    const rawDist = parseFloat(match[2]);

    if (rawName && !isNaN(rawDist) && rawName !== 'Station Name' && !rawName.includes('---')) {
      const cleanName = rawName.replace(/\.+$/, '').trim();
      stations.push({
        name: cleanName,
        distance: rawDist,
      });
    }
  }

  console.log(`📍 Parsed ${stations.length} stations from markdown.`);

  const usedCodes = new Set<string>();
  let insertedCount = 0;

  for (const st of stations) {
    const code = generateCode(st.name, usedCodes);

    await (prisma.station as any).upsert({
      where: { code },
      update: {
        name: st.name,
        cumulativeDistance: st.distance,
      },
      create: {
        name: st.name,
        code,
        cumulativeDistance: st.distance,
        location: 'Sri Lanka Railways Network',
      },
    });
    insertedCount++;
  }

  console.log(`✅ Successfully seeded/updated ${insertedCount} stations in the database.`);

  await seedFareModel();
}

async function seedFareModel() {
  console.log('💰 Seeding fare model defaults...');

  await prisma.fareSettings.upsert({
    where: { id: FARE_SETTINGS_ID },
    create: {
      id: FARE_SETTINGS_ID,
      flatBookingFee: DEFAULT_FARE_SETTINGS.flatBookingFee,
      ratePerKm: DEFAULT_FARE_SETTINGS.ratePerKm,
      offPeakMultiplier: DEFAULT_FARE_SETTINGS.offPeakMultiplier,
    },
    update: {
      flatBookingFee: DEFAULT_FARE_SETTINGS.flatBookingFee,
      ratePerKm: DEFAULT_FARE_SETTINGS.ratePerKm,
      offPeakMultiplier: DEFAULT_FARE_SETTINGS.offPeakMultiplier,
    },
  });

  for (const entry of defaultCoachClassMultipliers()) {
    await prisma.coachClassFareMultiplier.upsert({
      where: { coachClass: entry.coachClass },
      create: {
        coachClass: entry.coachClass,
        multiplier: entry.multiplier,
      },
      update: {
        multiplier: DEFAULT_COACH_CLASS_MULTIPLIERS[entry.coachClass],
      },
    });
  }

  const peakRuleCount = await prisma.peakHourRule.count();
  if (peakRuleCount === 0) {
    await prisma.peakHourRule.createMany({
      data: [
        {
          name: 'Morning Peak',
          startTime: '07:00',
          endTime: '09:30',
          multiplier: 1.25,
          daysOfWeek: [1, 2, 3, 4, 5],
        },
        {
          name: 'Evening Peak',
          startTime: '17:00',
          endTime: '19:00',
          multiplier: 1.25,
          daysOfWeek: [1, 2, 3, 4, 5],
        },
      ],
    });
  }

  console.log('✅ Fare model defaults seeded.');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding stations:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
