const sequelize = require('./config/db'); 
const User = require('./models/userModel');
const bcrypt = require('bcrypt'); 

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true });

    const userCount = await User.count(); 
    if (userCount === 0) {
      await User.bulkCreate([ 
        {
          name: 'udevs',
          email: 'udevs@official.com',
          password: await bcrypt.hash('admin', 10), 
          avatar: null,
          cnic: '00000-0000000-0',
          phone: '+923000000000',
          userType: 'admin', 
          teamLeadId: null,
          joiningDate: new Date(), 
          terminatedDate: null,
          status: 'active', 
          isTerminated: false, 
          isTeamLead: false, 
        },
      ]);

      console.log('Database seeded successfully!'); 
    } else {
      console.log('Database already seeded, skipping...');
    }
  } catch (error) {
    console.error('Error seeding database:', error); 
  } finally {
    await sequelize.close(); 
  }
};

seedDatabase(); 