const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "adeeltahiri644@gmail.com";
  const newPassword = "12345678"; // Simple password - CHANGE THIS AFTER FIRST LOGIN!

  // Hash password
  const hashedPassword = await hash(newPassword, 12);

  // Update user password
  const user = await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  console.log("✅ Password updated successfully!");
  console.log("Email:", email);
  console.log("Password:", newPassword);
  console.log("\n🔑 You can now login with these credentials");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
