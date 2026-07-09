# SSPMS

**School Supplies & Purchases Management System (SSPMS)** is a full-stack procurement and inventory management system built with a Laravel backend API and a Next.js frontend. It provides a centralized platform for digitizing and streamlining the entire procurement lifecycle in a school environment, from requisition to payment, ensuring transparency, accountability, and efficient budget management.

---

## ✨ Features

### 🔐 Authentication & User Management
- Role-based registration & login (Staff, HOD, Accountant, Principal, Final Approver, Procurement, Admin, Supplier, Auditor)
- Secure token-based authentication (`auth:api`)
- Password reset & 2FA support
- User suspension & activity tracking

### 📋 Requisition Management
- Create and submit material/service requisitions
- Auto-generated reference numbers (MR-YYYY-XXXXX)
- Emergency/Fast-track requisition flagging
- Tender tracking (TND-YYYY-XXXXX) and contract management

### 📝 Multi-tier Approval Workflow (4 Levels)
- **Level 1:** Head of Department (HOD) Approval
- **Level 2:** Accountant (Funds Check) Approval
- **Level 3:** Principal / Head of Institution Approval
- **Level 4:** Final Approver (Director/Bishop) Approval
- **Status Tracking:** Draft → Pending → Approved/Declined/Returned
- Approval comments, digital trails, and deadline reminders

### 📦 Supplier & Quotation Management
- Supplier registration, blacklisting, and performance rating
- Quotation Request (QTN) generation and distribution
- Supplier response portal (Approve/Decline with pricing)
- Automated quotation comparison (highlighting lowest price)
- Multiple quotation rounds and deadline extensions

### 📄 Purchase Order Generation (LPO/LSO)
- Auto-generate LPO (Goods) and LSO (Services) based on requisition type
- Dynamic reference numbers (LPO-YYYY-XXXXX, LSO-YYYY-XXXXX, CTR-YYYY-XXXXX)
- Multi-signatory workflow (Prepared, Checked, Endorsed, Approved)

### 📥 Goods & Service Receipt (GRN/SAN)
- Generate Goods Received Notes (GRN) and Service Acknowledgment Notes (SAN)
- Partial delivery handling
- Condition checks (damaged/incomplete/partial)
- HOD/Principal confirmation workflow

### 💰 Invoicing & Payments
- Supplier invoice submission portal
- **Three-way matching** (Order vs Receipt vs Invoice)
- Automatic invoice verification
- Payment Voucher (PV) generation
- Endorsement by Head of Institution / Diocesan Accountant
- Cheque number tracking

### 📊 Reports & Analytics
- Comprehensive reports: Requisition Register, Approval Tracking, Department Spending, LPO/LSO Register, Supplier Performance, Payment Register, Tender Register, Audit Trail, etc.
- Role-specific dashboards with real-time analytics
- Filter by date range, department, status, type, user, supplier, amount

### 🔔 Notifications & Alerts
- In-app notifications and email alerts
- Event-driven notifications (submission, approval, decline, return, quotation, order, payment)
- Deadline reminders and escalation alerts

### 🛡️ Security & Compliance
- Role-based access control (RBAC)
- 2FA enforcement for Admin, Accountant, Final Approver
- Comprehensive audit logging (all actions and changes)
- Data encryption in transit and at rest
- IP whitelisting (optional)
- CSRF and CSP protection

### 🏢 Department Management
- Create and manage departments
- Assign/Reassign HOD
- Deactivate departments with historical data retention
- View department-specific reports and spending

### ⚙️ System Administration
- Manage users, roles, and permissions
- System settings (reference number formats, approval deadlines, quotation deadlines)
- Supplier blacklist management
- Audit log viewing
- System configuration via environment variables

---

## 🧱 Tech Stack

- **Backend:** Laravel (REST API)
- **Frontend:** Next.js (React)
- **Database:** MySQL (PostgreSQL optional)
- **Cache:** Redis (optional, for performance)
- **Deployment:** Docker + VPS
- **CI/CD:** GitHub Actions

---

## 📦 API Endpoints

The API is organized around RESTful principles and includes endpoints for:

| Module | Key Endpoints |
|--------|---------------|
| **Authentication** | `/api/auth/login`, `/api/auth/logout`, `/api/auth/2fa-verify` |
| **Users** | `/api/users`, `/api/users/{id}` |
| **Departments** | `/api/departments`, `/api/departments/{id}/assign-hod` |
| **Requisitions** | `/api/requisitions`, `/api/requisitions/{id}/submit` |
| **Approvals** | `/api/approvals/pending`, `/api/approvals/{id}/approve` |
| **Suppliers** | `/api/suppliers`, `/api/suppliers/{id}/blacklist` |
| **Quotations** | `/api/quotations`, `/api/quotations/{id}/respond` |
| **Purchase Orders** | `/api/purchase-orders`, `/api/purchase-orders/{id}/pdf` |
| **GRN/SAN** | `/api/grn`, `/api/grn/{id}/confirm` |
| **Invoices** | `/api/invoices`, `/api/invoices/{id}/verify` |
| **Payment Vouchers** | `/api/payment-vouchers`, `/api/payment-vouchers/{id}/endorse` |
| **Reports** | `/api/reports/*` (18+ reports) |
| **Settings** | `/api/settings`, `/api/settings/{key}` |

---

## 📋 Database Schema

The system includes **15+ tables** covering the complete procurement lifecycle:

- `users`, `departments`, `requisitions`, `approval_trails`
- `suppliers`, `quotations`, `quotation_items`
- `purchase_orders`, `goods_received_notes`
- `invoices`, `payment_vouchers`, `cheques`
- `audit_logs`, `system_settings`

*Refer to the complete technical requirements document for full schema details.*

---

## 🚀 Deployment

The system uses a CI/CD pipeline for automated deployment:

Backend services are automatically updated with:
- Database migrations
- Cache refresh
- Config optimization

Frontend builds are deployed to Vercel or static hosting.

---

## 🔒 Security

- Role-based access control (RBAC)
- Protected API routes (`auth:api`)
- Two-factor authentication (TOTP)
- AES-256 encryption for sensitive data
- Audit logging for all system actions
- CSP violation monitoring
- SQL injection and XSS protection

---

## 📚 Topics

`laravel` `nextjs` `fullstack` `rest-api` `docker` `github-actions` `mysql` `redis` `authentication` `role-based-access-control` `school-management` `procurement-system` `approval-workflow` `supplier-management` `inventory-management` `finance-management` `budget-tracking` `reporting` `ci-cd`

---

## 📄 License

Private system – internal school use only.
