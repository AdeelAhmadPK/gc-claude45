const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "test@example.com";
  const password = "password123"; // Simple password for testing
  const name = "Test User";

  // Delete existing user if exists
  await prisma.user.deleteMany({
    where: { 
      email: {
        in: [email, "adeeltahiri644@gmail.com"]
      }
    }
  });

  console.log("✅ Cleaned up existing users");

  // Hash password
  const hashedPassword = await hash(password, 12);

  // Create new user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  console.log("✅ New user created successfully!");
  console.log("Email:", email);
  console.log("Password:", password);
  console.log("\n🔑 You can now login with these credentials");
  console.log("\nOR use your own email:");
  console.log("Email: adeeltahiri644@gmail.com");
  console.log("Password: password123");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
