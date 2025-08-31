const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Internship Management API",
      version: "1.0.0",
      description:
        "API documentation for Internship Management System with PostgreSQL",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
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
            id: { type: "integer" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string", format: "email" },
            role: {
              type: "string",
              enum: ["admin", "team_lead", "employee", "internee"],
            },
            profilePicture: { type: "string" },
            teamLeadId: { type: "integer" },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
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
            success: { type: "boolean" },
            message: { type: "string" },
            error: { type: "string" },
          },
        },
      },
    },
    paths: {
      "/api/auth/register": {
        post: {
          tags: ["Authentication"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 6 },
                    role: {
                      type: "string",
                      enum: ["admin", "team_lead", "employee", "internee"],
                      default: "internee",
                    },
                    teamLeadId: { type: "integer" },
                    profilePicture: { type: "string", format: "binary" },
                  },
                  required: ["firstName", "lastName", "email", "password"],
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
              description: "Bad request",
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
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    profilePicture: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Profile updated successfully",
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
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Team leads retrieved successfully",
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
