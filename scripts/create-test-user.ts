const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "adeeltahiri644@gmail.com";
  const password = "Test123456"; // Change this to your desired password
  const name = "Adeel Tahiri";

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log("✅ User already exists!");
    console.log("Email:", existingUser.email);
    console.log("Name:", existingUser.name);
    return;
  }

  // Hash password
  const hashedPassword = await hash(password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      emailVerified: new Date(),
      status: "ACTIVE",
    },
  });

  console.log("✅ Test user created successfully!");
  console.log("Email:", email);
  console.log("Password:", password);
  console.log("Name:", name);
  console.log("\n⚠️  Make sure to change the password after first login!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
