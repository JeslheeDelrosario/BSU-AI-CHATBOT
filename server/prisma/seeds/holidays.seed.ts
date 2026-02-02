import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PHILIPPINES_HOLIDAYS_2024 = [
  { name: "New Year's Day", date: "2024-01-01", type: "REGULAR_HOLIDAY", region: "PHILIPPINES", description: undefined },
  { name: "Chinese New Year", date: "2024-02-10", type: "SPECIAL_NON_WORKING", region: "PHILIPPINES", description: undefined },
  { name: "EDSA People Power Revolution Anniversary", date: "2024-02-25", type: "SPECIAL_NON_WORKING", region: "PHILIPPINES", description: undefined },
  { name: "Maundy Thursday", date: "2024-03-28", type: "REGULAR_HOLIDAY", region: "PHILIPPINES", description: undefined },
  { name: "Good Friday", date: "2024-03-29", type: "REGULAR_HOLIDAY", region: "PHILIPPINES", description: undefined },
  { name: "Black Saturday", date: "2024-03-30", type: "SPECIAL_NON_WORKING", region: "PHILIPPINES", description: undefined },
  { name: "Araw ng Kagitingan (Day of Valor)", date: "2024-04-09", type: "REGULAR_HOLIDAY", region: "PHILIPPINES", description: undefined },
  { name: "Eidul-Fitr", date: "2024-04-10", type: "REGULAR_HOLIDAY", region: "PHILIPPINES", description: "End of Ramadan" },
  { name: "Labor Day", date: "2024-05-01", type: "REGULAR_HOLIDAY", region: "PHILIPPINES", description: undefined },
  { name: "Independence Day", date: "2024-06-12", type: "REGULAR_HOLIDAY", region: "PHILIPPINES", description: undefined },
  { name: "Eid al-Adha (Feast of Sacrifice)", date: "2024-06-17", type: "REGULAR_HOLIDAY", region: "PHILIPPINES", description: undefined },
  { name: "Ninoy Aquino Day", date: "2024-08-21", type: "SPECIAL_NON_WORKING", region: "PHILIPPINES", description: undefined },
  { name: "National Heroes Day", date: "2024-08-26", type: "REGULAR_HOLIDAY", region: "PHILIPPINES", description: undefined },
  { name: "All Saints' Day", date: "2024-11-01", type: "SPECIAL_NON_WORKING", region: "PHILIPPINES", description: undefined },
  { name: "All Souls' Day", date: "2024-11-02", type: "SPECIAL_NON_WORKING", region: "PHILIPPINES", description: undefined },
  { name: "Bonifacio Day", date: "2024-11-30", type: "REGULAR_HOLIDAY", region: "PHILIPPINES", description: undefined },
  { name: "Feast of the Immaculate Conception", date: "2024-12-08", type: "SPECIAL_NON_WORKING", region: "PHILIPPINES", description: undefined },
  { name: "Christmas Eve", date: "2024-12-24", type: "SPECIAL_NON_WORKING", region: "PHILIPPINES", description: undefined },
  { name: "Christmas Day", date: "2024-12-25", type: "REGULAR_HOLIDAY", region: "PHILIPPINES", description: undefined },
  { name: "Rizal Day", date: "2024-12-30", type: "REGULAR_HOLIDAY", region: "PHILIPPINES", description: undefined },
  { name: "New Year's Eve", date: "2024-12-31", type: "SPECIAL_NON_WORKING", region: "PHILIPPINES", description: undefined },
];

const PHILIPPINES_HOLIDAYS_2025 = [
  { name: "New Year's Day", date: "2025-01-01", type: "REGULAR_HOLIDAY", region: "PHILIPPINES", description: undefined },
  { name: "Chinese New Year", date: "2025-01-29", type: "SPECIAL_NON_WORKING", region: "PHILIPPINES", description: undefined },
  { name: "EDSA People Power Revolution Anniversary", date: "2025-02-25", type: "SPECIAL_NON_WORKING", region: "PHILIPPINES", description: undefined },
  { name: "Maundy Thursday", date: "2025-04-17", type: "REGULAR_HOLIDAY", region: "PHILIPPINES", description: undefined },
  { name: "Good Friday", date: "2025-04-18", type: "REGULAR_HOLIDAY", region: "PHILIPPINES", description: undefined },
  { name: "Black Saturday", date: "2025-04-19", type: "SPECIAL_NON_WORKING", region: "PHILIPPINES", description: undefined },
  { name: "Araw ng Kagitingan (Day of Valor)", date: "2025-04-09", type: "REGULAR_HOLIDAY", region: "PHILIPPINES", description: undefined },
  { name: "Labor Day", date: "2025-05-01", type: "REGULAR_HOLIDAY", region: "PHILIPPINES", description: undefined },
  { name: "Independence Day", date: "2025-06-12", type: "REGULAR_HOLIDAY", region: "PHILIPPINES", description: undefined },
  { name: "Ninoy Aquino Day", date: "2025-08-21", type: "SPECIAL_NON_WORKING", region: "PHILIPPINES", description: undefined },
  { name: "National Heroes Day", date: "2025-08-25", type: "REGULAR_HOLIDAY", region: "PHILIPPINES", description: undefined },
  { name: "All Saints' Day", date: "2025-11-01", type: "SPECIAL_NON_WORKING", region: "PHILIPPINES", description: undefined },
  { name: "All Souls' Day", date: "2025-11-02", type: "SPECIAL_NON_WORKING", region: "PHILIPPINES", description: undefined },
  { name: "Bonifacio Day", date: "2025-11-30", type: "REGULAR_HOLIDAY", region: "PHILIPPINES", description: undefined },
  { name: "Feast of the Immaculate Conception", date: "2025-12-08", type: "SPECIAL_NON_WORKING", region: "PHILIPPINES", description: undefined },
  { name: "Christmas Eve", date: "2025-12-24", type: "SPECIAL_NON_WORKING", region: "PHILIPPINES", description: undefined },
  { name: "Christmas Day", date: "2025-12-25", type: "REGULAR_HOLIDAY", region: "PHILIPPINES", description: undefined },
  { name: "Rizal Day", date: "2025-12-30", type: "REGULAR_HOLIDAY", region: "PHILIPPINES", description: undefined },
  { name: "New Year's Eve", date: "2025-12-31", type: "SPECIAL_NON_WORKING", region: "PHILIPPINES", description: undefined },
];

const BULACAN_HOLIDAYS = [
  { name: "Bulacan Foundation Day", date: "2024-08-15", type: "REGIONAL", region: "BULACAN", description: "Anniversary of Bulacan Province" },
  { name: "Bulacan Day", date: "2024-08-15", type: "SPECIAL_NON_WORKING", region: "BULACAN" },
  { name: "Bulacan Foundation Day", date: "2025-08-15", type: "REGIONAL", region: "BULACAN", description: "Anniversary of Bulacan Province" },
  { name: "Bulacan Day", date: "2025-08-15", type: "SPECIAL_NON_WORKING", region: "BULACAN" },
];

const MALOLOS_HOLIDAYS = [
  { name: "Malolos City Charter Day", date: "2024-06-11", type: "LOCAL", region: "MALOLOS", description: "Anniversary of Malolos City Charter" },
  { name: "Malolos Constitution Day", date: "2024-09-15", type: "LOCAL", region: "MALOLOS", description: "Commemoration of the Malolos Constitution" },
  { name: "Malolos City Fiesta", date: "2024-05-08", type: "SPECIAL_NON_WORKING", region: "MALOLOS", description: "Feast of Our Lady of Immaculate Conception" },
  { name: "Malolos City Charter Day", date: "2025-06-11", type: "LOCAL", region: "MALOLOS", description: "Anniversary of Malolos City Charter" },
  { name: "Malolos Constitution Day", date: "2025-09-15", type: "LOCAL", region: "MALOLOS", description: "Commemoration of the Malolos Constitution" },
  { name: "Malolos City Fiesta", date: "2025-05-08", type: "SPECIAL_NON_WORKING", region: "MALOLOS", description: "Feast of Our Lady of Immaculate Conception" },
];

export async function seedHolidays() {
  console.log('🎉 Seeding holidays...');

  const allHolidays = [
    ...PHILIPPINES_HOLIDAYS_2024,
    ...PHILIPPINES_HOLIDAYS_2025,
    ...BULACAN_HOLIDAYS,
    ...MALOLOS_HOLIDAYS,
  ];

  let created = 0;
  let skipped = 0;

  for (const holiday of allHolidays) {
    try {
      const existing = await prisma.holiday.findFirst({
        where: {
          name: holiday.name,
          date: new Date(holiday.date),
          region: holiday.region,
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.holiday.create({
        data: {
          name: holiday.name,
          date: new Date(holiday.date),
          type: holiday.type as any,
          region: holiday.region,
          description: holiday.description || null,
          isRecurring: false,
        },
      });

      created++;
    } catch (error) {
      console.error(`Failed to create holiday: ${holiday.name}`, error);
    }
  }

  console.log(`✅ Created ${created} holidays, skipped ${skipped} existing`);
}

export default seedHolidays;
