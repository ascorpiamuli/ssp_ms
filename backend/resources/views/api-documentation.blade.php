{{-- resources/views/api-documentation.blade.php --}}
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>API Documentation | Catholic Community Platform</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    :root {
      --primary: #4F46E5;
      --primary-dark: #4338CA;
      --primary-light: #818CF8;
      --secondary: #7C3AED;
      --success: #10B981;
      --warning: #F59E0B;
      --danger: #EF4444;
      --info: #3B82F6;
      --dark: #1F2937;
      --gray: #6B7280;
      --light: #F3F4F6;
      --lighter: #F9FAFB;
      --border: #E5E7EB;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', sans-serif;
      background: var(--lighter);
      color: var(--dark);
      line-height: 1.6;
    }

    /* Sidebar */
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      width: 280px;
      height: 100vh;
      background: white;
      border-right: 1px solid var(--border);
      overflow-y: auto;
      z-index: 100;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
    }

    .sidebar-header {
      padding: 24px;
      border-bottom: 1px solid var(--border);
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    }

    .sidebar-header h1 {
      font-size: 20px;
      font-weight: 700;
      color: white;
      margin-bottom: 4px;
    }

    .sidebar-header p {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
    }

    .sidebar-header .version {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      padding: 2px 8px;
      border-radius: 20px;
      font-size: 11px;
      margin-top: 8px;
      color: white;
    }

    .nav-search {
      padding: 16px;
      border-bottom: 1px solid var(--border);
    }

    .nav-search input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: all 0.2s;
    }

    .nav-search input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }

    .nav-menu {
      padding: 16px 0;
    }

    .nav-category {
      padding: 12px 20px;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--gray);
      background: var(--lighter);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }

    .nav-category:first-child {
      border-top: none;
    }

    .nav-item {
      padding: 10px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--dark);
      text-decoration: none;
      font-size: 14px;
      transition: all 0.2s;
      border-left: 3px solid transparent;
    }

    .nav-item:hover {
      background: var(--light);
      border-left-color: var(--primary-light);
    }

    .nav-item.active {
      background: linear-gradient(90deg, rgba(79, 70, 229, 0.1) 0%, transparent 100%);
      border-left-color: var(--primary);
      color: var(--primary);
      font-weight: 500;
    }

    .nav-item i {
      width: 20px;
      color: var(--gray);
    }

    .nav-item.active i {
      color: var(--primary);
    }

    /* Main Content */
    .main-content {
      margin-left: 280px;
      padding: 40px 60px;
      max-width: 1200px;
    }

    /* Hero Section */
    .hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 24px;
      padding: 48px;
      color: white;
      margin-bottom: 40px;
    }

    .hero h1 {
      font-size: 36px;
      margin-bottom: 16px;
    }

    .hero p {
      font-size: 18px;
      opacity: 0.95;
      margin-bottom: 24px;
    }

    .hero-stats {
      display: flex;
      gap: 32px;
      margin-top: 24px;
    }

    .hero-stat {
      text-align: center;
    }

    .hero-stat .number {
      font-size: 28px;
      font-weight: 700;
    }

    .hero-stat .label {
      font-size: 12px;
      opacity: 0.8;
    }

    .base-url {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 12px 20px;
      font-family: monospace;
      font-size: 14px;
      display: inline-block;
      margin-top: 16px;
    }

    /* Section Styles */
    .section {
      background: white;
      border-radius: 16px;
      margin-bottom: 32px;
      overflow: hidden;
      border: 1px solid var(--border);
    }

    .section-header {
      padding: 20px 24px;
      background: white;
      border-bottom: 1px solid var(--border);
      cursor: pointer;
      transition: background 0.2s;
    }

    .section-header:hover {
      background: var(--lighter);
    }

    .section-header h2 {
      font-size: 20px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .section-header h2 i {
      color: var(--primary);
    }

    .section-header .badge-count {
      background: var(--light);
      padding: 2px 8px;
      border-radius: 20px;
      font-size: 12px;
      margin-left: 12px;
    }

    .section-content {
      padding: 24px;
      display: none;
    }

    .section.open .section-content {
      display: block;
    }

    /* Endpoint Card */
    .endpoint-card {
      background: var(--lighter);
      border-radius: 12px;
      margin-bottom: 20px;
      overflow: hidden;
      border: 1px solid var(--border);
    }

    .endpoint-header {
      padding: 16px 20px;
      background: white;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .method {
      font-weight: 700;
      font-size: 12px;
      padding: 4px 12px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .method.GET {
      background: #10B98120;
      color: #10B981;
    }

    .method.POST {
      background: #3B82F620;
      color: #3B82F6;
    }

    .method.PUT {
      background: #F59E0B20;
      color: #F59E0B;
    }

    .method.PATCH {
      background: #8B5CF620;
      color: #8B5CF6;
    }

    .method.DELETE {
      background: #EF444420;
      color: #EF4444;
    }

    .endpoint-url {
      font-family: monospace;
      font-size: 14px;
      color: var(--dark);
      flex: 1;
    }

    .auth-badge {
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 20px;
      background: #FEF3C7;
      color: #92400E;
    }

    .auth-badge.public {
      background: #D1FAE5;
      color: #065F46;
    }

    .endpoint-description {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      font-size: 14px;
      color: var(--gray);
    }

    .endpoint-details {
      padding: 20px;
    }

    .sub-section {
      margin-bottom: 20px;
    }

    .sub-section-title {
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--gray);
      margin-bottom: 12px;
    }

    .parameters-table,
    .response-table {
      width: 100%;
      font-size: 13px;
      border-collapse: collapse;
    }

    .parameters-table th,
    .response-table th {
      text-align: left;
      padding: 10px 12px;
      background: var(--light);
      font-weight: 600;
    }

    .parameters-table td,
    .response-table td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--border);
    }

    .param-name {
      font-family: monospace;
      font-weight: 600;
      color: var(--primary);
    }

    .param-type {
      font-size: 11px;
      color: var(--gray);
    }

    .required {
      color: var(--danger);
      font-size: 11px;
    }

    .code-block {
      background: #1E1E1E;
      color: #D4D4D4;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 13px;
      line-height: 1.5;
    }

    .code-block .keyword {
      color: #569CD6;
    }

    .code-block .string {
      color: #CE9178;
    }

    .code-block .number {
      color: #B5CEA8;
    }

    .code-block .comment {
      color: #6A9955;
    }

    .search-highlight {
      background: #FEF3C7;
      border-radius: 3px;
    }

    /* Footer */
    .footer {
      margin-top: 48px;
      padding: 24px;
      text-align: center;
      color: var(--gray);
      font-size: 13px;
      border-top: 1px solid var(--border);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s;
      }

      .sidebar.open {
        transform: translateX(0);
      }

      .main-content {
        margin-left: 0;
        padding: 20px;
      }

      .hero {
        padding: 24px;
      }

      .hero h1 {
        font-size: 24px;
      }
    }

    /* Scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: var(--light);
    }

    ::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: var(--gray);
    }

    /* Loading */
    .loading {
      text-align: center;
      padding: 40px;
      color: var(--gray);
    }
  </style>
</head>

<body>
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <h1><i class="fas fa-church"></i> TUMCATHCOM API</h1>
      <p>Catholic Community Platform</p>
      <span class="version">v1.0.0</span>
    </div>
    <div class="nav-search">
      <input type="text" id="searchInput" placeholder="Search endpoints...">
    </div>
    <nav class="nav-menu" id="navMenu">
      <!-- Navigation will be populated by JavaScript -->
    </nav>
  </aside>

  <main class="main-content">
    <div class="hero">
      <h1><i class="fas fa-church"></i> Transfiguration of Our Lord Catholic Community</h1>
      <p>Welcome to the official API documentation. This RESTful API provides comprehensive access to church management features including member management, sacraments, novenas, welfare services, and more.</p>
      <div class="base-url">
        <i class="fas fa-link"></i> Base URL: <code>https://your-domain.com/api/v1</code>
      </div>
      <div class="hero-stats">
        <div class="hero-stat">
          <div class="number" id="totalEndpoints">0</div>
          <div class="label">Endpoints</div>
        </div>
        <div class="hero-stat">
          <div class="number" id="totalCategories">0</div>
          <div class="label">Categories</div>
        </div>
        <div class="hero-stat">
          <div class="number">v1</div>
          <div class="label">API Version</div>
        </div>
      </div>
    </div>

    <div id="apiContent">
      <div class="loading">
        <i class="fas fa-spinner fa-spin"></i> Loading API documentation...
      </div>
    </div>

    <div class="footer">
      <p>&copy; {{ date('Y') }} Transfiguration of Our Lord Catholic Community. All rights reserved.</p>
      <p>For support, please contact <a href="mailto:support@tumcathcom.com">support@tumcathcom.com</a></p>
    </div>
  </main>

  <script>
    // Complete API Documentation Data
    const apiDocumentation = {
      baseUrl: "{{ url('/api/v1') }}",
      endpoints: {
        // Authentication
        auth: {
          name: "Authentication",
          icon: "fa-key",
          description: "User authentication and account management endpoints.",
          endpoints: [{
              method: "POST",
              path: "/auth/register",
              auth: "public",
              description: "Register a new user account",
              parameters: [{
                  name: "name",
                  type: "string",
                  required: true,
                  description: "Full name"
                },
                {
                  name: "email",
                  type: "string",
                  required: true,
                  description: "Email address"
                },
                {
                  name: "password",
                  type: "string",
                  required: true,
                  description: "Password (min 8 characters)"
                },
                {
                  name: "password_confirmation",
                  type: "string",
                  required: true,
                  description: "Password confirmation"
                },
                {
                  name: "phone",
                  type: "string",
                  required: false,
                  description: "Phone number"
                }
              ]
            },
            {
              method: "POST",
              path: "/auth/login",
              auth: "public",
              description: "Login to get access token",
              parameters: [{
                  name: "email",
                  type: "string",
                  required: true,
                  description: "Email address"
                },
                {
                  name: "password",
                  type: "string",
                  required: true,
                  description: "Password"
                }
              ]
            },
            {
              method: "POST",
              path: "/auth/logout",
              auth: "required",
              description: "Logout and invalidate token"
            },
            {
              method: "GET",
              path: "/auth/me",
              auth: "required",
              description: "Get authenticated user information"
            },
            {
              method: "POST",
              path: "/auth/refresh",
              auth: "public",
              description: "Refresh access token"
            },
            {
              method: "POST",
              path: "/auth/forgot-password",
              auth: "public",
              description: "Request password reset link",
              parameters: [{
                name: "email",
                type: "string",
                required: true,
                description: "Registered email address"
              }]
            },
            {
              method: "POST",
              path: "/auth/reset-password",
              auth: "public",
              description: "Reset password with token",
              parameters: [{
                  name: "email",
                  type: "string",
                  required: true,
                  description: "Email address"
                },
                {
                  name: "token",
                  type: "string",
                  required: true,
                  description: "Reset token from email"
                },
                {
                  name: "password",
                  type: "string",
                  required: true,
                  description: "New password"
                }
              ]
            },
            {
              method: "POST",
              path: "/auth/validate-reset-token",
              auth: "public",
              description: "Validate password reset token"
            }
          ]
        },
        // Profile
        profile: {
          name: "Profile Management",
          icon: "fa-user",
          description: "User profile management endpoints.",
          endpoints: [{
              method: "GET",
              path: "/profile",
              auth: "required",
              description: "Get user profile"
            },
            {
              method: "PUT",
              path: "/profile",
              auth: "required",
              description: "Update user profile"
            },
            {
              method: "POST",
              path: "/profile/photo",
              auth: "required",
              description: "Upload profile photo"
            },
            {
              method: "GET",
              path: "/profile/status",
              auth: "required",
              description: "Check profile completion status"
            },
            {
              method: "GET",
              path: "/profile/user/{userId}",
              auth: "admin",
              description: "Get profile by user ID (Admin only)"
            },
            {
              method: "PUT",
              path: "/user/profile",
              auth: "required",
              description: "Update user-specific data"
            },
            {
              method: "GET",
              path: "/profiles",
              auth: "admin",
              description: "List all profiles (Admin only)"
            },
            {
              method: "GET",
              path: "/profiles/{id}",
              auth: "admin",
              description: "Get single profile (Admin only)"
            }
          ]
        },
        // Prayers
        prayers: {
          name: "Prayers",
          icon: "fa-pray",
          description: "Prayer management and retrieval endpoints.",
          endpoints: [{
              method: "GET",
              path: "/prayers",
              auth: "public",
              description: "Get all prayers"
            },
            {
              method: "GET",
              path: "/prayers/random",
              auth: "public",
              description: "Get random prayer"
            },
            {
              method: "GET",
              path: "/prayers/{id}",
              auth: "public",
              description: "Get specific prayer"
            },
            {
              method: "POST",
              path: "/prayers",
              auth: "admin",
              description: "Create new prayer (Admin only)"
            },
            {
              method: "PUT",
              path: "/prayers/{id}",
              auth: "admin",
              description: "Update prayer (Admin only)"
            },
            {
              method: "DELETE",
              path: "/prayers/{id}",
              auth: "admin",
              description: "Delete prayer (Admin only)"
            }
          ]
        },
        // Daily Readings
        readings: {
          name: "Daily Readings",
          icon: "fa-book",
          description: "Liturgical daily readings.",
          endpoints: [{
              method: "GET",
              path: "/readings/today",
              auth: "public",
              description: "Get today's readings"
            },
            {
              method: "GET",
              path: "/readings/{date}",
              auth: "public",
              description: "Get readings for specific date (YYYY-MM-DD)"
            },
            {
              method: "GET",
              path: "/readings",
              auth: "public",
              description: "Get readings for a month (query: ?month=1&year=2024)"
            },
            {
              method: "GET",
              path: "/readings/year/{year}",
              auth: "public",
              description: "Get readings for entire year"
            },
            {
              method: "POST",
              path: "/readings",
              auth: "admin",
              description: "Create reading (Admin only)"
            },
            {
              method: "PUT",
              path: "/readings/{id}",
              auth: "admin",
              description: "Update reading (Admin only)"
            },
            {
              method: "DELETE",
              path: "/readings/{id}",
              auth: "admin",
              description: "Delete reading (Admin only)"
            }
          ]
        },
        // Liturgical Calendar
        calendar: {
          name: "Liturgical Calendar",
          icon: "fa-calendar-alt",
          description: "Liturgical calendar and feast days.",
          endpoints: [{
              method: "GET",
              path: "/calendar/today",
              auth: "public",
              description: "Get today's liturgical info"
            },
            {
              method: "GET",
              path: "/calendar/{date}",
              auth: "public",
              description: "Get liturgical info for date"
            },
            {
              method: "GET",
              path: "/calendar",
              auth: "public",
              description: "Get month calendar (query: ?month=1&year=2024)"
            },
            {
              method: "GET",
              path: "/calendar/year/{year}",
              auth: "public",
              description: "Get full year calendar"
            },
            {
              method: "GET",
              path: "/calendar/solemnities/{year}",
              auth: "public",
              description: "Get all solemnities for year"
            },
            {
              method: "GET",
              path: "/calendar/feasts/{year}",
              auth: "public",
              description: "Get all feasts for year"
            },
            {
              method: "GET",
              path: "/calendar/memorials/{year}",
              auth: "public",
              description: "Get all memorials for year"
            },
            {
              method: "GET",
              path: "/calendar/season/{season}/{year}",
              auth: "public",
              description: "Get dates for liturgical season"
            },
            {
              method: "POST",
              path: "/calendar",
              auth: "admin",
              description: "Add calendar entry (Admin only)"
            },
            {
              method: "PUT",
              path: "/calendar/{id}",
              auth: "admin",
              description: "Update calendar entry (Admin only)"
            },
            {
              method: "DELETE",
              path: "/calendar/{id}",
              auth: "admin",
              description: "Delete calendar entry (Admin only)"
            }
          ]
        },
        // Saints
        saints: {
          name: "Saints",
          icon: "fa-crown",
          description: "Saint information and patron families.",
          endpoints: [{
              method: "GET",
              path: "/saints",
              auth: "public",
              description: "Get all saints"
            },
            {
              method: "GET",
              path: "/saints/featured",
              auth: "public",
              description: "Get featured saints"
            },
            {
              method: "GET",
              path: "/saints/patron-families",
              auth: "public",
              description: "Get all patron families"
            },
            {
              method: "GET",
              path: "/saints/patron-family/{slug}",
              auth: "public",
              description: "Get patron family by slug"
            },
            {
              method: "GET",
              path: "/saints/today",
              auth: "public",
              description: "Get saint of the day"
            },
            {
              method: "GET",
              path: "/saints/search",
              auth: "public",
              description: "Search saints"
            },
            {
              method: "GET",
              path: "/saints/random",
              auth: "public",
              description: "Get random saint"
            },
            {
              method: "GET",
              path: "/saints/by-feast-month",
              auth: "public",
              description: "Get saints by feast month"
            },
            {
              method: "GET",
              path: "/saints/find-by-name",
              auth: "public",
              description: "Find saint by name"
            },
            {
              method: "GET",
              path: "/saints/{id}",
              auth: "public",
              description: "Get specific saint"
            },
            {
              method: "POST",
              path: "/saints",
              auth: "admin",
              description: "Create saint (Admin only)"
            },
            {
              method: "PUT",
              path: "/saints/{id}",
              auth: "admin",
              description: "Update saint (Admin only)"
            },
            {
              method: "DELETE",
              path: "/saints/{id}",
              auth: "admin",
              description: "Delete saint (Admin only)"
            }
          ]
        },
        // Novenas
        novenas: {
          name: "Novenas",
          icon: "fa-praying-hands",
          description: "Novena management and user participation.",
          endpoints: [{
              method: "GET",
              path: "/v1/novenas",
              auth: "required",
              description: "Get all novenas"
            },
            {
              method: "GET",
              path: "/v1/novenas/my-novenas",
              auth: "required",
              description: "Get user's active novenas"
            },
            {
              method: "POST",
              path: "/v1/novenas",
              auth: "admin",
              description: "Create novena (Admin only)"
            },
            {
              method: "GET",
              path: "/v1/novenas/{novena}",
              auth: "required",
              description: "Get specific novena"
            },
            {
              method: "PUT",
              path: "/v1/novenas/{novena}",
              auth: "admin",
              description: "Update novena (Admin only)"
            },
            {
              method: "DELETE",
              path: "/v1/novenas/{novena}",
              auth: "admin",
              description: "Delete novena (Admin only)"
            },
            {
              method: "POST",
              path: "/v1/novenas/{novena}/publish",
              auth: "admin",
              description: "Publish novena"
            },
            {
              method: "POST",
              path: "/v1/novenas/{novena}/archive",
              auth: "admin",
              description: "Archive novena"
            },
            {
              method: "POST",
              path: "/v1/novenas/{novena}/duplicate",
              auth: "admin",
              description: "Duplicate novena"
            },
            {
              method: "POST",
              path: "/v1/novenas/{novena}/schedule",
              auth: "admin",
              description: "Schedule novena publication"
            },
            {
              method: "POST",
              path: "/v1/novenas/{novena}/start",
              auth: "required",
              description: "Start novena participation"
            },
            {
              method: "POST",
              path: "/v1/novenas/{novena}/day/{day}/complete",
              auth: "required",
              description: "Complete novena day"
            },
            {
              method: "GET",
              path: "/v1/novenas/{novena}/progress",
              auth: "required",
              description: "Get novena progress"
            },
            {
              method: "POST",
              path: "/v1/novenas/bulk",
              auth: "admin",
              description: "Bulk actions on novenas"
            }
          ]
        },
        // Rosary Mysteries
        rosary: {
          name: "Rosary Mysteries",
          icon: "fa-beads",
          description: "Rosary mystery management.",
          endpoints: [{
              method: "GET",
              path: "/rosary/mysteries",
              auth: "public",
              description: "Get all mysteries"
            },
            {
              method: "GET",
              path: "/rosary/mysteries/mystery-of-the-day",
              auth: "public",
              description: "Get mystery of the day"
            },
            {
              method: "GET",
              path: "/rosary/mysteries/date-range",
              auth: "public",
              description: "Get mysteries by date range"
            },
            {
              method: "GET",
              path: "/rosary/mysteries/types",
              auth: "public",
              description: "Get mystery types"
            },
            {
              method: "GET",
              path: "/rosary/mysteries/{id}",
              auth: "public",
              description: "Get specific mystery"
            },
            {
              method: "POST",
              path: "/rosary/mysteries",
              auth: "admin",
              description: "Create mystery (Admin only)"
            },
            {
              method: "PUT",
              path: "/rosary/mysteries/{id}",
              auth: "admin",
              description: "Update mystery (Admin only)"
            },
            {
              method: "DELETE",
              path: "/rosary/mysteries/{id}",
              auth: "admin",
              description: "Delete mystery (Admin only)"
            }
          ]
        },
        // Prayer Requests
        prayerRequests: {
          name: "Prayer Requests",
          icon: "fa-hands-praying",
          description: "Community prayer requests.",
          endpoints: [{
              method: "GET",
              path: "/prayer-requests",
              auth: "public",
              description: "Get all prayer requests"
            },
            {
              method: "GET",
              path: "/prayer-requests/statistics",
              auth: "public",
              description: "Get prayer statistics"
            },
            {
              method: "POST",
              path: "/prayer-requests",
              auth: "required",
              description: "Submit prayer request"
            },
            {
              method: "GET",
              path: "/prayer-requests/{id}",
              auth: "public",
              description: "Get specific request"
            },
            {
              method: "PUT",
              path: "/prayer-requests/{id}",
              auth: "required",
              description: "Update own request"
            },
            {
              method: "DELETE",
              path: "/prayer-requests/{id}",
              auth: "required",
              description: "Delete own request"
            },
            {
              method: "POST",
              path: "/prayer-requests/{id}/pray",
              auth: "required",
              description: "Add prayer for request"
            },
            {
              method: "POST",
              path: "/prayer-requests/{id}/responses",
              auth: "required",
              description: "Add response to request"
            }
          ]
        },
        // Membership
        membership: {
          name: "Membership",
          icon: "fa-users",
          description: "Member management and suspension handling.",
          endpoints: [{
              method: "GET",
              path: "/members",
              auth: "admin",
              description: "Get all members with filters"
            },
            {
              method: "GET",
              path: "/members/stats",
              auth: "admin",
              description: "Get member statistics"
            },
            {
              method: "GET",
              path: "/members/trend",
              auth: "admin",
              description: "Get membership trend"
            },
            {
              method: "GET",
              path: "/members/online",
              auth: "admin",
              description: "Get online members"
            },
            {
              method: "GET",
              path: "/members/export",
              auth: "admin",
              description: "Export members data"
            },
            {
              method: "GET",
              path: "/members/suspended",
              auth: "admin",
              description: "Get suspended members"
            },
            {
              method: "GET",
              path: "/members/suspension-status",
              auth: "required",
              description: "Get current user suspension status"
            },
            {
              method: "GET",
              path: "/members/suspension-stats",
              auth: "admin",
              description: "Get suspension statistics"
            },
            {
              method: "GET",
              path: "/members/violation-codes",
              auth: "admin",
              description: "Get violation codes"
            },
            {
              method: "GET",
              path: "/members/{id}",
              auth: "admin",
              description: "Get member by ID"
            },
            {
              method: "GET",
              path: "/members/member-id/{memberId}",
              auth: "admin",
              description: "Find by member ID"
            },
            {
              method: "GET",
              path: "/members/{userId}/suspension-history",
              auth: "admin",
              description: "Get suspension history"
            },
            {
              method: "PUT",
              path: "/members/role",
              auth: "admin",
              description: "Update member role"
            },
            {
              method: "POST",
              path: "/members/suspend",
              auth: "admin",
              description: "Suspend a member"
            },
            {
              method: "POST",
              path: "/members/lift-suspension",
              auth: "admin",
              description: "Lift suspension"
            },
            {
              method: "POST",
              path: "/members/appeal",
              auth: "required",
              description: "Submit suspension appeal"
            },
            {
              method: "POST",
              path: "/members/appeal/{suspensionId}",
              auth: "admin",
              description: "Process appeal"
            },
            {
              method: "POST",
              path: "/members/bulk-action",
              auth: "admin",
              description: "Bulk member actions"
            }
          ]
        },
        // SCC (Small Christian Communities)
        scc: {
          name: "Small Christian Communities",
          icon: "fa-church",
          description: "SCC management and coordination.",
          endpoints: [{
              method: "GET",
              path: "/scc/my-scc",
              auth: "required",
              description: "Get user's SCC"
            },
            {
              method: "GET",
              path: "/scc/available",
              auth: "required",
              description: "Get available SCCs to join"
            },
            {
              method: "GET",
              path: "/scc/leaders-directory",
              auth: "required",
              description: "Get SCC leaders directory"
            },
            {
              method: "GET",
              path: "/scc",
              auth: "coordinator",
              description: "Get all SCCs"
            },
            {
              method: "POST",
              path: "/scc",
              auth: "coordinator",
              description: "Create SCC"
            },
            {
              method: "GET",
              path: "/scc/reports/membership",
              auth: "coordinator",
              description: "Get membership reports"
            },
            {
              method: "GET",
              path: "/scc/unassigned-members",
              auth: "coordinator",
              description: "Get unassigned members"
            },
            {
              method: "GET",
              path: "/scc/coordinator/dashboard",
              auth: "coordinator",
              description: "Coordinator dashboard"
            },
            {
              method: "GET",
              path: "/scc/by-code/{code}",
              auth: "required",
              description: "Find SCC by invite code"
            },
            {
              method: "GET",
              path: "/scc/{scc}",
              auth: "required",
              description: "Get specific SCC"
            },
            {
              method: "PUT",
              path: "/scc/{scc}",
              auth: "coordinator",
              description: "Update SCC"
            },
            {
              method: "DELETE",
              path: "/scc/{scc}",
              auth: "coordinator",
              description: "Delete SCC"
            },
            {
              method: "GET",
              path: "/scc/{scc}/members",
              auth: "required",
              description: "Get SCC members"
            },
            {
              method: "POST",
              path: "/scc/{scc}/members",
              auth: "coordinator",
              description: "Assign member to SCC"
            },
            {
              method: "POST",
              path: "/scc/{scc}/assign-leader",
              auth: "coordinator",
              description: "Assign leadership"
            },
            {
              method: "DELETE",
              path: "/scc/{scc}/members/{profile}",
              auth: "coordinator",
              description: "Remove member"
            },
            {
              method: "GET",
              path: "/scc/{scc}/meetings",
              auth: "required",
              description: "Get SCC meetings"
            },
            {
              method: "POST",
              path: "/scc/{scc}/meetings",
              auth: "coordinator",
              description: "Create meeting"
            },
            {
              method: "GET",
              path: "/scc/{scc}/meetings/{meeting}/attendance",
              auth: "coordinator",
              description: "Get meeting attendance"
            },
            {
              method: "POST",
              path: "/scc/{scc}/meetings/{meeting}/attendance",
              auth: "coordinator",
              description: "Mark attendance"
            },
            {
              method: "GET",
              path: "/scc/{scc}/attendance-summary",
              auth: "coordinator",
              description: "Attendance summary"
            }
          ]
        },
        // Prayer Partners
        prayerPartners: {
          name: "Prayer Partners",
          icon: "fa-handshake",
          description: "SCC-based prayer partner system.",
          endpoints: [{
              method: "POST",
              path: "/scc/{scc}/prayer-partners/intention",
              auth: "required",
              description: "Submit prayer intention"
            },
            {
              method: "POST",
              path: "/scc/{scc}/prayer-partners/assign",
              auth: "coordinator",
              description: "Assign prayer partners"
            },
            {
              method: "GET",
              path: "/scc/{scc}/prayer-partners/my",
              auth: "required",
              description: "Get my prayer partners"
            },
            {
              method: "POST",
              path: "/scc/{scc}/prayer-partners/{prayerPartner}/complete",
              auth: "required",
              description: "Complete prayer session"
            },
            {
              method: "POST",
              path: "/scc/{scc}/prayer-partners/{prayerPartner}/increment",
              auth: "required",
              description: "Increment prayer count"
            },
            {
              method: "GET",
              path: "/scc/{scc}/prayer-partners/stats",
              auth: "coordinator",
              description: "Get prayer statistics"
            }
          ]
        },
        // Sacramental
        sacramental: {
          name: "Sacramental Management",
          icon: "fa-cross",
          description: "Sacraments and catechism management.",
          endpoints: [{
              method: "GET",
              path: "/liturgy/sacramental/users",
              auth: "liturgy_coordinator",
              description: "Get sacramental users"
            },
            {
              method: "GET",
              path: "/liturgy/sacramental/users/{id}",
              auth: "liturgy_coordinator",
              description: "Get specific user"
            },
            {
              method: "GET",
              path: "/liturgy/sacramental/statistics",
              auth: "liturgy_coordinator",
              description: "Get statistics"
            },
            {
              method: "GET",
              path: "/liturgy/sacramental/export",
              auth: "liturgy_coordinator",
              description: "Export sacramental data"
            },
            {
              method: "PUT",
              path: "/liturgy/catechism-requests/{id}",
              auth: "liturgy_coordinator",
              description: "Update catechism request"
            },
            {
              method: "PUT",
              path: "/liturgy/catechism-requests/bulk",
              auth: "liturgy_coordinator",
              description: "Bulk update requests"
            },
            {
              method: "PUT",
              path: "/liturgy/certificates/{id}/verify",
              auth: "liturgy_coordinator",
              description: "Verify certificate"
            }
          ]
        },
        // Catechumen
        catechumen: {
          name: "Catechumen",
          icon: "fa-child",
          description: "Catechumen enrollment and tracking.",
          endpoints: [{
              method: "GET",
              path: "/liturgy/catechumen",
              auth: "liturgy_coordinator",
              description: "Get all catechumens"
            },
            {
              method: "GET",
              path: "/liturgy/catechumen/{id}",
              auth: "liturgy_coordinator",
              description: "Get specific catechumen"
            },
            {
              method: "GET",
              path: "/liturgy/catechumen/available-users",
              auth: "liturgy_coordinator",
              description: "Get available users"
            },
            {
              method: "POST",
              path: "/liturgy/catechumen/enroll",
              auth: "liturgy_coordinator",
              description: "Enroll catechumen"
            },
            {
              method: "PUT",
              path: "/liturgy/catechumen/{id}",
              auth: "liturgy_coordinator",
              description: "Update catechumen"
            },
            {
              method: "GET",
              path: "/liturgy/catechumen/export",
              auth: "liturgy_coordinator",
              description: "Export data"
            },
            {
              method: "POST",
              path: "/liturgy/catechumen/bulk-enroll",
              auth: "liturgy_coordinator",
              description: "Bulk enrollment"
            }
          ]
        },
        // Catechism Requests
        catechismRequests: {
          name: "Catechism Requests",
          icon: "fa-scroll",
          description: "Catechism class requests.",
          endpoints: [{
              method: "POST",
              path: "/catechism-requests",
              auth: "required",
              description: "Submit catechism request"
            },
            {
              method: "GET",
              path: "/catechism-requests/my-requests",
              auth: "required",
              description: "Get user's requests"
            },
            {
              method: "GET",
              path: "/catechism-requests/has-pending",
              auth: "required",
              description: "Check pending request"
            },
            {
              method: "GET",
              path: "/catechism-requests/pending",
              auth: "coordinator",
              description: "Get pending requests"
            },
            {
              method: "GET",
              path: "/catechism-requests/pending-certificates",
              auth: "coordinator",
              description: "Get pending certificates"
            },
            {
              method: "POST",
              path: "/catechism-requests/{id}/approve",
              auth: "coordinator",
              description: "Approve request"
            },
            {
              method: "POST",
              path: "/catechism-requests/{id}/reject",
              auth: "coordinator",
              description: "Reject request"
            },
            {
              method: "POST",
              path: "/catechism-requests/{id}/complete",
              auth: "coordinator",
              description: "Complete request"
            },
            {
              method: "POST",
              path: "/catechism-requests/{id}/verify-certificate",
              auth: "coordinator",
              description: "Verify certificate"
            }
          ]
        },
        // Family Requests
        familyRequests: {
          name: "Family Requests",
          icon: "fa-family",
          description: "Family registration and verification.",
          endpoints: [{
              method: "POST",
              path: "/family-requests/{id}/approve",
              auth: "admin",
              description: "Approve family request"
            },
            {
              method: "POST",
              path: "/family-requests",
              auth: "required",
              description: "Submit family request"
            },
            {
              method: "GET",
              path: "/family-requests/my-requests",
              auth: "required",
              description: "Get user's requests"
            },
            {
              method: "GET",
              path: "/family-requests/pending",
              auth: "admin",
              description: "Get pending requests"
            },
            {
              method: "GET",
              path: "/family-requests/pending-verification",
              auth: "admin",
              description: "Get pending verification"
            },
            {
              method: "POST",
              path: "/family-requests/{id}/approve-verification",
              auth: "admin",
              description: "Approve verification"
            },
            {
              method: "POST",
              path: "/family-requests/{id}/reject-verification",
              auth: "admin",
              description: "Reject verification"
            },
            {
              method: "GET",
              path: "/family-requests/stats",
              auth: "admin",
              description: "Get statistics"
            },
            {
              method: "POST",
              path: "/family-requests/{id}/reject",
              auth: "admin",
              description: "Reject request"
            },
            {
              method: "POST",
              path: "/family-requests/bulk/approve",
              auth: "admin",
              description: "Bulk approve"
            },
            {
              method: "POST",
              path: "/family-requests/bulk/reject",
              auth: "admin",
              description: "Bulk reject"
            }
          ]
        },
        // User Family
        userFamily: {
          name: "User Family",
          icon: "fa-people-arrows",
          description: "User family relationships.",
          endpoints: [{
              method: "GET",
              path: "/user/family",
              auth: "required",
              description: "Get user's family"
            },
            {
              method: "GET",
              path: "/user/family/pending",
              auth: "required",
              description: "Check pending request"
            }
          ]
        },
        // Asset Management
        assets: {
          name: "Asset Management",
          icon: "fa-boxes",
          description: "Church asset tracking.",
          endpoints: [{
              method: "GET",
              path: "/assets",
              auth: "required",
              description: "Get all assets"
            },
            {
              method: "POST",
              path: "/assets",
              auth: "admin",
              description: "Create asset"
            },
            {
              method: "GET",
              path: "/assets/available",
              auth: "required",
              description: "Get available assets"
            },
            {
              method: "GET",
              path: "/assets/for-sale",
              auth: "required",
              description: "Get assets for sale"
            },
            {
              method: "GET",
              path: "/assets/statistics",
              auth: "admin",
              description: "Get asset statistics"
            },
            {
              method: "GET",
              path: "/assets/{id}",
              auth: "required",
              description: "Get specific asset"
            },
            {
              method: "PUT",
              path: "/assets/{id}",
              auth: "admin",
              description: "Update asset"
            },
            {
              method: "DELETE",
              path: "/assets/{id}",
              auth: "admin",
              description: "Delete asset"
            },
            {
              method: "PATCH",
              path: "/assets/{id}/status",
              auth: "admin",
              description: "Update asset status"
            }
          ]
        },
        // Bookings
        bookings: {
          name: "Bookings",
          icon: "fa-calendar-check",
          description: "Asset booking system.",
          endpoints: [{
              method: "GET",
              path: "/bookings/my-bookings",
              auth: "required",
              description: "Get user's bookings"
            },
            {
              method: "GET",
              path: "/bookings/summary",
              auth: "admin",
              description: "Get booking summary"
            },
            {
              method: "GET",
              path: "/bookings/statistics",
              auth: "admin",
              description: "Get booking statistics"
            },
            {
              method: "GET",
              path: "/bookings/overdue",
              auth: "admin",
              description: "Get overdue bookings"
            },
            {
              method: "GET",
              path: "/bookings/calendar",
              auth: "required",
              description: "Get booking calendar"
            },
            {
              method: "POST",
              path: "/bookings/check-availability",
              auth: "required",
              description: "Check asset availability"
            },
            {
              method: "GET",
              path: "/bookings/asset/{assetId}/available-dates",
              auth: "required",
              description: "Get available dates"
            },
            {
              method: "GET",
              path: "/bookings",
              auth: "required",
              description: "Get all bookings"
            },
            {
              method: "POST",
              path: "/bookings",
              auth: "required",
              description: "Create booking"
            },
            {
              method: "GET",
              path: "/bookings/{id}",
              auth: "required",
              description: "Get specific booking"
            },
            {
              method: "POST",
              path: "/bookings/{id}/approve",
              auth: "admin",
              description: "Approve booking"
            },
            {
              method: "POST",
              path: "/bookings/{id}/return",
              auth: "admin",
              description: "Mark as returned"
            },
            {
              method: "POST",
              path: "/bookings/{id}/cancel",
              auth: "required",
              description: "Cancel booking"
            },
            {
              method: "POST",
              path: "/bookings/{id}/extend",
              auth: "required",
              description: "Extend booking"
            }
          ]
        },
        // Penalties
        penalties: {
          name: "Penalties",
          icon: "fa-exclamation-triangle",
          description: "Booking penalty management.",
          endpoints: [{
              method: "GET",
              path: "/penalties/my-penalties",
              auth: "required",
              description: "Get user's penalties"
            },
            {
              method: "GET",
              path: "/penalties/statistics",
              auth: "admin",
              description: "Get penalty statistics"
            },
            {
              method: "GET",
              path: "/penalties",
              auth: "admin",
              description: "Get all penalties"
            },
            {
              method: "POST",
              path: "/penalties/{id}/pay",
              auth: "required",
              description: "Pay penalty"
            },
            {
              method: "POST",
              path: "/penalties/{id}/waive",
              auth: "admin",
              description: "Waive penalty"
            }
          ]
        },
        // Sales
        sales: {
          name: "Sales",
          icon: "fa-tag",
          description: "Asset sales tracking.",
          endpoints: [{
              method: "GET",
              path: "/sales",
              auth: "required",
              description: "Get all sales"
            },
            {
              method: "POST",
              path: "/sales",
              auth: "required",
              description: "Create sale request"
            },
            {
              method: "GET",
              path: "/sales/statistics",
              auth: "admin",
              description: "Get sales statistics"
            },
            {
              method: "GET",
              path: "/sales/{id}",
              auth: "required",
              description: "Get specific sale"
            },
            {
              method: "POST",
              path: "/sales/{id}/approve",
              auth: "admin",
              description: "Approve sale"
            },
            {
              method: "POST",
              path: "/sales/{id}/mark-sold",
              auth: "admin",
              description: "Mark as sold"
            },
            {
              method: "POST",
              path: "/sales/{id}/cancel",
              auth: "required",
              description: "Cancel sale"
            }
          ]
        },
        // Maintenance
        maintenance: {
          name: "Maintenance",
          icon: "fa-tools",
          description: "Asset maintenance tracking.",
          endpoints: [{
              method: "GET",
              path: "/maintenance",
              auth: "admin",
              description: "Get all maintenance records"
            },
            {
              method: "POST",
              path: "/maintenance",
              auth: "admin",
              description: "Create maintenance record"
            },
            {
              method: "GET",
              path: "/maintenance/upcoming",
              auth: "admin",
              description: "Get upcoming maintenance"
            },
            {
              method: "GET",
              path: "/maintenance/overdue",
              auth: "admin",
              description: "Get overdue maintenance"
            },
            {
              method: "GET",
              path: "/maintenance/statistics",
              auth: "admin",
              description: "Get statistics"
            },
            {
              method: "GET",
              path: "/maintenance/asset/{assetId}",
              auth: "admin",
              description: "Get asset history"
            },
            {
              method: "GET",
              path: "/maintenance/{id}",
              auth: "admin",
              description: "Get specific record"
            },
            {
              method: "POST",
              path: "/maintenance/{id}/complete",
              auth: "admin",
              description: "Complete maintenance"
            },
            {
              method: "PATCH",
              path: "/maintenance/{id}/status",
              auth: "admin",
              description: "Update status"
            }
          ]
        },
        // Categories
        categories: {
          name: "Categories",
          icon: "fa-tags",
          description: "Asset category management.",
          endpoints: [{
              method: "GET",
              path: "/categories",
              auth: "required",
              description: "Get all categories"
            },
            {
              method: "POST",
              path: "/categories",
              auth: "admin",
              description: "Create category"
            },
            {
              method: "GET",
              path: "/categories/{id}",
              auth: "required",
              description: "Get specific category"
            },
            {
              method: "PUT",
              path: "/categories/{id}",
              auth: "admin",
              description: "Update category"
            },
            {
              method: "DELETE",
              path: "/categories/{id}",
              auth: "admin",
              description: "Delete category"
            },
            {
              method: "PATCH",
              path: "/categories/{id}/toggle-status",
              auth: "admin",
              description: "Toggle category status"
            }
          ]
        },
        // Semester Registration
        semester: {
          name: "Semester Registration",
          icon: "fa-graduation-cap",
          description: "Semester registration and payment tracking.",
          endpoints: [{
              method: "GET",
              path: "/semester/current",
              auth: "required",
              description: "Get current semester"
            },
            {
              method: "GET",
              path: "/semester/check-eligibility",
              auth: "required",
              description: "Check registration eligibility"
            },
            {
              method: "GET",
              path: "/semester/my-registration",
              auth: "required",
              description: "Get user's registration"
            },
            {
              method: "POST",
              path: "/semester/register",
              auth: "required",
              description: "Register for semester"
            },
            {
              method: "POST",
              path: "/semester/registrations/{registration}/payment",
              auth: "required",
              description: "Record payment"
            },
            {
              method: "GET",
              path: "/semester/registrations",
              auth: "admin",
              description: "Get all registrations"
            },
            {
              method: "GET",
              path: "/semester/registrations/pending/count",
              auth: "admin",
              description: "Get pending verifications count"
            },
            {
              method: "POST",
              path: "/semester/registrations/{registration}/verify",
              auth: "admin",
              description: "Verify registration"
            },
            {
              method: "POST",
              path: "/semester/registrations/{registration}/reject",
              auth: "admin",
              description: "Reject registration"
            },
            {
              method: "GET",
              path: "/semester/reports",
              auth: "admin",
              description: "Get reports"
            },
            {
              method: "GET",
              path: "/semester/payments/summary",
              auth: "admin",
              description: "Get payment summary"
            },
            {
              method: "GET",
              path: "/semester/semesters",
              auth: "admin",
              description: "Get all semesters"
            },
            {
              method: "POST",
              path: "/semester/semesters",
              auth: "admin",
              description: "Create semester"
            },
            {
              method: "POST",
              path: "/semester/semesters/{semester}/set-current",
              auth: "admin",
              description: "Set current semester"
            }
          ]
        },
        // Welfare Services
        welfare: {
          name: "Welfare Services",
          icon: "fa-hand-holding-heart",
          description: "Church welfare and assistance programs.",
          endpoints: [{
              method: "GET",
              path: "/welfare/requests",
              auth: "required",
              description: "Get welfare requests"
            },
            {
              method: "GET",
              path: "/welfare/requests/my",
              auth: "required",
              description: "Get user's requests"
            },
            {
              method: "GET",
              path: "/welfare/requests/pending",
              auth: "admin",
              description: "Get pending requests"
            },
            {
              method: "POST",
              path: "/welfare/requests",
              auth: "required",
              description: "Submit welfare request"
            },
            {
              method: "GET",
              path: "/welfare/requests/{id}",
              auth: "required",
              description: "Get specific request"
            },
            {
              method: "PUT",
              path: "/welfare/requests/{id}",
              auth: "required",
              description: "Update own request"
            },
            {
              method: "DELETE",
              path: "/welfare/requests/{id}",
              auth: "required",
              description: "Cancel request"
            },
            {
              method: "GET",
              path: "/welfare/statistics",
              auth: "admin",
              description: "Get statistics"
            },
            {
              method: "POST",
              path: "/welfare/requests/{id}/review",
              auth: "admin",
              description: "Review request"
            },
            {
              method: "POST",
              path: "/welfare/requests/{id}/approve",
              auth: "admin",
              description: "Approve request"
            },
            {
              method: "POST",
              path: "/welfare/requests/{id}/reject",
              auth: "admin",
              description: "Reject request"
            }
          ]
        },
        // Bereavement
        bereavement: {
          name: "Bereavement",
          icon: "fa-heart-broken",
          description: "Bereavement support cases.",
          endpoints: [{
              method: "GET",
              path: "/welfare/bereavement",
              auth: "required",
              description: "Get bereavement cases"
            },
            {
              method: "GET",
              path: "/welfare/bereavement/my",
              auth: "required",
              description: "Get user's cases"
            },
            {
              method: "GET",
              path: "/welfare/bereavement/pending",
              auth: "admin",
              description: "Get pending cases"
            },
            {
              method: "POST",
              path: "/welfare/bereavement",
              auth: "required",
              description: "Report bereavement"
            },
            {
              method: "GET",
              path: "/welfare/bereavement/{id}",
              auth: "required",
              description: "Get specific case"
            },
            {
              method: "PUT",
              path: "/welfare/bereavement/{id}",
              auth: "required",
              description: "Update case"
            },
            {
              method: "DELETE",
              path: "/welfare/bereavement/{id}",
              auth: "required",
              description: "Delete case"
            },
            {
              method: "POST",
              path: "/welfare/bereavement/{id}/visited",
              auth: "admin",
              description: "Mark as visited"
            },
            {
              method: "POST",
              path: "/welfare/bereavement/{id}/supported",
              auth: "admin",
              description: "Mark as supported"
            },
            {
              method: "POST",
              path: "/welfare/bereavement/{id}/close",
              auth: "admin",
              description: "Close case"
            }
          ]
        },
        // Sick Visits
        sickVisits: {
          name: "Sick Visits",
          icon: "fa-procedures",
          description: "Sick visitation management.",
          endpoints: [{
              method: "GET",
              path: "/welfare/sick-visits",
              auth: "required",
              description: "Get sick visits"
            },
            {
              method: "GET",
              path: "/welfare/sick-visits/my",
              auth: "required",
              description: "Get user's visits"
            },
            {
              method: "GET",
              path: "/welfare/sick-visits/upcoming",
              auth: "admin",
              description: "Get upcoming visits"
            },
            {
              method: "POST",
              path: "/welfare/sick-visits",
              auth: "required",
              description: "Request sick visit"
            },
            {
              method: "GET",
              path: "/welfare/sick-visits/{id}",
              auth: "required",
              description: "Get specific visit"
            },
            {
              method: "PUT",
              path: "/welfare/sick-visits/{id}",
              auth: "required",
              description: "Update visit"
            },
            {
              method: "DELETE",
              path: "/welfare/sick-visits/{id}",
              auth: "required",
              description: "Cancel visit"
            },
            {
              method: "POST",
              path: "/welfare/sick-visits/{id}/complete",
              auth: "admin",
              description: "Complete visit"
            },
            {
              method: "POST",
              path: "/welfare/sick-visits/{id}/cancel",
              auth: "admin",
              description: "Cancel visit"
            }
          ]
        },
        // Counseling
        counseling: {
          name: "Counseling",
          icon: "fa-comments",
          description: "Counseling session management.",
          endpoints: [{
              method: "GET",
              path: "/welfare/counseling/statistics",
              auth: "admin",
              description: "Get counseling statistics"
            },
            {
              method: "GET",
              path: "/welfare/counseling",
              auth: "required",
              description: "Get counseling sessions"
            },
            {
              method: "GET",
              path: "/welfare/counseling/my",
              auth: "required",
              description: "Get user's sessions"
            },
            {
              method: "GET",
              path: "/welfare/counseling/pending",
              auth: "admin",
              description: "Get pending sessions"
            },
            {
              method: "POST",
              path: "/welfare/counseling",
              auth: "required",
              description: "Request counseling"
            },
            {
              method: "GET",
              path: "/welfare/counseling/{id}",
              auth: "required",
              description: "Get specific session"
            },
            {
              method: "PUT",
              path: "/welfare/counseling/{id}",
              auth: "required",
              description: "Update session"
            },
            {
              method: "DELETE",
              path: "/welfare/counseling/{id}",
              auth: "required",
              description: "Cancel session"
            },
            {
              method: "POST",
              path: "/welfare/counseling/{id}/schedule",
              auth: "admin",
              description: "Schedule session"
            },
            {
              method: "POST",
              path: "/welfare/counseling/{id}/complete",
              auth: "admin",
              description: "Complete session"
            },
            {
              method: "POST",
              path: "/welfare/counseling/{id}/feedback",
              auth: "required",
              description: "Add feedback"
            }
          ]
        },
        // Basic Needs
        basicNeeds: {
          name: "Basic Needs",
          icon: "fa-bread-slice",
          description: "Basic needs assistance.",
          endpoints: [{
              method: "GET",
              path: "/welfare/basic-needs",
              auth: "required",
              description: "Get basic needs requests"
            },
            {
              method: "GET",
              path: "/welfare/basic-needs/my",
              auth: "required",
              description: "Get user's requests"
            },
            {
              method: "GET",
              path: "/welfare/basic-needs/pending",
              auth: "admin",
              description: "Get pending requests"
            },
            {
              method: "POST",
              path: "/welfare/basic-needs",
              auth: "required",
              description: "Submit request"
            },
            {
              method: "GET",
              path: "/welfare/basic-needs/{id}",
              auth: "required",
              description: "Get specific request"
            },
            {
              method: "PUT",
              path: "/welfare/basic-needs/{id}",
              auth: "required",
              description: "Update request"
            },
            {
              method: "DELETE",
              path: "/welfare/basic-needs/{id}",
              auth: "required",
              description: "Cancel request"
            },
            {
              method: "POST",
              path: "/welfare/basic-needs/{id}/approve",
              auth: "admin",
              description: "Approve request"
            },
            {
              method: "POST",
              path: "/welfare/basic-needs/{id}/provide",
              auth: "admin",
              description: "Mark as provided"
            },
            {
              method: "POST",
              path: "/welfare/basic-needs/{id}/reject",
              auth: "admin",
              description: "Reject request"
            }
          ]
        },
        // Hospitality
        hospitality: {
          name: "Hospitality",
          icon: "fa-utensils",
          description: "Hospitality ministry management.",
          endpoints: [{
              method: "GET",
              path: "/hospitality/meal-plans",
              auth: "required",
              description: "Get meal plans"
            },
            {
              method: "GET",
              path: "/hospitality/meal-plans/statistics",
              auth: "admin",
              description: "Get meal plan statistics"
            },
            {
              method: "GET",
              path: "/hospitality/meal-plans/export",
              auth: "admin",
              description: "Export meal plans"
            },
            {
              method: "POST",
              path: "/hospitality/meal-plans",
              auth: "admin",
              description: "Create meal plan"
            },
            {
              method: "PUT",
              path: "/hospitality/meal-plans/{id}",
              auth: "admin",
              description: "Update meal plan"
            },
            {
              method: "DELETE",
              path: "/hospitality/meal-plans/{id}",
              auth: "admin",
              description: "Delete meal plan"
            },
            {
              method: "GET",
              path: "/hospitality/committee",
              auth: "required",
              description: "Get committee members"
            },
            {
              method: "POST",
              path: "/hospitality/committee",
              auth: "admin",
              description: "Add committee member"
            },
            {
              method: "GET",
              path: "/hospitality/hygiene-inspections",
              auth: "required",
              description: "Get inspections"
            },
            {
              method: "POST",
              path: "/hospitality/hygiene-inspections",
              auth: "admin",
              description: "Create inspection"
            },
            {
              method: "GET",
              path: "/hospitality/decorations",
              auth: "required",
              description: "Get decorations inventory"
            },
            {
              method: "GET",
              path: "/hospitality/decorations/low-stock",
              auth: "admin",
              description: "Get low stock items"
            },
            {
              method: "POST",
              path: "/hospitality/decorations",
              auth: "admin",
              description: "Add decoration"
            },
            {
              method: "GET",
              path: "/hospitality/event-decorations",
              auth: "required",
              description: "Get event decorations"
            },
            {
              method: "POST",
              path: "/hospitality/event-decorations",
              auth: "admin",
              description: "Create event decoration"
            },
            {
              method: "GET",
              path: "/hospitality/utensil-checkouts",
              auth: "required",
              description: "Get utensil checkouts"
            },
            {
              method: "GET",
              path: "/hospitality/utensil-checkouts/statistics",
              auth: "admin",
              description: "Get utensil stats"
            },
            {
              method: "GET",
              path: "/hospitality/utensil-checkouts/my",
              auth: "required",
              description: "Get my checkouts"
            },
            {
              method: "POST",
              path: "/hospitality/utensil-checkouts/checkout",
              auth: "required",
              description: "Checkout utensils"
            },
            {
              method: "POST",
              path: "/hospitality/utensil-checkouts/{id}/return",
              auth: "required",
              description: "Return utensils"
            },
            {
              method: "GET",
              path: "/hospitality/dashboard/summary",
              auth: "admin",
              description: "Get dashboard summary"
            }
          ]
        },
        // Printing Services
        printing: {
          name: "Printing Services",
          icon: "fa-print",
          description: "Printing job management.",
          endpoints: [{
              method: "GET",
              path: "/printing/my-jobs",
              auth: "required",
              description: "Get user's print jobs"
            },
            {
              method: "GET",
              path: "/printing/my-jobs/{id}",
              auth: "required",
              description: "Get specific job"
            },
            {
              method: "POST",
              path: "/printing/jobs",
              auth: "required",
              description: "Create print job"
            },
            {
              method: "POST",
              path: "/printing/jobs/{id}/cancel",
              auth: "required",
              description: "Cancel job"
            },
            {
              method: "GET",
              path: "/printing/credits/balance",
              auth: "required",
              description: "Get credit balance"
            },
            {
              method: "POST",
              path: "/printing/credits/add",
              auth: "required",
              description: "Add credits"
            },
            {
              method: "GET",
              path: "/printing/transactions",
              auth: "required",
              description: "Get transaction history"
            },
            {
              method: "GET",
              path: "/printing/pricing",
              auth: "required",
              description: "Get pricing info"
            },
            {
              method: "GET",
              path: "/printing/all-jobs",
              auth: "admin",
              description: "Get all jobs"
            },
            {
              method: "PUT",
              path: "/printing/jobs/{id}/status",
              auth: "admin",
              description: "Update job status"
            },
            {
              method: "POST",
              path: "/printing/jobs/{id}/pay",
              auth: "admin",
              description: "Mark as paid"
            }
          ]
        },
        // Upload Management
        uploads: {
          name: "Upload Management",
          icon: "fa-upload",
          description: "File upload handling.",
          endpoints: [{
              method: "POST",
              path: "/upload/profile-photo",
              auth: "required",
              description: "Upload profile photo"
            },
            {
              method: "POST",
              path: "/upload/baptismal-certificate",
              auth: "required",
              description: "Upload baptismal certificate"
            },
            {
              method: "POST",
              path: "/upload/document",
              auth: "required",
              description: "Upload document"
            },
            {
              method: "POST",
              path: "/upload/bulk",
              auth: "admin",
              description: "Bulk upload documents"
            },
            {
              method: "GET",
              path: "/upload/my-uploads",
              auth: "required",
              description: "Get user's uploads"
            },
            {
              method: "GET",
              path: "/upload/{id}",
              auth: "required",
              description: "Get specific upload"
            },
            {
              method: "DELETE",
              path: "/upload/{id}",
              auth: "required",
              description: "Delete file"
            }
          ]
        },
        // Notifications
        notifications: {
          name: "Notifications",
          icon: "fa-bell",
          description: "User notification management.",
          endpoints: [{
              method: "GET",
              path: "/notifications",
              auth: "required",
              description: "Get user's notifications"
            },
            {
              method: "GET",
              path: "/notifications/unread-count",
              auth: "required",
              description: "Get unread count"
            },
            {
              method: "GET",
              path: "/notifications/stats",
              auth: "required",
              description: "Get notification statistics"
            },
            {
              method: "GET",
              path: "/notifications/latest",
              auth: "required",
              description: "Get latest notifications"
            },
            {
              method: "PUT",
              path: "/notifications/{id}/read",
              auth: "required",
              description: "Mark as read"
            },
            {
              method: "PUT",
              path: "/notifications/{id}/unread",
              auth: "required",
              description: "Mark as unread"
            },
            {
              method: "PUT",
              path: "/notifications/mark-all-read",
              auth: "required",
              description: "Mark all as read"
            },
            {
              method: "POST",
              path: "/notifications/bulk-read",
              auth: "required",
              description: "Bulk mark as read"
            },
            {
              method: "POST",
              path: "/notifications/bulk-delete",
              auth: "required",
              description: "Bulk delete"
            },
            {
              method: "DELETE",
              path: "/notifications/delete-read",
              auth: "required",
              description: "Delete all read"
            },
            {
              method: "DELETE",
              path: "/notifications/{id}",
              auth: "required",
              description: "Delete notification"
            }
          ]
        },
        // Feedback
        feedback: {
          name: "Feedback",
          icon: "fa-star",
          description: "User feedback system.",
          endpoints: [{
              method: "POST",
              path: "/feedback/{type}/{id}",
              auth: "required",
              description: "Submit feedback"
            },
            {
              method: "GET",
              path: "/feedback/{type}/{id}",
              auth: "required",
              description: "Get feedback for resource"
            },
            {
              method: "GET",
              path: "/feedback/{type}/{id}/statistics",
              auth: "required",
              description: "Get feedback statistics"
            },
            {
              method: "PATCH",
              path: "/feedback/{feedbackId}/approve",
              auth: "admin",
              description: "Approve feedback"
            },
            {
              method: "DELETE",
              path: "/feedback/{feedbackId}",
              auth: "admin",
              description: "Delete feedback"
            }
          ]
        },
        // Help Articles
        help: {
          name: "Help Center",
          icon: "fa-question-circle",
          description: "Help articles and FAQs.",
          endpoints: [{
              method: "GET",
              path: "/help/articles",
              auth: "public",
              description: "Get all articles"
            },
            {
              method: "GET",
              path: "/help/articles/{slug}",
              auth: "public",
              description: "Get specific article"
            },
            {
              method: "GET",
              path: "/help/categories",
              auth: "public",
              description: "Get categories"
            },
            {
              method: "GET",
              path: "/help/search",
              auth: "public",
              description: "Search articles"
            },
            {
              method: "GET",
              path: "/help/popular",
              auth: "public",
              description: "Get popular articles"
            },
            {
              method: "GET",
              path: "/help/faqs",
              auth: "public",
              description: "Get FAQs"
            },
            {
              method: "POST",
              path: "/help/articles/{id}/rate",
              auth: "required",
              description: "Rate article"
            }
          ]
        },
        // Support Tickets
        support: {
          name: "Support Tickets",
          icon: "fa-ticket-alt",
          description: "Technical support ticket system.",
          endpoints: [{
              method: "GET",
              path: "/support/tickets",
              auth: "required",
              description: "Get user's tickets"
            },
            {
              method: "GET",
              path: "/support/tickets/stats",
              auth: "required",
              description: "Get ticket statistics"
            },
            {
              method: "POST",
              path: "/support/tickets",
              auth: "required",
              description: "Create ticket"
            },
            {
              method: "GET",
              path: "/support/tickets/{id}",
              auth: "required",
              description: "Get specific ticket"
            },
            {
              method: "POST",
              path: "/support/tickets/{id}/reply",
              auth: "required",
              description: "Reply to ticket"
            },
            {
              method: "PATCH",
              path: "/support/tickets/{id}/close",
              auth: "required",
              description: "Close ticket"
            },
            {
              method: "PATCH",
              path: "/support/tickets/{id}/reopen",
              auth: "required",
              description: "Reopen ticket"
            }
          ]
        },
        // System
        system: {
          name: "System",
          icon: "fa-server",
          description: "System monitoring and status.",
          endpoints: [{
              method: "GET",
              path: "/system/uptime",
              auth: "public",
              description: "Get system uptime"
            },
            {
              method: "GET",
              path: "/system/health",
              auth: "public",
              description: "Get system health"
            },
            {
              method: "GET",
              path: "/system/info",
              auth: "public",
              description: "Get system information"
            },
            {
              method: "GET",
              path: "/system/metrics",
              auth: "public",
              description: "Get system metrics"
            }
          ]
        }
      }
    };

    // Build navigation and content
    function buildDocumentation() {
      const navMenu = document.getElementById('navMenu');
      const apiContent = document.getElementById('apiContent');
      let navHtml = '';
      let contentHtml = '';
      let totalEndpoints = 0;
      let categoryCount = Object.keys(apiDocumentation.endpoints).length;

      // Build navigation
      for (const [key, category] of Object.entries(apiDocumentation.endpoints)) {
        navHtml += `
                    <div class="nav-category">
                        <i class="fas ${category.icon}"></i> ${category.name}
                    </div>
                `;
        category.endpoints.forEach(endpoint => {
          navHtml += `
                        <a href="#${key}-${endpoint.method}-${endpoint.path.replace(/\//g, '-')}" class="nav-item" data-search="${category.name} ${endpoint.path} ${endpoint.description}">
                            <i class="fas ${category.icon}"></i>
                            <span>${endpoint.method} ${endpoint.path}</span>
                        </a>
                    `;
          totalEndpoints++;
        });
      }

      // Build content
      for (const [key, category] of Object.entries(apiDocumentation.endpoints)) {
        contentHtml += `
                    <div class="section" id="section-${key}">
                        <div class="section-header" onclick="toggleSection(this)">
                            <h2>
                                <i class="fas ${category.icon}"></i>
                                ${category.name}
                                <span class="badge-count">${category.endpoints.length} endpoints</span>
                            </h2>
                        </div>
                        <div class="section-content">
                            <p style="margin-bottom: 20px; color: var(--gray);">${category.description}</p>
                `;

        category.endpoints.forEach(endpoint => {
          const endpointId = `${key}-${endpoint.method}-${endpoint.path.replace(/\//g, '-')}`;
          contentHtml += `
                        <div class="endpoint-card" id="${endpointId}">
                            <div class="endpoint-header">
                                <span class="method ${endpoint.method}">${endpoint.method}</span>
                                <code class="endpoint-url">${apiDocumentation.baseUrl}${endpoint.path}</code>
                                <span class="auth-badge ${endpoint.auth === 'public' ? 'public' : ''}">
                                    <i class="fas ${endpoint.auth === 'public' ? 'fa-lock-open' : 'fa-lock'}"></i>
                                    ${endpoint.auth === 'public' ? 'Public' : endpoint.auth === 'admin' ? 'Admin Only' : 'Auth Required'}
                                </span>
                            </div>
                            <div class="endpoint-description">
                                ${endpoint.description}
                            </div>
                            <div class="endpoint-details">
                    `;

          if (endpoint.parameters && endpoint.parameters.length > 0) {
            contentHtml += `
                            <div class="sub-section">
                                <div class="sub-section-title"><i class="fas fa-list"></i> Parameters</div>
                                <table class="parameters-table">
                                    <thead>
                                        <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
                                    </thead>
                                    <tbody>
                        `;
            endpoint.parameters.forEach(param => {
              contentHtml += `
                                <tr>
                                    <td class="param-name">${param.name}</td>
                                    <td class="param-type">${param.type}</td>
                                    <td>${param.required ? '<span class="required">Required</span>' : 'Optional'}</td>
                                    <td>${param.description || '-'}</td>
                                </tr>
                            `;
            });
            contentHtml += `
                                    </tbody>
                                </table>
                            </div>
                        `;
          }

          // Example Response
          contentHtml += `
                            <div class="sub-section">
                                <div class="sub-section-title"><i class="fas fa-code"></i> Example Response</div>
                                <div class="code-block">
                                    <pre style="margin: 0; color: #D4D4D4;">{
    <span class="keyword">"success"</span>: <span class="keyword">true</span>,
    <span class="keyword">"message"</span>: <span class="string">"Operation successful"</span>,
    <span class="keyword">"data"</span>: {
        // Response data structure varies by endpoint
    }
}</pre>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
        });

        contentHtml += `
                        </div>
                    </div>
                `;
      }

      navMenu.innerHTML = navHtml;
      apiContent.innerHTML = contentHtml;
      document.getElementById('totalEndpoints').textContent = totalEndpoints;
      document.getElementById('totalCategories').textContent = categoryCount;

      // Add click handlers for nav items
      document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = item.getAttribute('href').substring(1);
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
            // Highlight active nav item
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            // Open parent section
            const section = targetElement.closest('.section');
            if (section && !section.classList.contains('open')) {
              section.classList.add('open');
            }
          }
        });
      });
    }

    function toggleSection(header) {
      const section = header.closest('.section');
      section.classList.toggle('open');
    }

    // Search functionality
    function setupSearch() {
      const searchInput = document.getElementById('searchInput');
      searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const navItems = document.querySelectorAll('.nav-item');
        const endpointCards = document.querySelectorAll('.endpoint-card');

        if (searchTerm.length < 2) {
          navItems.forEach(item => item.style.display = 'flex');
          endpointCards.forEach(card => card.style.display = 'block');
          return;
        }

        navItems.forEach(item => {
          const searchText = item.getAttribute('data-search')?.toLowerCase() || '';
          const matches = searchText.includes(searchTerm);
          item.style.display = matches ? 'flex' : 'none';
        });

        endpointCards.forEach(card => {
          const cardText = card.textContent.toLowerCase();
          const matches = cardText.includes(searchTerm);
          card.style.display = matches ? 'block' : 'none';
        });
      });
    }

    // Open first section by default
    function openFirstSection() {
      const firstSection = document.querySelector('.section');
      if (firstSection) {
        firstSection.classList.add('open');
      }
    }

    // Initialize
    buildDocumentation();
    setupSearch();
    openFirstSection();
  </script>
</body>

</html>
