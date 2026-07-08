# TumCathCom

TumCathCom is a full-stack church/community management system built with a Laravel backend API and a Next.js frontend. It provides a centralized platform for managing members, sacraments, welfare services, bookings, hospitality, assets, printing, and spiritual activities like prayers, novenas, and liturgical calendars.

---

## Tech Stack

- Backend: Laravel (REST API)
- Frontend: Next.js
- Database: MySQL
- Cache: Redis (optional)
- Deployment: Docker + VPS
- CI/CD: GitHub Actions

---

## Base API

---

## Features

### Authentication
- User registration & login
- Password reset
- Token-based auth (`auth:api`)

### Profile & Membership
- Profile management
- Member registration & roles
- Suspension & appeals
- Online members tracking

### SCC (Small Christian Communities)
- Community creation & management
- Members assignment
- Meetings & attendance tracking

### Prayer System
- Prayer requests
- Community prayer tracking
- Random prayers

### Sacraments & Catechism
- Catechism requests
- Sacramental workflows
- Certificate verification

### Welfare System
- Bereavement support
- Sick visits
- Counseling sessions
- Basic needs assistance

### Assets & Bookings
- Asset management
- Booking system
- Penalties & returns

### Hospitality
- Meal planning
- Decorations & inventory
- Hygiene inspections
- Utensil checkouts

### Printing System
- Print job management
- Credit system
- Transaction history

### Novenas
- Create & manage novenas
- Daily participation tracking
- Progress monitoring

### Liturgical Calendar
- Feasts, solemnities, and seasons
- Daily readings integration

### Saints Directory
- Saints listings
- Search & daily saints

### Notifications & Feedback
- System notifications
- Feedback per module
- Read/unread tracking

### Uploads
- Profile photos
- Documents
- Bulk uploads

---

## Deployment

The system uses a CI/CD pipeline:

Backend services are automatically updated with:
- migrations
- cache refresh
- config optimization

---

## Security

- Role-based access control
- Protected API routes (`auth:api`)
- CSP violation monitoring endpoint
- Audit-friendly request logging

---

## Topics

laravel nextjs fullstack rest-api docker github-actions mysql redis authentication role-based-access-control church-management community-platform scc-management welfare-system booking-system asset-management printing-system hospitality-management spiritual-app ci-cd

---

## License

Private system – internal use only.
