const { User, Task } = require("./models");
const sequelize = require("./config/db");

const seedData = async () => {
  try {
    // Sync database
    await sequelize.sync({ force: true });
    console.log("Database synced successfully");

    // Create Admin user
    const admin = await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin@company.com",
      password: "admin123",
      role: "admin",
    });

    // Create Team Leads
    const teamLead1 = await User.create({
      firstName: "Rahimeen",
      lastName: "Altaf",
      email: "rahimeen.altaf@company.com",
      password: "teamlead123",
      role: "team_lead",
    });

    const teamLead2 = await User.create({
      firstName: "Alina",
      lastName: "Ali",
      email: "alina.ali@company.com",
      password: "teamlead123",
      role: "team_lead",
    });

    // Create Employees
    const employee1 = await User.create({
      firstName: "Ahmed",
      lastName: "Ali",
      email: "ahmed.ali@company.com",
      password: "employee123",
      role: "employee",
    });

    // Create Internees
    const internee1 = await User.create({
      firstName: "Areesha",
      lastName: "Maryam",
      email: "areesha.maryam@company.com",
      password: "internee123",
      role: "internee",
      teamLeadId: teamLead1.id,
    });

    const internee2 = await User.create({
      firstName: "Shazia",
      lastName: "Khan",
      email: "shazia.khan@company.com",
      password: "internee123",
      role: "internee",
      teamLeadId: teamLead1.id,
    });

    const internee3 = await User.create({
      firstName: "Anila",
      lastName: "Ali",
      email: "anila.ali@company.com",
      password: "internee123",
      role: "internee",
      teamLeadId: teamLead2.id,
    });

    // Create sample tasks
    await Task.create({
      title: "Learn React Basics",
      description: "Complete the React tutorial and build a simple todo app",
      assignerId: admin.id,
      assigneeId: internee1.id,
      priority: "high",
      status: "assigned",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });

    await Task.create({
      title: "Database Design Exercise", 
      description: "Design a database schema for an e-commerce application",
      assignerId: teamLead1.id,
      assigneeId: internee2.id,
      priority: "medium",
      status: "submitted",
      submissionNotes: "I have completed the database design. Please review the attached schema.",
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    });

    await Task.create({
      title: "API Documentation",
      description: "Write comprehensive API documentation for the user management endpoints",
      assignerId: teamLead2.id,
      assigneeId: internee3.id,
      priority: "low",
      status: "assigned",
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    });

    await Task.create({
      title: "Frontend Component Development",
      description: "Create reusable UI components for the dashboard",
      assignerId: admin.id,
      assigneeId: internee1.id,
      priority: "medium",
      status: "accepted",
      submissionNotes: "Components are ready and tested",
      feedback: "Great work! Components are well-structured and follow best practices.",
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    });

    await Task.create({
      title: "Code Review Process",
      description: "Review and provide feedback on junior developer's code",
      assignerId: teamLead1.id,
      assigneeId: employee1.id,
      priority: "urgent",
      status: "rejected",
      submissionNotes: "Initial review completed",
      feedback: "Please address the security concerns mentioned in the comments before resubmission.",
      submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    });

    console.log("Seed data created successfully!");
    console.log("\nDefault login credentials:");
    console.log("Admin: admin@company.com / admin123");
    console.log("Team Lead 1: rahimeen.altaf@company.com / teamlead123");
    console.log("Team Lead 2: alina.ali@company.com / teamlead123");
    console.log("Employee: ahmed.ali@company.com / employee123");
    console.log("Internee 1: areesha.maryam@company.com / internee123");
    console.log("Internee 2: shazia.khan@company.com / internee123");
    console.log("Internee 3: anila.ali@company.com / internee123");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
