const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

// Use the production database URL (direct connection)
const DATABASE_URL = "postgresql://postgres:Attahir%40786786@db.ehcdjulgoffjmcwhngih.supabase.co:5432/postgres";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

async function main() {
  const email = "adeeltahiri644@gmail.com";
  const password = "password123";
  const name = "Adeel Tahiri";

  console.log("🔄 Connecting to production database...");

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log("✅ User exists! Updating password...");
    const hashedPassword = await hash(password, 12);
    
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    });
    
    console.log("✅ Password updated!");
  } else {
    console.log("➕ Creating new user...");
    const hashedPassword = await hash(password, 12);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    });
    
    console.log("✅ User created!");
  }

  console.log("\n🔑 Login Credentials:");
  console.log("Email:", email);
  console.log("Password:", password);
  console.log("\n🌐 Login at: https://task-managment-82499541fe28.herokuapp.com/auth/signin");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
