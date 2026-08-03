import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../lib/prisma';
import { auth } from '../src/auth/auth';
import {
  DEFAULT_COACH_CLASS_MULTIPLIERS,
  DEFAULT_FARE_SETTINGS,
  FARE_SETTINGS_ID,
  defaultCoachClassMultipliers,
} from '../src/common/fare.util';

// Ordered Colombo Fort -> Badulla stations for the "Main Line".
// Note: the source dataset spells Nawalapitiya as "Navalapitiya".
const MAIN_LINE_STATIONS = [
  'Colombo Fort',
  'Gampaha',
  'Polgahawela',
  'Peradeniya Jnc',
  'Kandy',
  'Gampola',
  'Navalapitiya',
  'Hatton',
  'Nanuoya',
  'Haputale',
  'Bandarawela',
  'Ella',
  'Badulla',
];

interface DemoUserSeed {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'passenger';
}

const DEMO_USERS: DemoUserSeed[] = [
  {
    email: 'admin@trainbooking.lk',
    password: 'Admin123!',
    name: 'System Administrator',
    role: 'admin',
  },
  {
    email: 'passenger@example.com',
    password: 'Passenger123!',
    name: 'Demo Passenger',
    role: 'passenger',
  },
];

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

/**
 * Parse a single CSV line into fields, honoring double-quoted fields
 * that may contain commas or escaped quotes ("").
 */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  fields.push(current);
  return fields;
}

function parseStationsCsv(filePath: string): Array<{ name: string; distance: number }> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);

  // First line is the header: name,cumulative_distance_km
  const [, ...rows] = lines;
  const stations: Array<{ name: string; distance: number }> = [];

  for (const row of rows) {
    const [rawName, rawDist] = parseCsvLine(row);
    const name = rawName?.trim();
    const distance = parseFloat(rawDist);

    if (name && !isNaN(distance)) {
      stations.push({ name, distance });
    }
  }

  return stations;
}

async function main() {
  console.log('🌱 Seeding Sri Lanka Railway Stations...');

  const filePath = path.join(__dirname, '../stations-with-cumulative-distances.csv');
  if (!fs.existsSync(filePath)) {
    console.error('❌ Station CSV file not found at:', filePath);
    return;
  }

  const stations = parseStationsCsv(filePath);
  console.log(`📍 Parsed ${stations.length} stations from CSV.`);

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
  await seedMainLine();
  await seedUsers();
}

/**
 * Create the "Main Line" (Colombo Fort -> Badulla) with its ordered
 * intermediate stations, re-linking stations if the line already exists.
 */
async function seedMainLine() {
  console.log('🚆 Seeding "Main Line" (Colombo Fort → Badulla)...');

  const stationRows = await prisma.station.findMany({
    where: { name: { in: MAIN_LINE_STATIONS } },
  });
  const byName = new Map(stationRows.map((s) => [s.name, s]));

  const missing = MAIN_LINE_STATIONS.filter((name) => !byName.has(name));
  if (missing.length > 0) {
    console.error(`❌ Cannot seed "Main Line", missing stations: ${missing.join(', ')}`);
    return;
  }

  const startStation = byName.get(MAIN_LINE_STATIONS[0])!;
  const endStation = byName.get(MAIN_LINE_STATIONS[MAIN_LINE_STATIONS.length - 1])!;
  const intermediateNames = MAIN_LINE_STATIONS.slice(1, -1);

  const existingLine = await prisma.line.findFirst({ where: { name: 'Main Line' } });

  const line = existingLine
    ? await prisma.line.update({
        where: { id: existingLine.id },
        data: { startStationId: startStation.id, endStationId: endStation.id },
      })
    : await prisma.line.create({
        data: {
          name: 'Main Line',
          startStationId: startStation.id,
          endStationId: endStation.id,
        },
      });

  await prisma.lineStation.deleteMany({ where: { lineId: line.id } });
  await prisma.lineStation.createMany({
    data: intermediateNames.map((name, index) => {
      const station = byName.get(name)!;
      return {
        lineId: line.id,
        stationId: station.id,
        position: index,
        distanceFromStart: station.cumulativeDistance - startStation.cumulativeDistance,
      };
    }),
  });

  console.log(`✅ "Main Line" seeded with ${intermediateNames.length} intermediate stations.`);
}

/**
 * Create demo admin + passenger accounts through Better Auth's own sign-up
 * flow so the stored password hash matches what the login endpoint expects.
 */
async function seedUsers() {
  console.log('👤 Seeding demo users...');

  for (const demo of DEMO_USERS) {
    const existing = await prisma.user.findUnique({ where: { email: demo.email } });

    if (existing) {
      if (existing.role !== demo.role) {
        await prisma.user.update({ where: { id: existing.id }, data: { role: demo.role } });
      }
      console.log(`   ↳ ${demo.email} already exists, skipping creation.`);
      continue;
    }

    const created = await auth.api.signUpEmail({
      body: {
        name: demo.name,
        email: demo.email,
        password: demo.password,
      },
    });

    await prisma.user.update({
      where: { id: created.user.id },
      data: { role: demo.role, emailVerified: true },
    });

    console.log(`   ↳ created ${demo.role} user ${demo.email}`);
  }

  console.log('✅ Demo users seeded.');
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
