const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Internship Management API",
      version: "1.0.0",
      description: "Comprehensive API documentation for Internship Management System with role-based authentication, user management, and task assignment features."
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
    tags: [
      {
        name: "Authentication",
        description: "User authentication and profile management"
      },
      {
        name: "Users",
        description: "User management operations (Admin only)"
      },
      {
        name: "Tasks",
        description: "Task management and assignment operations"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { 
              type: "integer",
              description: "Unique user identifier"
            },
            firstName: { 
              type: "string",
              description: "User's first name",
              minLength: 2,
              maxLength: 50
            },
            lastName: { 
              type: "string",
              description: "User's last name",
              minLength: 2,
              maxLength: 50
            },
            email: { 
              type: "string", 
              format: "email",
              description: "Unique email address"
            },
            phone: { 
              type: "string",
              description: "Phone number (10-15 digits)",
              minLength: 10,
              maxLength: 15
            },
            idCardNumber: { 
              type: "string",
              description: "Unique ID card number",
              minLength: 5,
              maxLength: 20
            },
            idCardFrontPic: { 
              type: "string",
              description: "Path to ID card front picture"
            },
            idCardBackPic: { 
              type: "string",
              description: "Path to ID card back picture"
            },
            role: {
              type: "string",
              enum: ["admin", "team_lead", "employee", "internee"],
              description: "User role in the system"
            },
            profilePicture: { 
              type: "string",
              description: "Path to profile picture (optional)"
            },
            teamLeadId: { 
              type: "integer",
              description: "ID of assigned team lead (for internees)"
            },
            isActive: { 
              type: "boolean",
              description: "User account status",
              default: true
            },
            createdAt: { 
              type: "string", 
              format: "date-time",
              description: "Account creation timestamp"
            },
            updatedAt: { 
              type: "string", 
              format: "date-time",
              description: "Last update timestamp"
            },
          },
          required: ["id", "firstName", "lastName", "email", "phone", "idCardNumber", "idCardFrontPic", "idCardBackPic", "role"]
        },
        Task: {
          type: "object",
          properties: {
            id: { type: "integer" },
            title: { type: "string" },
            description: { type: "string" },
            status: {
              type: "string",
              enum: ["assigned", "submitted", "accepted", "rejected"],
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high", "urgent"],
            },
            dueDate: { type: "string", format: "date-time" },
            assignerId: { type: "integer" },
            assigneeId: { type: "integer" },
            submissionFile: { type: "string" },
            submissionNotes: { type: "string" },
            submittedAt: { type: "string", format: "date-time" },
            feedback: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/User" },
                token: { type: "string" },
              },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", default: false },
            message: { type: "string" },
            error: { type: "string" },
          },
        },
        UserRegistrationRequest: {
          type: "object",
          properties: {
            firstName: { 
              type: "string",
              minLength: 2,
              maxLength: 50,
              example: "John"
            },
            lastName: { 
              type: "string",
              minLength: 2,
              maxLength: 50,
              example: "Doe"
            },
            email: { 
              type: "string", 
              format: "email",
              example: "john.doe@company.com"
            },
            password: { 
              type: "string", 
              minLength: 6,
              example: "password123"
            },
            phone: {
              type: "string",
              pattern: "^[\\+]?[1-9][\\d]{0,15}$",
              example: "03001234567"
            },
            idCardNumber: {
              type: "string",
              minLength: 5,
              maxLength: 20,
              example: "12345-6789012-3"
            },
            role: {
              type: "string",
              enum: ["admin", "team_lead", "employee", "internee"],
              example: "internee"
            },
            teamLeadId: { 
              type: "integer",
              example: 2
            }
          },
          required: ["firstName", "lastName", "email", "password", "phone", "idCardNumber", "role"]
        },
        UserStatusUpdate: {
          type: "object",
          properties: {
            isActive: { 
              type: "boolean",
              description: "User active status",
              example: true
            }
          },
          required: ["isActive"]
        },
        UserRoleUpdate: {
          type: "object",
          properties: {
            role: {
              type: "string",
              enum: ["admin", "team_lead", "employee", "internee"],
              description: "New user role",
              example: "employee"
            },
            teamLeadId: {
              type: "integer",
              description: "Team lead ID (required for internees)",
              example: 2
            }
          },
          required: ["role"]
        },
      },
    },
    paths: {
      "/api/auth/register": {
        post: {
          tags: ["Authentication"],
          summary: "Register a new user (Admin only)",
          description: "Create a new user account. Only admins can register new users. Requires phone number and ID card photos.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    firstName: { 
                      type: "string",
                      description: "User's first name",
                      minLength: 2,
                      maxLength: 50
                    },
                    lastName: { 
                      type: "string",
                      description: "User's last name",
                      minLength: 2,
                      maxLength: 50
                    },
                    email: { 
                      type: "string", 
                      format: "email",
                      description: "Unique email address"
                    },
                    password: { 
                      type: "string", 
                      minLength: 6,
                      description: "Password (minimum 6 characters)"
                    },
                    phone: {
                      type: "string",
                      description: "Phone number (10-15 digits)",
                      pattern: "^[\\+]?[1-9][\\d]{0,15}$"
                    },
                    idCardNumber: {
                      type: "string",
                      description: "Unique ID card number",
                      minLength: 5,
                      maxLength: 20
                    },
                    role: {
                      type: "string",
                      enum: ["admin", "team_lead", "employee", "internee"],
                      description: "User role in the system (required)"
                    },
                    teamLeadId: { 
                      type: "integer",
                      description: "Team lead ID (required for internees)"
                    },
                    profilePicture: { 
                      type: "string", 
                      format: "binary",
                      description: "Optional profile picture"
                    },
                    idCardFrontPic: {
                      type: "string",
                      format: "binary",
                      description: "ID card front picture (required)"
                    },
                    idCardBackPic: {
                      type: "string",
                      format: "binary",
                      description: "ID card back picture (required)"
                    }
                  },
                  required: ["firstName", "lastName", "email", "password", "phone", "idCardNumber", "role", "idCardFrontPic", "idCardBackPic"],
                },
              },
            },
          },
          responses: {
            201: {
              description: "User registered successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthResponse" },
                },
              },
            },
            400: {
              description: "Bad request - validation errors",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
            403: {
              description: "Access denied - Admin only",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Authentication"],
          summary: "Login user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string" },
                  },
                  required: ["email", "password"],
                },
              },
            },
          },
          responses: {
            200: {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthResponse" },
                },
              },
            },
            401: {
              description: "Invalid credentials",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
      "/api/auth/profile": {
        get: {
          tags: ["Authentication"],
          summary: "Get current user profile",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Profile retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: {
                        type: "object",
                        properties: {
                          user: { $ref: "#/components/schemas/User" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        put: {
          tags: ["Authentication"],
          summary: "Update user profile",
          description: "Update personal information including name, phone, profile picture, and ID card photos",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    firstName: { 
                      type: "string",
                      description: "Updated first name",
                      minLength: 2,
                      maxLength: 50
                    },
                    lastName: { 
                      type: "string",
                      description: "Updated last name",
                      minLength: 2,
                      maxLength: 50
                    },
                    phone: {
                      type: "string",
                      description: "Updated phone number",
                      pattern: "^[\\+]?[1-9][\\d]{0,15}$"
                    },
                    profilePicture: { 
                      type: "string", 
                      format: "binary",
                      description: "New profile picture"
                    },
                    idCardFrontPic: {
                      type: "string",
                      format: "binary",
                      description: "Updated ID card front picture"
                    },
                    idCardBackPic: {
                      type: "string",
                      format: "binary",
                      description: "Updated ID card back picture"
                    }
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Profile updated successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "Profile updated successfully" },
                      data: {
                        type: "object",
                        properties: {
                          user: { $ref: "#/components/schemas/User" },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Bad request - validation errors",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
      "/api/auth/change-password": {
        put: {
          tags: ["Authentication"],
          summary: "Change user password",
          description: "Change the current user's password by providing current and new password",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    currentPassword: {
                      type: "string",
                      description: "Current password for verification",
                      minLength: 6
                    },
                    newPassword: {
                      type: "string",
                      description: "New password (minimum 6 characters)",
                      minLength: 6
                    }
                  },
                  required: ["currentPassword", "newPassword"]
                },
              },
            },
          },
          responses: {
            200: {
              description: "Password changed successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "Password changed successfully" }
                    },
                  },
                },
              },
            },
            400: {
              description: "Bad request - current password incorrect or validation errors",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
            404: {
              description: "User not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
      "/api/users": {
        get: {
          tags: ["Users"],
          summary: "Get all users (Admin only)",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Users retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: {
                        type: "object",
                        properties: {
                          users: {
                            type: "array",
                            items: { $ref: "#/components/schemas/User" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/users/dashboard-stats": {
        get: {
          tags: ["Users"],
          summary: "Get dashboard statistics",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Dashboard stats retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: {
                        type: "object",
                        properties: {
                          stats: {
                            type: "object",
                            properties: {
                              totalUsers: { type: "integer" },
                              totalInternees: { type: "integer" },
                              totalTeamLeads: { type: "integer" },
                              totalEmployees: { type: "integer" },
                              activeUsers: { type: "integer" },
                              totalTasks: { type: "integer" },
                              assignedTasks: { type: "integer" },
                              submittedTasks: { type: "integer" },
                              acceptedTasks: { type: "integer" },
                              rejectedTasks: { type: "integer" },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/users/team-leads": {
        get: {
          tags: ["Users"],
          summary: "Get all team leads",
          description: "Retrieve a list of all users with team_lead role. Used for assignment dropdowns.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Team leads retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          teamLeads: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                id: { type: "integer", example: 2 },
                                firstName: { type: "string", example: "Rahimeen" },
                                lastName: { type: "string", example: "Altaf" },
                                email: { type: "string", example: "rahimeen.altaf@company.com" }
                              }
                            }
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: "Authentication required",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
      "/api/users/internees": {
        get: {
          tags: ["Users"],
          summary: "Get all internees (Team Lead+ only)",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Internees retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: {
                        type: "object",
                        properties: {
                          internees: {
                            type: "array",
                            items: { $ref: "#/components/schemas/User" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/users/internees/{teamLeadId}": {
        get: {
          tags: ["Users"],
          summary: "Get internees by team lead (Team Lead+ only)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "teamLeadId",
              in: "path",
              required: true,
              schema: { type: "integer" },
              description: "Team lead ID to filter internees"
            },
          ],
          responses: {
            200: {
              description: "Internees retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: {
                        type: "object",
                        properties: {
                          internees: {
                            type: "array",
                            items: { $ref: "#/components/schemas/User" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/users/{userId}/status": {
        put: {
          tags: ["Users"],
          summary: "Update user status (Admin only)",
          description: "Activate or deactivate a user account",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "userId",
              in: "path",
              required: true,
              schema: { type: "integer" },
              description: "User ID to update"
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    isActive: { 
                      type: "boolean",
                      description: "User active status"
                    },
                  },
                  required: ["isActive"],
                },
              },
            },
          },
          responses: {
            200: {
              description: "User status updated successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      message: { type: "string" },
                      data: {
                        type: "object",
                        properties: {
                          user: { $ref: "#/components/schemas/User" },
                        },
                      },
                    },
                  },
                },
              },
            },
            404: {
              description: "User not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
            403: {
              description: "Access denied - Admin only",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
      "/api/users/{userId}/role": {
        put: {
          tags: ["Users"],
          summary: "Update user role (Admin only)",
          description: "Change user role and team assignment",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "userId",
              in: "path",
              required: true,
              schema: { type: "integer" },
              description: "User ID to update"
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    role: {
                      type: "string",
                      enum: ["admin", "team_lead", "employee", "internee"],
                      description: "New user role"
                    },
                    teamLeadId: {
                      type: "integer",
                      description: "Team lead ID (required for internees)"
                    },
                  },
                  required: ["role"],
                },
              },
            },
          },
          responses: {
            200: {
              description: "User role updated successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      message: { type: "string" },
                      data: {
                        type: "object",
                        properties: {
                          user: { $ref: "#/components/schemas/User" },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Invalid role or team lead assignment",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
            404: {
              description: "User not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
            403: {
              description: "Access denied - Admin only",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
      "/api/tasks": {
        get: {
          tags: ["Tasks"],
          summary: "Get all tasks (Team Lead+ only)",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Tasks retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Task" },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Tasks"],
          summary: "Create a new task (Admin only)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    assigneeId: { type: "integer" },
                    dueDate: { type: "string", format: "date-time" },
                    priority: {
                      type: "string",
                      enum: ["low", "medium", "high", "urgent"],
                      default: "medium",
                    },
                  },
                  required: ["title", "description", "assigneeId"],
                },
              },
            },
          },
          responses: {
            201: {
              description: "Task created successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Task" },
                },
              },
            },
          },
        },
      },
      "/api/tasks/{id}": {
        get: {
          tags: ["Tasks"],
          summary: "Get task by ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            200: {
              description: "Task retrieved successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Task" },
                },
              },
            },
            404: {
              description: "Task not found",
            },
          },
        },
        delete: {
          tags: ["Tasks"],
          summary: "Delete task (Admin only)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            200: {
              description: "Task deleted successfully",
            },
            404: {
              description: "Task not found",
            },
          },
        },
      },
      "/api/tasks/{id}/status": {
        patch: {
          tags: ["Tasks"],
          summary: "Update task status (Team Lead+ only)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["assigned", "submitted", "accepted", "rejected"],
                    },
                  },
                  required: ["status"],
                },
              },
            },
          },
          responses: {
            200: {
              description: "Task status updated successfully",
            },
          },
        },
      },
      "/api/tasks/{id}/submit": {
        post: {
          tags: ["Tasks"],
          summary: "Submit task (Internee only)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    submissionNotes: { type: "string" },
                    submissionFile: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Task submitted successfully",
            },
            403: {
              description: "You can only submit your own tasks",
            },
          },
        },
      },
      "/api/tasks/{id}/accept": {
        post: {
          tags: ["Tasks"],
          summary: "Accept submitted task (Admin only)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    feedback: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Task accepted successfully",
            },
            400: {
              description: "Task must be submitted before it can be accepted",
            },
          },
        },
      },
      "/api/tasks/{id}/reject": {
        post: {
          tags: ["Tasks"],
          summary: "Reject submitted task (Admin only)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    feedback: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Task rejected successfully",
            },
            400: {
              description: "Task must be submitted before it can be rejected",
            },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js", "./app.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
