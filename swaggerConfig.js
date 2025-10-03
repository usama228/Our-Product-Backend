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
        url: "http://localhost:5000/api",
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
        description: "User management operations"
      },
      {
        name: "Tasks",
        description: "Task management and assignment operations"
      },
      {
        name: "Notifications",
        description: "User notification management"
      }
    ],
    paths: {
      "/api/auth/login": {
        post: {
          tags: ["Authentication"],
          summary: "User login",
          description: "Authenticate user with email and password",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: {
                      type: "string",
                      format: "email",
                      example: "user@example.com"
                    },
                    password: {
                      type: "string",
                      example: "password123"
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      token: { type: "string" },
                      user: { $ref: "#/components/schemas/User" }
                    }
                  }
                }
              }
            },
            401: { description: "Invalid credentials" },
            500: { description: "Server error" }
          }
        }
      }
    },
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
            },
            lastName: { 
              type: "string",
              description: "User's last name",
            },
            email: { 
              type: "string", 
              format: "email",
              description: "Unique email address"
            },
            phone: { 
              type: "string",
              description: "Phone number",
            },
            idCardNumber: { 
              type: "string",
              description: "Unique ID card number",
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
              description: "Path to profile picture"
            },
            coverPhoto: {
              type: "string",
              description: "Path to cover photo"
            },
            teamLeadId: { 
              type: "integer",
              description: "ID of assigned team lead (for internees)"
            },
            isActive: { 
              type: "boolean",
              description: "User account status",
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
          }
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
          },
        },
        Notification: {
            type: "object",
            properties: {
                id: { type: "integer" },
                sender: { type: "integer" },
                recipient: { type: "integer" },
                message: { type: "string" },
                isRead: {type: "boolean" }
            }
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
      },
    },
    paths: {
      "/auth/register": {
        post: {
          tags: ["Authentication"],
          summary: "Register a new user",
          description: "Admin-only endpoint to create a new user.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 6 },
                    phone: { type: "string" },
                    idCardNumber: { type: "string" },
                    role: { type: "string", enum: ["admin", "team_lead", "employee", "internee"]},
                    teamLeadId: { type: "integer" },
                    profilePicture: { type: "string", format: "binary"},
                    idCardFrontPic: { type: "string", format: "binary"},
                    idCardBackPic: { type: "string", format: "binary"}
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "User registered successfully" },
            400: { description: "Bad request" },
            403: { description: "Forbidden" }
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Authentication"],
          summary: "Login user",
          requestBody: {
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
            200: { description: "Login successful"},
            401: { description: "Invalid credentials" },
          },
        },
      },
      "/auth/profile": {
        get: {
          tags: ["Authentication"],
          summary: "Get current user profile",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Profile retrieved successfully" },
          },
        },
        put: {
          tags: ["Authentication"],
          summary: "Update user profile",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    phone: { type: "string" },
                    profilePicture: { type: "string", format: "binary"},
                    coverPhoto: { type: "string", format: "binary"},
                    idCardFrontPic: { type: "string", format: "binary"},
                    idCardBackPic: { type: "string", format: "binary"}
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Profile updated successfully" },
            400: { description: "Bad request" },
          },
        },
      },
      "/auth/change-password": {
        put: {
          tags: ["Authentication"],
          summary: "Change user password",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    currentPassword: { type: "string", minLength: 6 },
                    newPassword: { type: "string", minLength: 6 }
                  },
                  required: ["currentPassword", "newPassword"]
                },
              },
            },
          },
          responses: {
            200: { description: "Password changed successfully" },
            400: { description: "Bad request" },
          },
        },
      },
       "/auth/admin/change-password": {
        put: {
          tags: ["Authentication"],
          summary: "Admin change user password",
          description: "Admin or team lead can change a user's password.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    userId: { type: "integer" },
                    newPassword: { type: "string", minLength: 6 }
                  },
                  required: ["userId", "newPassword"]
                },
              },
            },
          },
          responses: {
            200: { description: "Password changed successfully" },
            400: { description: "Bad request" },
            403: { description: "Forbidden" },
            404: { description: "User not found"}
          },
        },
      },
      "/users": {
        get: {
          tags: ["Users"],
          summary: "Get all users",
          description: "Admin or team lead can get all users. Team lead can only see their internees.",
          security: [{ bearerAuth: [] }],
           parameters: [
            { name: "page", in: "query", schema: { type: "integer" } },
            { name: "limit", in: "query", schema: { type: "integer" } },
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "role", in: "query", schema: { type: "string" } },
            { name: "status", in: "query", schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Users retrieved successfully" },
          },
        },
        post: {
            tags: ["Users"],
            summary: "Create a new user",
            description: "Admin-only endpoint to create a new user. Same as /auth/register.",
            security: [{ bearerAuth: [] }],
            requestBody: {
              content: {
                "multipart/form-data": {
                  schema: {
                    type: "object",
                    properties: {
                      firstName: { type: "string" },
                      lastName: { type: "string" },
                      email: { type: "string", format: "email" },
                      password: { type: "string", minLength: 6 },
                      phone: { type: "string" },
                      idCardNumber: { type: "string" },
                      role: { type: "string", enum: ["admin", "team_lead", "employee", "internee"]},
                      teamLeadId: { type: "integer" },
                      profilePicture: { type: "string", format: "binary"},
                      idCardFrontPic: { type: "string", format: "binary"},
                      idCardBackPic: { type: "string", format: "binary"}
                    },
                  },
                },
              },
            },
            responses: {
              201: { description: "User created successfully" },
              400: { description: "Bad request" },
              403: { description: "Forbidden" }
            },
        }
      },
      "/users/dashboard": {
          get: {
              tags: ["Users"],
              summary: "Get dashboard stats",
              security: [{ bearerAuth: [] }],
              responses: {
                  200: { description: "Stats retrieved successfully"}
              }
          }
      },
      "/users/team-leads": {
        get: {
            tags: ["Users"],
            summary: "Get all team leads",
            description: "Admin-only endpoint to get all team leads.",
            security: [{ bearerAuth: [] }],
            responses: {
                200: { description: "Team leads retrieved successfully"}
            }
        }
      },
      "/users/internees": {
        get: {
            tags: ["Users"],
            summary: "Get all internees",
            description: "Admin and team leads can get internees. Admins see all, team leads see their own.",
            security: [{ bearerAuth: [] }],
            responses: {
                200: { description: "Internees retrieved successfully"}
            }
        }
      },
       "/users/internees/{teamLeadId}": {
        get: {
            tags: ["Users"],
            summary: "Get internees by team lead",
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: "teamLeadId", in: "path", required: true, schema: { type: "integer" } }
            ],
            responses: {
                200: { description: "Internees retrieved successfully"}
            }
        }
      },
      "/users/{userId}": {
        get: {
          tags: ["Users"],
          summary: "Get user by ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "userId", in: "path", required: true, schema: { type: "integer" } },
          ],
          responses: {
            200: { description: "User retrieved successfully" },
            404: { description: "User not found" },
          },
        },
        put: {
          tags: ["Users"],
          summary: "Update a user's profile",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "userId", in: "path", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    phone: { type: "string" },
                    idCardNumber: { type: "string" },
                    password: { type: "string" },
                    profilePicture: { type: "string", format: "binary" },
                    coverPhoto: { type: "string", format: "binary" },
                    idCardFrontPic: { type: "string", format: "binary" },
                    idCardBackPic: { type: "string", format: "binary" }
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "User profile updated successfully" },
            404: { description: "User not found" },
          },
        },
        delete: {
          tags: ["Users"],
          summary: "Delete a user",
          description: "Admin-only endpoint to delete a user.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "userId", in: "path", required: true, schema: { type: "integer" } },
          ],
          responses: {
            200: { description: "User deleted successfully" },
            404: { description: "User not found" },
          },
        }
      },
      "/users/{userId}/status": {
        put: {
          tags: ["Users"],
          summary: "Update user status",
          description: "Admin-only endpoint to activate or deactivate a user.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "userId", in: "path", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    isActive: { type: "boolean" },
                  },
                  required: ["isActive"],
                },
              },
            },
          },
          responses: {
            200: { description: "User status updated successfully" },
          },
        },
      },
      "/users/{userId}/role": {
        put: {
          tags: ["Users"],
          summary: "Update user role",
          description: "Admin-only endpoint to change a user's role.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "userId", in: "path", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    role: { type: "string", enum: ["admin", "team_lead", "employee", "internee"] },
                    teamLeadId: { type: "integer" },
                  },
                  required: ["role"],
                },
              },
            },
          },
          responses: {
            200: { description: "User role updated successfully" },
          },
        },
      },
      "/tasks": {
        post: {
          tags: ["Tasks"],
          summary: "Create a new task",
          description: "Admin or team lead can create a new task.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    assigneeId: { type: "integer" },
                    dueDate: { type: "string", format: "date-time" },
                    priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
                  },
                  required: ["title", "description", "assigneeId", "dueDate"],
                },
              },
            },
          },
          responses: {
            201: { description: "Task created successfully" },
          },
        },
        get: {
            tags: ["Tasks"],
            summary: "Get all tasks",
            description: "Retrieves tasks based on user role.",
            security: [{ bearerAuth: [] }],
             parameters: [
              { name: "page", in: "query", schema: { type: "integer" } },
              { name: "limit", in: "query", schema: { type: "integer" } },
              { name: "search", in: "query", schema: { type: "string" } },
              { name: "status", in: "query", schema: { type: "string" } },
              { name: "priority", in: "query", schema: { type: "string" } },
            ],
            responses: {
              200: { description: "Tasks retrieved successfully" },
            },
          }
      },
       "/tasks/my-tasks": {
        get: {
          tags: ["Tasks"],
          summary: "Get my tasks",
          description: "Get tasks assigned to the logged-in user.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer" } },
            { name: "limit", in: "query", schema: { type: "integer" } },
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "status", in: "query", schema: { type: "string" } },
            { name: "priority", in: "query", schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Tasks retrieved successfully" },
          },
        },
      },
      "/tasks/{id}": {
        get: {
          tags: ["Tasks"],
          summary: "Get task by ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          responses: {
            200: { description: "Task retrieved successfully" },
            404: { description: "Task not found" },
          },
        },
        delete: {
          tags: ["Tasks"],
          summary: "Delete a task",
          description: "Admin-only endpoint to delete a task.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          responses: {
            200: { description: "Task deleted successfully" },
            404: { description: "Task not found" },
          },
        },
      },
      "/tasks/{id}/status": {
        patch: {
          tags: ["Tasks"],
          summary: "Update task status",
          description: "Admin or team lead can update a task's status.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", enum: ["assigned", "submitted", "accepted", "rejected"] },
                  },
                  required: ["status"],
                },
              },
            },
          },
          responses: {
            200: { description: "Task status updated successfully" },
          },
        },
      },
      "/tasks/{id}/submit": {
        post: {
          tags: ["Tasks"],
          summary: "Submit a task",
          description: "Employee or internee can submit a task.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
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
            200: { description: "Task submitted successfully" },
            403: { description: "Forbidden" },
          },
        },
      },
      "/tasks/{id}/accept": {
        post: {
          tags: ["Tasks"],
          summary: "Accept a task",
          description: "Admin or team lead can accept a submitted task.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
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
            200: { description: "Task accepted successfully" },
            400: { description: "Bad request" },
          },
        },
      },
      "/tasks/{id}/reject": {
        post: {
          tags: ["Tasks"],
          summary: "Reject a task",
          description: "Admin or team lead can reject a submitted task.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
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
            200: { description: "Task rejected successfully" },
            400: { description: "Bad request" },
          },
        },
      },
      "/notifications": {
        get: {
          tags: ["Notifications"],
          summary: "Get all notifications",
          description: "Get all notifications for the logged-in user.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Notifications retrieved successfully" },
          },
        },
      },
      "/notifications/{id}/read": {
        put: {
          tags: ["Notifications"],
          summary: "Mark a notification as read",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
          ],
          responses: {
            200: { description: "Notification marked as read" },
            404: { description: "Notification not found" }
          },
        },
      },
      "/notifications/read-all": {
        put: {
          tags: ["Notifications"],
          summary: "Mark all notifications as read",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "All notifications marked as read" },
          },
        },
      }
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
