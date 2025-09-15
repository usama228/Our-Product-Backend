# 🎓 Internship Management System - Backend

This is the backend server for our internship management system. It handles user authentication, task management, and file uploads with comprehensive role-based access control and secure user management.

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)
![API Docs](https://img.shields.io/badge/API%20Docs-Swagger-85EA2D)

## What does this backend do?

- **Admin-Only User Creation**: Only admins can register new users with role assignment
- **ID Card Verification**: Required ID card front/back photos for all new users
- **Phone Number Management**: Unique phone numbers with validation
- **Profile Management**: Users can update personal info, photos, and passwords
- **User Status Control**: Admins can activate/deactivate accounts
- **Role Management**: Dynamic role updates and team assignments
- **Task System**: Complete task lifecycle with file submissions and feedback
- **File Uploads**: Secure handling of profile pictures, ID cards, and task files
- **JWT Authentication**: Secure token-based authentication system
- **Comprehensive API**: Full REST API with Swagger documentation

## � Who can do what?

| Role             | What they can do                                      |
| ---------------- | ----------------------------------------------------- |
| **👑 Admin**     | Everything! Manage users, create tasks, view all data |
| **👨‍💼 Team Lead** | Manage their team, create tasks, review submissions   |
| **👨‍💻 Employee**  | View their tasks, update profile, submit work         |
| **🎓 Internee**  | Submit tasks, upload files, track their progress      |

## 🔗 API Endpoints (What the frontend can ask for)

### 🔐 User Authentication (`/api/auth`)

- **Register**: `POST /api/auth/register` - Admin-only user creation with ID card verification
- **Login**: `POST /api/auth/login` - Sign in to get access token
- **Profile**: `GET /api/auth/profile` - Get your profile info
- **Update Profile**: `PUT /api/auth/profile` - Update name, phone, profile pic, ID card photos
- **Change Password**: `PUT /api/auth/change-password` - Secure password change

### 👥 User Management (`/api/users`)

- **All Users**: `GET /api/users` - Get list of all users with phone and ID info (Admin only)
- **Team Leads**: `GET /api/users/team-leads` - Get all team leads for assignments
- **Internees**: `GET /api/users/internees` - Get internees under a team lead
- **Internees by Team**: `GET /api/users/internees/:teamLeadId` - Get specific team's internees
- **Dashboard Stats**: `GET /api/users/dashboard-stats` - Get comprehensive system statistics
- **Update Status**: `PUT /api/users/:userId/status` - Activate/deactivate user accounts (Admin only)
- **Update Role**: `PUT /api/users/:userId/role` - Change user role and team assignment (Admin only)

### 📋 Task Management (`/api/tasks`)

- **Create Task**: `POST /api/tasks` - Admin creates new task
- **Get Tasks**: `GET /api/tasks` - See all tasks (filtered by your role)
- **Get One Task**: `GET /api/tasks/:id` - Get details of specific task
- **Submit Task**: `POST /api/tasks/:id/submit` - Internee submits completed work
- **Accept Task**: `POST /api/tasks/:id/accept` - Admin approves submission
- **Reject Task**: `POST /api/tasks/:id/reject` - Admin rejects with feedback
- **Delete Task**: `DELETE /api/tasks/:id` - Remove task completely

## 📊 How data is stored

### Users Table

Each user has:

- **Basic info**: firstName, lastName, email, encrypted password
- **Contact**: phone number (unique and validated)
- **Identity**: idCardNumber (unique), idCardFrontPic, idCardBackPic (required)
- **Role**: admin, team_lead, employee, internee
- **Profile**: profilePicture (optional)
- **Team**: teamLeadId (for internees)
- **Status**: isActive (can be toggled by admin)
- **Timestamps**: createdAt, updatedAt

### Tasks Table

Each task has:

- Title and description
- Status (assigned → submitted → accepted/rejected)
- Priority level (low, medium, high, urgent)
- Who assigned it and who should do it
- Due date
- Submission files and notes
- Feedback from reviewer

## 📁 File Uploads

### What files can be uploaded?

- **Profile Pictures**: Up to 5MB, images only (jpg, png, etc.) - Optional
- **ID Card Photos**: Up to 5MB, images only - **Required for registration**
- **Task Submissions**: Up to 10MB, various formats (images, PDFs, Word docs, zip files)

### Where are files stored?

- Profile pictures and ID cards go to `/uploads/documents/`
- Task files go to `/uploads/tasks/`
- Files get unique names with prefixes (profile-, id-front-, id-back-, task-)
- Access them at `http://localhost:5000/uploads/...`

### File Upload Security

- **Type validation**: Only allowed file types accepted
- **Size limits**: Enforced at middleware level
- **Unique naming**: Prevents file conflicts and overwrites
- **Directory structure**: Organized by file type and purpose

## 🔄 How tasks work

1. **Admin creates task** → Status: "assigned"
2. **Internee submits work** → Status: "submitted"
3. **Admin reviews** → Status: "accepted" or "rejected"
4. **If rejected** → Internee can resubmit after fixing issues

It's like a simple workflow: Create → Submit → Review → Done (or back to Submit if needs fixes)

## 🛠️ How to set it up

### What you need first

- Node.js (version 16 or newer)
- PostgreSQL database
- A code editor

### Step by step setup

1. **Install the packages**

   ```bash
   npm install
   ```

2. **Set up your environment file**
   Create a `.env` file with:

   ```env
   DB_NAME=internship_management
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   JWT_SECRET=your_secret_key_here
   PORT=5000
   ```

3. **Create the database**

   ```bash
   createdb -U postgres internship_management
   ```

4. **Add sample data**

   ```bash
   npm run seed
   ```

5. **Start the server**

   ```bash
   npm run dev
   ```

6. **Check if it works**
   - Server: `http://localhost:5000`
   - API docs: `http://localhost:5000/api-docs`

## 🧪 Test it out

After setting up, you can login with these test accounts:

| Role               | Email                      | Password    | Phone       | ID Card         |
| ------------------ | -------------------------- | ----------- | ----------- | --------------- |
| **👑 Admin**       | admin@company.com          | admin123    | 03001234567 | 12345-6789012-3 |
| **👨‍💼 Team Lead 1** | rahimeen.altaf@company.com | teamlead123 | 03001234568 | 12345-6789012-4 |
| **👨‍💼 Team Lead 2** | alina.ali@company.com      | teamlead123 | 03001234569 | 12345-6789012-5 |
| **👨‍💻 Employee**    | ahmed.ali@company.com      | employee123 | 03001234570 | 12345-6789012-6 |
| **🎓 Internee 1**  | areesha.maryam@company.com | internee123 | 03001234571 | 12345-6789012-7 |
| **🎓 Internee 2**  | shazia.khan@company.com    | internee123 | 03001234572 | 12345-6789012-8 |
| **🎓 Internee 3**  | anila.ali@company.com      | internee123 | 03001234573 | 12345-6789012-9 |

## 📋 Useful commands

```bash
npm run dev          # Start server (restarts when you change code)
npm start           # Start server normally
npm run seed        # Add sample data to database
```

## 🔍 API responses look like this

**When things work:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "your-jwt-token"
  }
}
```

**When there's an error:**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

## 🔒 Security Features

- **Password Encryption**: Bcrypt with 12 salt rounds
- **JWT Tokens**: 7-day expiration with secure secret
- **Role-Based Access**: Middleware enforces permissions
- **File Upload Security**: Type validation, size limits, secure storage
- **Input Validation**: Comprehensive validation for all fields
- **Phone Number Validation**: Format checking and uniqueness
- **ID Card Verification**: Required for all new users
- **SQL Injection Protection**: Sequelize ORM prevents attacks
- **User Status Control**: Admins can deactivate compromised accounts
- **Password Change Security**: Current password verification required

## 🐛 Common problems and fixes

**"Can't connect to database"**

- Make sure PostgreSQL is running
- Check your `.env` file has correct database info
- Try creating the database again

**"Port 5000 already in use"**

- Something else is using that port
- Either stop that program or change the port in `.env`

**"File upload not working"**

- Check if `uploads` folder exists and has write permissions
- Make sure file isn't too big (5MB for profiles, 10MB for tasks)

**"JWT token error"**

- Make sure you set JWT_SECRET in your `.env` file
- Check that you're sending the token correctly in requests

## 📚 Want to learn more?

- **API Documentation**: Visit `http://localhost:5000/api-docs` when server is running
- **Test the API**: Use the Swagger interface to try different endpoints
- **Check the code**: Look at the controller files to see how things work

## 🤝 Contributing

Want to help improve this? Great!

1. Make your changes
2. Test them with different user types
3. Make sure the API docs still work
4. Submit your improvements

---

**Made with Node.js, Express, and PostgreSQL** ❤️
