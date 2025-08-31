# 🎓 Internship Management System - Backend

This is the backend server for our internship management system. It handles user authentication, task management, and file uploads. Think of it as the brain that processes all the requests from the frontend and talks to the database.

![Status](https://img.shields.io/badge/Status-Under%20Development-orange)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)

## What does this backend do?

- **User Management**: Register, login, and manage user profiles
- **Task System**: Create, assign, and track tasks between admins and internees
- **File Uploads**: Handle profile pictures and task submission files
- **Authentication**: Secure login system with JWT tokens
- **Role-Based Access**: Different permissions for admins, team leads, and internees

## � Who can do what?

| Role             | What they can do                                      |
| ---------------- | ----------------------------------------------------- |
| **👑 Admin**     | Everything! Manage users, create tasks, view all data |
| **👨‍💼 Team Lead** | Manage their team, create tasks, review submissions   |
| **👨‍💻 Employee**  | View their tasks, update profile, submit work         |
| **🎓 Internee**  | Submit tasks, upload files, track their progress      |

## 🔗 API Endpoints (What the frontend can ask for)

### 🔐 User Authentication (`/api/auth`)

- **Register**: `POST /api/auth/register` - Create a new account
- **Login**: `POST /api/auth/login` - Sign in to get access token
- **Profile**: `GET /api/auth/profile` - Get your profile info
- **Update Profile**: `PUT /api/auth/profile` - Change your name or picture

### 👥 User Management (`/api/users`)

- **All Users**: `GET /api/users` - Get list of all users (Admin only)
- **Team Leads**: `GET /api/users/team-leads` - Get all team leads
- **Internees**: `GET /api/users/internees` - Get internees under a team lead
- **Dashboard Stats**: `GET /api/users/dashboard-stats` - Get numbers for dashboard

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

- Basic info (name, email, password)
- Role (admin, team_lead, employee, internee)
- Profile picture (optional)
- Team lead assignment (for internees)

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

- **Profile Pictures**: Up to 5MB, images only (jpg, png, etc.)
- **Task Submissions**: Up to 10MB, various formats (images, PDFs, Word docs, zip files)

### Where are files stored?

- Profile pictures go to `/uploads/profiles/`
- Task files go to `/uploads/tasks/`
- Files get unique names to avoid conflicts
- Access them at `http://localhost:5000/uploads/...`

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

| Role      | Email                      | Password    |
| --------- | -------------------------- | ----------- |
| Admin     | admin@company.com          | admin123    |
| Team Lead | rahimeen.altaf@company.com | teamlead123 |
| Internee  | areesha.maryam@company.com | internee123 |

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

## 🔒 Security stuff we handle

- **Passwords**: Encrypted before storing in database
- **Login tokens**: Expire after 7 days for security
- **File uploads**: Check file types and sizes
- **API access**: Different permissions for different roles
- **Database**: Protected against common attacks

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
