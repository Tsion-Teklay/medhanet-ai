import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";

const MEDICINES = [
  { name: "Amoxil",           genericName: "Amoxicillin",             category: "Antibiotic",    strength: "500mg",    description: "Broad-spectrum penicillin antibiotic for bacterial infections. አንቲባዮቲክ" },
  { name: "Augmentin",        genericName: "Amoxicillin/Clavulanate", category: "Antibiotic",    strength: "625mg",    description: "Combination antibiotic for resistant infections." },
  { name: "Azithral",         genericName: "Azithromycin",            category: "Antibiotic",    strength: "500mg",    description: "Macrolide antibiotic, short three-day course." },
  { name: "Ciprofloxacin",    genericName: "Ciprofloxacin",           category: "Antibiotic",    strength: "500mg",    description: "Fluoroquinolone antibiotic for urinary and gut infections." },
  { name: "Doxycycline",      genericName: "Doxycycline",             category: "Antibiotic",    strength: "100mg",    description: "Tetracycline antibiotic." },
  { name: "Panadol",          genericName: "Paracetamol",             category: "Analgesic",     strength: "500mg",    description: "Pain relief and fever reducer. የህመም ማስታገሻ" },
  { name: "Brufen",           genericName: "Ibuprofen",               category: "Analgesic",     strength: "400mg",    description: "NSAID for pain and inflammation." },
  { name: "Aspirin",          genericName: "Acetylsalicylic Acid",    category: "Analgesic",     strength: "75mg",     description: "Low-dose blood thinner and pain relief." },
  { name: "Diclofenac",       genericName: "Diclofenac Sodium",       category: "Analgesic",     strength: "50mg",     description: "NSAID for joint and muscle pain." },
  { name: "Glucophage",       genericName: "Metformin",               category: "Chronic Care",  strength: "850mg",    description: "First-line treatment for type 2 diabetes. የስኳር በሽታ መድሃኒት" },
  { name: "Amlodipine",       genericName: "Amlodipine Besylate",     category: "Chronic Care",  strength: "5mg",      description: "Calcium channel blocker for high blood pressure." },
  { name: "Lisinopril",       genericName: "Lisinopril",              category: "Chronic Care",  strength: "10mg",     description: "ACE inhibitor for hypertension." },
  { name: "Atorvastatin",     genericName: "Atorvastatin",            category: "Chronic Care",  strength: "20mg",     description: "Statin for lowering cholesterol." },
  { name: "Coartem",          genericName: "Artemether/Lumefantrine", category: "Antimalarial",  strength: "20/120mg", description: "First-line malaria treatment in Ethiopia. የወባ መድሃኒት" },
  { name: "Chloroquine",      genericName: "Chloroquine Phosphate",   category: "Antimalarial",  strength: "250mg",    description: "Antimalarial agent." },
  { name: "Albendazole",      genericName: "Albendazole",             category: "Antiparasitic", strength: "400mg",    description: "Single-dose deworming treatment." },
  { name: "Metronidazole",    genericName: "Metronidazole",           category: "Antiparasitic", strength: "400mg",    description: "For amoebiasis and giardiasis." },
  { name: "Zyrtec",           genericName: "Cetirizine",              category: "Antihistamine", strength: "10mg",     description: "Non-drowsy allergy relief." },
  { name: "Piriton",          genericName: "Chlorpheniramine",        category: "Antihistamine", strength: "4mg",      description: "Allergy relief, may cause drowsiness." },
  { name: "Omeprazole",       genericName: "Omeprazole",              category: "Gastro",        strength: "20mg",     description: "Reduces stomach acid, for ulcers and reflux." },
  { name: "ORS Sachet",       genericName: "Oral Rehydration Salts",  category: "Gastro",        strength: "20.5g",    description: "Rehydration for diarrhoea. የፈሳሽ ማካካሻ" },
  { name: "Ventolin",         genericName: "Salbutamol",              category: "Respiratory",   strength: "100mcg",   description: "Rescue inhaler for asthma." },
  { name: "Ferrous Sulphate", genericName: "Ferrous Sulphate",        category: "Supplement",    strength: "200mg",    description: "Iron supplement for anaemia." },
  { name: "Folic Acid",       genericName: "Folic Acid",              category: "Supplement",    strength: "5mg",      description: "Prenatal supplement." },
];

// Real Addis Ababa neighbourhoods with approximate coordinates.
const PHARMACIES = [
  { name: "Kenema Pharmacy - Bole",     address: "Bole Road, near Edna Mall, Addis Ababa",  lat: 8.9945, lng: 38.7896, phone: "0911234501" },
  { name: "Gishen Pharmacy",            address: "Piassa, Churchill Avenue, Addis Ababa",   lat: 9.0348, lng: 38.7503, phone: "0911234502" },
  { name: "Teklehaimanot Pharmacy",     address: "Teklehaimanot Square, Addis Ababa",       lat: 9.0281, lng: 38.7385, phone: "0911234503" },
  { name: "Bethel Pharmacy - CMC",      address: "CMC Road, Yeka, Addis Ababa",             lat: 9.0192, lng: 38.8272, phone: "0911234504" },
  { name: "Selam Pharmacy - Megenagna", address: "Megenagna Roundabout, Addis Ababa",       lat: 9.0203, lng: 38.8022, phone: "0911234505" },
  { name: "Zewditu Pharmacy",           address: "Kazanchis, near Hilton, Addis Ababa",     lat: 9.0157, lng: 38.7645, phone: "0911234506" },
  { name: "Hayat Pharmacy",             address: "Hayat, Bole Sub-city, Addis Ababa",       lat: 8.9873, lng: 38.8154, phone: "0911234507" },
  { name: "Lideta Pharmacy",            address: "Lideta, near Lideta Church, Addis Ababa", lat: 9.0093, lng: 38.7301, phone: "0911234508" },
  { name: "Sar Bet Pharmacy",           address: "Sar Bet, Nifas Silk-Lafto, Addis Ababa",  lat: 8.9834, lng: 38.7412, phone: "0911234509" },
  { name: "Gerji Pharmacy",             address: "Gerji Mebrat Hail, Addis Ababa",          lat: 9.0021, lng: 38.8341, phone: "0911234510" },
  { name: "Sidist Kilo Pharmacy",       address: "Sidist Kilo, near AAU, Addis Ababa",      lat: 9.0413, lng: 38.7629, phone: "0911234511" },
  { name: "Ayat Pharmacy",              address: "Ayat Condominium, Addis Ababa",           lat: 9.0281, lng: 38.8703, phone: "0911234512" },
];

const BASE_PRICE_ETB = {
  Antibiotic: 180,
  Analgesic: 45,
  "Chronic Care": 120,
  Antimalarial: 260,
  Antiparasitic: 70,
  Antihistamine: 55,
  Gastro: 90,
  Respiratory: 420,
  Supplement: 60,
};

// Deterministic pseudo-variation so seeds are reproducible across runs.
function priceFor(category, salt) {
  const base = BASE_PRICE_ETB[category] ?? 100;
  return Math.round(base * (0.85 + ((salt * 37) % 30) / 100) * 100) / 100;
}

async function main() {
  console.log("Clearing existing data...");
  await prisma.reservation.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.pharmacy.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.user.deleteMany();

  const password = bcrypt.hashSync("password123", 10);

  console.log("Creating admin and patient accounts...");
  await prisma.user.createMany({
    data: [
      { phone: "0911000000", name: "Platform Admin", role: "ADMIN", password },
      { phone: "0922000000", name: "Test Patient", role: "PATIENT", password },
    ],
  });

  console.log("Creating medicines...");
  await prisma.medicine.createMany({ data: MEDICINES });
  const medicines = await prisma.medicine.findMany({ orderBy: { name: "asc" } });

  console.log("Creating pharmacies and inventory...");
  for (let p = 0; p < PHARMACIES.length; p++) {
    const info = PHARMACIES[p];

    const owner = await prisma.user.create({
      data: {
        phone: `09330000${String(p + 10).padStart(2, "0")}`,
        name: `${info.name} Owner`,
        role: "PHARMACY",
        password,
      },
    });

    // Leave the last two PENDING so the admin verification screen has work to review.
    const status = p < PHARMACIES.length - 2 ? "VERIFIED" : "PENDING";
    const isTwentyFourHour = p % 3 === 0;

    const pharmacy = await prisma.pharmacy.create({
      data: {
        ...info,
        ownerId: owner.id,
        status,
        licenseNo: `EFDA-2024-${1000 + p}`,
        openTime: isTwentyFourHour ? "00:00" : "08:00",
        closeTime: isTwentyFourHour ? "23:59" : "20:00",
      },
    });

    await prisma.inventory.createMany({
      data: medicines
        .map((medicine, i) => ({ medicine, i }))
        .filter(({ i }) => (i + p) % 10 !== 0) // this pharmacy is out of stock of that one
        .map(({ medicine, i }) => ({
          pharmacyId: pharmacy.id,
          medicineId: medicine.id,
          quantity: ((i * 13 + p * 7) % 120) + 5,
          minStock: 20,
          batchNo: `B-${2026}${String((i + p) % 12 + 1).padStart(2, "0")}-${i + 1}`,
          price: priceFor(medicine.category, i + p),
          expiryDate: new Date(Date.now() + (180 + ((i * 11) % 400)) * 86_400_000),
        })),
    });
  }

  console.log("Seed complete:", {
    users: await prisma.user.count(),
    pharmacies: await prisma.pharmacy.count(),
    medicines: await prisma.medicine.count(),
    inventory: await prisma.inventory.count(),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
