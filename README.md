# SSPMS - School Supplies & Purchases Management System

## 📋 Complete System Overview

### What is SSPMS?

SSPMS is a comprehensive, production-ready web application designed to digitize and streamline the entire procurement lifecycle in a school environment. From requisition to payment, the system ensures transparency, accountability, and efficient budget management.

---

## 🎯 Core Philosophy

- **Accountant** serves as the budget authority, exercising professional judgment
- **System facilitates** approval/declination with detailed reasons
- **No hard budget enforcement** - decisions are made by authorized personnel
- **Complete transparency** through audit trails and approval workflows

---

## 👥 User Roles & Permissions

| Role | Description | Key Responsibilities |
|------|-------------|---------------------|
| **Admin** | System Administrator | Manage users, departments, system settings, reference formats, backup |
| **Staff Member** | Any school employee | Create and submit requisitions |
| **Head of Department (HOD)** | Department head | Approve/decline requisitions with comments |
| **Accountant** | Finance department | Fund availability check, approve/decline, prepare payment vouchers, verify invoices |
| **Head of Institution** | Principal/Headteacher | Approve/decline requisitions, endorse payment vouchers |
| **Director/Finance Administrator** | Director/Financial Admin | Final approval authority for financial commitments |
| **Procurement Officer** | Procurement department | Manage suppliers, quotations, generate LPO/LSO, recheck supplier selection |
| **Supplier** | External vendor | Receive quotations, approve, list prices, submit invoices |
| **Auditor** | Internal/External audit | View all transactions read-only |

---

## 🔄 Complete Workflow

### Requisition Lifecycle (14 Steps)

1. **Create Requisition** - Staff/HOD/Accountant/Principal/Procurement logs in and fills requisition form
2. **Submit for Approval** - Status changes to PENDING_HOD
3. **HOD Approval (Level 1)** - Approve/Decline/Return with comments
4. **Accountant Approval (Level 2)** - Funds check with professional judgment
5. **Principal Approval (Level 3)** - Head of Institution review
6. **Director/Finance Administrator Approval (Level 4)** - Final approval for financial commitments
7. **Quotation Generation** - System generates QTN and sends to selected suppliers
8. **Supplier Response** - Suppliers approve/decline with pricing
9. **Supplier Selection** - Lowest price suggested, Procurement/Headteacher confirms
10. **LPO/LSO Generation** - Auto-determined based on Goods/Services type
11. **GRN/SAN Generation** - Goods Received Note or Service Acknowledgment Note
12. **Supplier Invoice** - Supplier submits invoice with three-way matching
13. **Payment Voucher** - Accountant prepares, Head/Diocesan Accountant endorses
14. **Payment & Cheque Tracking** - Physical cheque issued and tracked

### Requisition Statuses

| Status | Description |
|--------|-------------|
| DRAFT | User is still editing |
| PENDING_HOD | Waiting for HOD approval |
| PENDING_ACCOUNTANT | HOD approved, waiting for Accountant |
| PENDING_PRINCIPAL | Accountant approved, waiting for Principal |
| PENDING_FINAL_APPROVAL | Principal approved, waiting for Director/Finance Administrator |
| RETURNED | Returned to user for revision |
| APPROVED | All approvals completed |
| DECLINED | Declined with reason |
| CANCELLED | Cancelled by user before approval |

---

## 📊 Reference Number Formats

All numbers are **system-generated** and **configurable** in Admin Settings:

| Reference | Default Format | Example |
|-----------|---------------|---------|
| Material Requisition | `MR-{YYYY}-{SEQ}` | MR-2026-0001 |
| Quotation Request | `QTN-{YYYY}-{SEQ}` | QTN-2026-0001 |
| Tender Number | `TND-{YYYY}-{SEQ}` | TND-2026-0001 |
| Contract Number | `CTR-{YYYY}-{SEQ}` | CTR-2026-0001 |
| LPO Number | `LPO-{YYYY}-{SEQ}` | LPO-2026-0001 |
| LSO Number | `LSO-{YYYY}-{SEQ}` | LSO-2026-0001 |
| GRN Number | `GRN-{YYYY}-{SEQ}` | GRN-2026-0001 |
| SAN Number | `SAN-{YYYY}-{SEQ}` | SAN-2026-0001 |
| Payment Voucher | `PV-{YYYY}-{SEQ}` | PV-2026-0001 |

---

## 📁 Module Features

### 1. Requisition Management
- Create, edit, submit, and track requisitions
- Support for Goods and Services types
- Tender tracking with auto-generated tender numbers
- Emergency/Fast-Track option
- Complete approval history
- Multi-item requisitions with quantities and units
- File attachments support
- Budget allocation and tracking
- Revision history

### 2. Quotation Management
- Generate quotation requests (QTN)
- Send to selected suppliers
- Supplier portal for responses
- Auto-suggest lowest price supplier
- Tender quotation tracking
- Supplier quotation verification
- Price comparison analysis

### 3. LPO/LSO Generation
- Auto-determine LPO (Goods) or LSO (Services)
- Professional PDF documents
- Multi-signature workflow (Prepared, Checked, Endorsed, Approved)
- Validity period configuration
- Contract number linking
- Delivery tracking

### 4. GRN/SAN Management
- Generate Goods Received Note or Service Acknowledgment Note
- Partial delivery support
- Damaged goods tracking
- HOD/Principal approval
- Multiple GRNs per LPO
- Quality inspection tracking

### 5. Supplier Management
- Supplier database with categories
- Supplier performance tracking
- Blacklist management
- Supplier portal access
- Quotation response system
- Supplier evaluation metrics

### 6. Invoice Management
- Supplier invoice submission
- Three-way matching (LPO + GRN + Invoice)
- Verification workflow
- Send back for rectification
- Payment scheduling
- Dispute management

### 7. Payment Processing
- Payment voucher preparation
- Digital signatures for endorsement/approval
- Cheque tracking
- Payment register
- Bank reconciliation

### 8. Reports & Analytics
- 18 comprehensive reports
- PDF and Excel/CSV export
- Role-specific dashboards
- Real-time statistics
- Budget utilization tracking
- Approval performance metrics

### 9. Admin Settings
- Reference number format configuration
- Approval deadlines
- Email/SMTP configuration
- Department management
- User management
- System settings
- Backup management
- Audit log monitoring

### 10. Company Profile Management
- Company branding
- Logo management
- Contact information
- Social media links
- Document templates

---

## 🔐 Security Features

### Authentication
- Password-based authentication with bcrypt/Argon2 hashing
- Two-Factor Authentication (2FA) for Admin, Accountant, Director/Finance Administrator
- JWT-based authentication with Sanctum
- Session management with auto-logout
- Password reset with email verification

### Authorization
- Role-Based Access Control (RBAC)
- Fine-grained permissions per module
- Middleware-based permission checking
- Spatie Permission package integration

### Data Security
- HTTPS with TLS 1.2+
- Input validation and sanitization
- SQL Injection protection (Prepared statements/ORM)
- XSS protection (Output encoding)
- CSRF protection (Tokens)

### Audit Trail
- All user actions logged
- Admin actions logged
- Settings changes logged
- Access attempts logged
- IP address and user agent recorded

---

## 🛠️ Technical Stack

### Backend
- **Language**: PHP 8.1+
- **Framework**: Laravel 11
- **API**: Laravel API Resources
- **Database**: MySQL/PostgreSQL
- **Cache**: Redis/Memcached
- **Queue**: Redis/Beanstalkd
- **Authentication**: Laravel Sanctum

### Frontend (Planned)
- **Framework**: React.js/Vue.js
- **UI Library**: Tailwind CSS
- **State Management**: Zustand/Pinia
- **API Client**: Axios

### Deployment
- **Server**: VPS (Ubuntu 22.04 LTS)
- **Web Server**: Nginx
- **Process Manager**: Supervisor
- **SSL Certificate**: Let's Encrypt
- **Backup**: Automated daily backups

---

## 📋 Prerequisites

### System Requirements
- **CPU**: Minimum 2 cores (Recommended: 4+ cores)
- **RAM**: Minimum 4 GB (Recommended: 8+ GB)
- **Storage**: Minimum 20 GB SSD (Recommended: 50+ GB SSD)
- **OS**: Ubuntu 22.04 LTS
- **Database**: MySQL 8.0+ / PostgreSQL 15+
- **Web Server**: Nginx/Apache

### Software Requirements
- PHP 8.1+
- Composer 2.x
- Node.js 18+
- MySQL 8.0+ / PostgreSQL 15+
- Redis 7+ (Optional)
- Git

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/sspms.git
cd sspms
```

### 2. Backend Setup
```bash
# Install dependencies
composer install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Seed database (optional)
php artisan db:seed

# Create storage link
php artisan storage:link

# Run development server
php artisan serve
```

### 3. Frontend Setup (If using React/Vue)
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### 4. Production Deployment
```bash
# Optimize for production
php artisan optimize

# Configure Nginx
sudo cp nginx/sites-available/sspms /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/sspms /etc/nginx/sites-enabled/

# Configure Supervisor for queue workers
sudo cp supervisor/sspms-worker.conf /etc/supervisor/conf.d/
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start sspms-worker:*

# Configure SSL
sudo certbot --nginx -d yourdomain.com
```

---

## 🔧 Configuration

### Environment Variables (.env)
```env
# Application
APP_NAME=SSPMS
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com
APP_TIMEZONE=Africa/Nairobi

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sspms
DB_USERNAME=sspms_user
DB_PASSWORD=your-password

# Cache
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Email
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=no-reply@sspms.com
MAIL_FROM_NAME="${APP_NAME}"

# Sanctum
SANCTUM_STATEFUL_DOMAINS=yourdomain.com
SESSION_DOMAIN=.yourdomain.com

# Security
BCRYPT_ROUNDS=12
```

---

## 📚 API Documentation

### Complete API Endpoints Structure

#### Base URL: `/api/v1`

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | Login user | No |
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/forgot-password` | Send password reset link | No |
| POST | `/auth/reset-password` | Reset password | No |
| POST | `/auth/validate-reset-token` | Validate reset token | No |
| POST | `/auth/logout` | Logout user | Yes |
| GET | `/auth/me` | Get authenticated user | Yes |
| GET | `/auth/permissions` | Get user permissions | Yes |
| PUT | `/auth/profile` | Update profile | Yes |
| POST | `/auth/change-password` | Change password | Yes |

### 2FA Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/2fa/enable` | Enable 2FA | Yes |
| POST | `/2fa/disable` | Disable 2FA | Yes |
| POST | `/2fa/verify` | Verify 2FA code | Yes |
| POST | `/2fa/recovery-codes` | Generate recovery codes | Yes |
| POST | `/2fa/verify-recovery` | Verify recovery code | Yes |
| GET | `/2fa/status` | Get 2FA status | Yes |

### Department Endpoints
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/departments` | List departments | All authenticated |
| GET | `/departments/stats` | Department statistics | All authenticated |
| GET | `/departments/{id}` | Get department details | All authenticated |
| GET | `/departments/{id}/users` | Get department users | All authenticated |
| POST | `/departments` | Create department | Admin only |
| PUT | `/departments/{id}` | Update department | Admin only |
| DELETE | `/departments/{id}` | Delete department | Admin only |
| POST | `/departments/{id}/activate` | Activate department | Admin only |
| POST | `/departments/{id}/deactivate` | Deactivate department | Admin only |
| POST | `/departments/{id}/assign-hod` | Assign HOD | Admin only |
| POST | `/departments/{id}/remove-hod` | Remove HOD | Admin only |

### Requisition Endpoints
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/requisitions` | List requisitions | All authenticated |
| POST | `/requisitions` | Create requisition | All authenticated |
| GET | `/requisitions/stats` | Requisition statistics | All authenticated |
| GET | `/requisitions/my` | Get user's requisitions | All authenticated |
| GET | `/requisitions/my/stats` | User's requisition stats | All authenticated |
| GET | `/requisitions/pending` | Pending approvals | Approvers |
| GET | `/requisitions/{id}` | Get requisition details | All authenticated |
| PUT | `/requisitions/{id}` | Update requisition | Owner/Admin |
| POST | `/requisitions/{id}/submit` | Submit for approval | Owner/Approver |
| POST | `/requisitions/{id}/return` | Return for revision | Approvers |
| POST | `/requisitions/{id}/cancel` | Cancel requisition | Owner/Admin |
| DELETE | `/requisitions/{id}` | Delete requisition | Admin only |

### Requisition Items Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/requisitions/{reqId}/items` | List items |
| GET | `/requisitions/{reqId}/items/stats` | Items statistics |
| POST | `/requisitions/{reqId}/items` | Create item |
| POST | `/requisitions/{reqId}/items/bulk` | Bulk create items |
| GET | `/requisitions/{reqId}/items/{id}` | Get item |
| PUT | `/requisitions/{reqId}/items/{id}` | Update item |
| DELETE | `/requisitions/{reqId}/items/{id}` | Delete item |
| POST | `/requisitions/{reqId}/items/{id}/receive` | Receive item |
| POST | `/requisitions/{reqId}/items/{id}/quality` | Update quality status |

### Requisition Attachments Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/requisitions/{reqId}/attachments` | List attachments |
| POST | `/requisitions/{reqId}/attachments` | Upload attachment |
| GET | `/requisitions/{reqId}/attachments/{id}` | Get attachment |
| PUT | `/requisitions/{reqId}/attachments/{id}` | Update attachment |
| DELETE | `/requisitions/{reqId}/attachments/{id}` | Delete attachment |
| GET | `/requisitions/{reqId}/attachments/{id}/download` | Download attachment |

### Approval Endpoints
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/approvals/pending` | Get pending approvals | Approvers |
| GET | `/approvals/stats` | Approval statistics | Approvers |
| GET | `/approvals/role` | Get approvals by role | Approvers |
| GET | `/approvals/delegated` | Get delegated approvals | Approvers |
| POST | `/approvals/requisitions/{reqId}/process` | Process approval | Approvers |
| POST | `/approvals/{id}/delegate` | Delegate approval | Approvers |
| GET | `/approvals/workflows` | List workflows | All authenticated |
| POST | `/approvals/workflows` | Create workflow | Admin only |
| GET | `/approvals/workflows/{id}` | Get workflow | All authenticated |
| PUT | `/approvals/workflows/{id}` | Update workflow | Admin only |
| DELETE | `/approvals/workflows/{id}` | Delete workflow | Admin only |

### Requisition Budget Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/requisitions/{reqId}/budgets` | List budgets |
| POST | `/requisitions/{reqId}/budgets` | Create budget |
| GET | `/requisitions/{reqId}/budgets/{id}` | Get budget |
| PUT | `/requisitions/{reqId}/budgets/{id}` | Update budget |
| POST | `/requisitions/{reqId}/budgets/{id}/verify` | Verify budget |
| POST | `/requisitions/{reqId}/budgets/{id}/approve` | Approve budget |
| POST | `/requisitions/{reqId}/budgets/{id}/reject` | Reject budget |

### Requisition Revisions Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/requisitions/{reqId}/revisions` | List revisions |
| POST | `/requisitions/{reqId}/revisions` | Create revision |
| GET | `/requisitions/{reqId}/revisions/stats` | Revision stats |
| GET | `/requisitions/{reqId}/revisions/{id}` | Get revision |
| POST | `/requisitions/{reqId}/revisions/{id}/approve` | Approve revision |
| POST | `/requisitions/{reqId}/revisions/{id}/reject` | Reject revision |

### Requisition History Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/requisitions/{reqId}/history` | List history |
| GET | `/requisitions/{reqId}/history/{id}` | Get history entry |
| GET | `/history/actions/{action}` | Get history by action |
| GET | `/history/stats` | History statistics |
| GET | `/history/recent/{userId}` | Recent history |

### Supplier Management Endpoints
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/suppliers` | List suppliers | Admin/Procurement |
| POST | `/suppliers` | Create supplier | Admin/Procurement |
| GET | `/suppliers/active` | Active suppliers | Admin/Procurement |
| GET | `/suppliers/stats` | Supplier statistics | Admin/Procurement |
| GET | `/suppliers/me` | Get supplier profile | Supplier |
| GET | `/suppliers/{id}` | Get supplier details | Admin/Procurement |
| PUT | `/suppliers/{id}` | Update supplier | Admin/Procurement |
| DELETE | `/suppliers/{id}` | Delete supplier | Admin |
| POST | `/suppliers/{id}/activate` | Activate supplier | Admin |
| POST | `/suppliers/{id}/blacklist` | Blacklist supplier | Admin |
| POST | `/suppliers/{id}/unblacklist` | Unblacklist supplier | Admin |

### Quotation Endpoints
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/quotations` | List quotations | All authenticated |
| POST | `/quotations` | Create QTN | Procurement/Admin |
| GET | `/quotations/stats` | QTN statistics | All authenticated |
| GET | `/quotations/{id}` | Get QTN details | All authenticated |
| PUT | `/quotations/{id}` | Update QTN | Procurement/Admin |
| POST | `/quotations/{id}/send` | Send to suppliers | Procurement/Admin |
| POST | `/quotations/{id}/close` | Close QTN | Procurement/Admin |
| POST | `/quotations/{id}/cancel` | Cancel QTN | Procurement/Admin |
| POST | `/quotations/{id}/reminder` | Send reminder | Procurement/Admin |
| POST | `/quotations/select-supplier` | Select supplier | Procurement/Admin |
| GET | `/quotations/{id}/download-pdf` | Download QTN PDF | All authenticated |
| GET | `/quotations/{id}/preview-pdf` | Preview QTN PDF | All authenticated |

### Supplier Quotation Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/supplier-quotations` | List supplier quotations |
| POST | `/supplier-quotations` | Submit supplier quotation |
| GET | `/supplier-quotations/lowest/{qtnId}` | Get lowest quotation |
| GET | `/supplier-quotations/{id}` | Get quotation details |
| POST | `/supplier-quotations/{id}/verify` | Verify quotation |
| POST | `/supplier-quotations/{id}/evaluate` | Evaluate quotation |

### Purchase Order (LPO/LSO) Endpoints
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/purchase-orders` | List purchase orders | All authenticated |
| POST | `/purchase-orders` | Create purchase order | Procurement/Admin |
| GET | `/purchase-orders/overdue` | Overdue orders | Procurement/Admin |
| GET | `/purchase-orders/{id}` | Get order details | All authenticated |
| GET | `/purchase-orders/{id}/summary` | Order summary | All authenticated |
| GET | `/purchase-orders/{id}/delivery-progress` | Delivery progress | All authenticated |
| GET | `/purchase-orders/{id}/pdf` | Download PDF | All authenticated |
| POST | `/purchase-orders/{id}/approve` | Approve order | Approvers |
| POST | `/purchase-orders/{id}/issue` | Issue order | Procurement/Admin |
| POST | `/purchase-orders/{id}/send` | Send to supplier | Procurement/Admin |
| POST | `/purchase-orders/{id}/acknowledge` | Acknowledge order | Supplier |
| POST | `/purchase-orders/{id}/deliver` | Mark delivered | Procurement/Admin |
| POST | `/purchase-orders/{id}/complete` | Complete order | Procurement/Admin |
| POST | `/purchase-orders/{id}/cancel` | Cancel order | Procurement/Admin |

### Goods Received Note (GRN) Endpoints
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/goods-received` | List GRNs | All authenticated |
| POST | `/goods-received` | Create GRN | Procurement/Admin |
| GET | `/goods-received/{id}` | Get GRN details | All authenticated |
| GET | `/goods-received/{id}/summary` | GRN summary | All authenticated |
| GET | `/goods-received/{id}/pdf` | Download PDF | All authenticated |
| POST | `/goods-received/{id}/submit` | Submit GRN | Creator |
| POST | `/goods-received/{id}/approve` | Approve GRN | HOD/Principal |
| POST | `/goods-received/{id}/reject` | Reject GRN | HOD/Principal |
| POST | `/goods-received/{id}/inspect` | Inspect goods | Procurement/Admin |

### Service Acknowledgment Note (SAN) Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/service-acknowledgments` | List SANs |
| POST | `/service-acknowledgments` | Create SAN |
| GET | `/service-acknowledgments/{id}` | Get SAN details |
| GET | `/service-acknowledgments/{id}/summary` | SAN summary |
| GET | `/service-acknowledgments/{id}/pdf` | Download PDF |
| POST | `/service-acknowledgments/{id}/submit` | Submit SAN |
| POST | `/service-acknowledgments/{id}/approve` | Approve SAN |
| POST | `/service-acknowledgments/{id}/reject` | Reject SAN |
| POST | `/service-acknowledgments/{id}/rate` | Rate service |

### Invoice Endpoints
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/invoices` | List invoices | All authenticated |
| POST | `/invoices` | Submit invoice | Supplier |
| GET | `/invoices/overdue` | Overdue invoices | Accountant/Admin |
| GET | `/invoices/{id}` | Get invoice details | All authenticated |
| GET | `/invoices/{id}/summary` | Invoice summary | All authenticated |
| GET | `/invoices/{id}/matching-status` | Matching status | Accountant/Admin |
| GET | `/invoices/{id}/pdf` | Download PDF | All authenticated |
| POST | `/invoices/{id}/match` | Match invoice | Accountant |
| POST | `/invoices/{id}/verify` | Verify invoice | Accountant |
| POST | `/invoices/{id}/approve` | Approve invoice | Accountant |
| POST | `/invoices/{id}/pay` | Mark paid | Accountant |
| POST | `/invoices/{id}/dispute` | Dispute invoice | Supplier/Admin |
| POST | `/invoices/{id}/cancel` | Cancel invoice | Admin |
| POST | `/invoices/{id}/send-back` | Send back to supplier | Accountant |

### Payment Voucher Endpoints
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/payments/vouchers` | List vouchers | Accountant/Admin |
| POST | `/payments/vouchers` | Create voucher | Accountant |
| GET | `/payments/vouchers/{id}` | Get voucher details | Accountant/Admin |
| GET | `/payments/vouchers/{id}/summary` | Voucher summary | Accountant/Admin |
| GET | `/payments/vouchers/{id}/pdf` | Download PDF | Accountant/Admin |
| POST | `/payments/vouchers/{id}/endorse` | Endorse voucher | Principal/Director |
| POST | `/payments/vouchers/{id}/approve` | Approve voucher | Director/Admin |
| POST | `/payments/vouchers/{id}/pay` | Mark paid | Accountant |
| POST | `/payments/vouchers/{id}/cancel` | Cancel voucher | Admin |

### Cheque Endpoints
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| POST | `/payments/cheques` | Record cheque | Accountant |
| GET | `/payments/cheques/{id}` | Get cheque details | Accountant/Admin |
| GET | `/payments/cheques/{id}/pdf` | Download cheque PDF | Accountant/Admin |
| POST | `/payments/cheques/{id}/cash` | Mark cheque cashed | Accountant |
| POST | `/payments/cheques/{id}/cancel` | Cancel cheque | Accountant |
| POST | `/payments/cheques/{id}/stop` | Stop cheque | Accountant/Admin |

### Contract Endpoints
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/contracts` | List contracts | All authenticated |
| POST | `/contracts` | Create contract | Procurement/Admin |
| GET | `/contracts/expiring` | Expiring contracts | Procurement/Admin |
| GET | `/contracts/renewable` | Renewable contracts | Procurement/Admin |
| GET | `/contracts/{id}` | Get contract details | All authenticated |
| GET | `/contracts/{id}/summary` | Contract summary | All authenticated |
| GET | `/contracts/{id}/pdf` | Download PDF | All authenticated |
| POST | `/contracts/{id}/approve` | Approve contract | Approvers |
| POST | `/contracts/{id}/activate` | Activate contract | Procurement/Admin |
| POST | `/contracts/{id}/complete` | Complete contract | Procurement/Admin |
| POST | `/contracts/{id}/terminate` | Terminate contract | Admin |
| POST | `/contracts/{id}/suspend` | Suspend contract | Admin |
| POST | `/contracts/{id}/renew` | Renew contract | Procurement/Admin |

### Tender Endpoints
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/tenders` | List tenders | All authenticated |
| POST | `/tenders` | Create tender | Procurement/Admin |
| GET | `/tenders/{id}` | Get tender details | All authenticated |
| GET | `/tenders/{id}/statistics` | Tender statistics | Procurement/Admin |
| GET | `/tenders/{id}/bidders` | List bidders | Procurement/Admin |
| GET | `/tenders/{id}/pdf` | Download PDF | All authenticated |
| POST | `/tenders/{id}/publish` | Publish tender | Procurement/Admin |
| POST | `/tenders/{id}/bidder` | Add bidder | Procurement/Admin |
| DELETE | `/tenders/{id}/bidder/{supplierId}` | Remove bidder | Procurement/Admin |
| POST | `/tenders/{id}/evaluate` | Start evaluation | Procurement/Admin |
| POST | `/tenders/{id}/award` | Award tender | Procurement/Admin |
| POST | `/tenders/{id}/cancel` | Cancel tender | Procurement/Admin |

### Procurement Workflow Endpoints
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| POST | `/procurement/start` | Start procurement | Procurement/Admin |
| POST | `/procurement/complete` | Complete procurement | Procurement/Admin |
| POST | `/procurement/cancel` | Cancel procurement | Procurement/Admin |
| GET | `/procurement/status/{reqId}` | Get status | All authenticated |
| GET | `/procurement/summary/{reqId}` | Get summary | All authenticated |
| GET | `/procurement/timeline/{reqId}` | Get timeline | All authenticated |
| GET | `/procurement/metrics/{reqId}` | Get metrics | Procurement/Admin |
| GET | `/procurement/steps/{reqId}` | Get steps | All authenticated |
| GET | `/procurement/ready-requisitions` | Ready for procurement | Procurement/Admin |
| GET | `/procurement/requisitions-with-qtns` | With QTNs | Procurement/Admin |
| GET | `/procurement/in-progress` | In progress | Procurement/Admin |
| GET | `/procurement/statistics` | Statistics | Procurement/Admin |

### Procurement Approval Endpoints
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/procurement-approvals` | List approvals | All authenticated |
| POST | `/procurement-approvals` | Create approval | Approvers |
| GET | `/procurement-approvals/statistics` | Statistics | Admin |
| GET | `/procurement-approvals/entity` | Entity approvals | All authenticated |
| GET | `/procurement-approvals/timeline` | Approval timeline | All authenticated |
| GET | `/procurement-approvals/is-approved` | Check approval | All authenticated |
| GET | `/procurement-approvals/current-level` | Current level | All authenticated |
| GET | `/procurement-approvals/{id}` | Get approval | All authenticated |
| POST | `/procurement-approvals/{id}/approve` | Approve | Approvers |
| POST | `/procurement-approvals/{id}/decline` | Decline | Approvers |
| POST | `/procurement-approvals/{id}/return` | Return | Approvers |
| POST | `/procurement-approvals/{id}/delegate` | Delegate | Approvers |
| POST | `/procurement-approvals/{id}/reassign` | Reassign | Admin |

### Signature Endpoints
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| POST | `/signatures/upload` | Upload signature | All authenticated |
| GET | `/signatures/status` | Get signature status | All authenticated |
| GET | `/signatures/my-signature` | Get my signature | All authenticated |
| GET | `/signatures/qr/{specimenId}` | Get QR code | All authenticated |
| POST | `/signatures/regenerate-qr/{specimenId}` | Regenerate QR | All authenticated |
| DELETE | `/signatures/{specimenId}` | Delete signature | All authenticated |
| GET | `/signatures/token/{token}` | Verify by token | Public |
| POST | `/signatures/verify/{specimenId}` | Verify signature | Admin only |
| POST | `/signatures/verify-qr` | Verify by QR | Admin only |
| POST | `/signatures/reject/{specimenId}` | Reject signature | Admin only |
| GET | `/signatures/pending` | Pending signatures | Admin only |
| GET | `/signatures/verified` | Verified signatures | Admin only |
| GET | `/signatures/stats` | Signature stats | Admin only |
| GET | `/signatures/logs` | Signature logs | Admin only |

### Company Profile Endpoints
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/company/profile` | Get company profile | All authenticated |
| POST | `/company/profile` | Create/Update profile | Admin only |
| DELETE | `/company/profile/logo` | Delete logo | Admin only |
| GET | `/company/completion` | Profile completion status | Admin only |
| GET | `/company/settings` | Get company settings | Admin only |
| PUT | `/company/settings` | Update settings | Admin only |
| GET | `/company/branding` | Get branding | All authenticated |
| PUT | `/company/branding` | Update branding | Admin only |
| GET | `/company/social-links` | Get social links | All authenticated |
| PUT | `/company/social-links` | Update social links | Admin only |
| POST | `/company/upload-logo` | Upload logo | Admin only |
| GET | `/company/exists` | Check if profile exists | All authenticated |

### Admin Management Endpoints
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/admin/users` | List users | Admin only |
| POST | `/admin/users` | Create user | Admin only |
| GET | `/admin/users/pending` | Pending users | Admin only |
| GET | `/admin/users/recent` | Recent users | Admin only |
| GET | `/admin/users/stats` | User statistics | Admin only |
| POST | `/admin/users/bulk` | Bulk user action | Admin only |
| GET | `/admin/users/{id}` | Get user | Admin only |
| PUT | `/admin/users/{id}` | Update user | Admin only |
| DELETE | `/admin/users/{id}` | Delete user | Admin only |
| POST | `/admin/users/{id}/approve` | Approve user | Admin only |
| POST | `/admin/users/{id}/reject` | Reject user | Admin only |
| POST | `/admin/users/{id}/activate` | Activate user | Admin only |
| POST | `/admin/users/{id}/deactivate` | Deactivate user | Admin only |
| POST | `/admin/users/{id}/reset-password` | Reset password | Admin only |

### Role Management Endpoints
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/admin/roles` | List roles | Admin only |
| GET | `/admin/roles/with-labels` | Roles with labels | Admin only |
| GET | `/admin/roles/options` | Role options | Admin only |
| GET | `/admin/roles/search` | Search roles | Admin only |
| GET | `/admin/roles/users-with-roles` | Users with roles | Admin only |
| GET | `/admin/roles/permissions` | List permissions | Admin only |
| GET | `/admin/roles/permissions/grouped` | Grouped permissions | Admin only |
| GET | `/admin/roles/permissions/all` | All permissions | Admin only |
| GET | `/admin/roles/stats` | Role statistics | Admin only |
| GET | `/admin/roles/{id}` | Get role | Admin only |
| GET | `/admin/roles/{id}/with-labels` | Role with labels | Admin only |
| GET | `/admin/roles/{id}/users` | Role users | Admin only |
| POST | `/admin/roles` | Create role | Admin only |
| PUT | `/admin/roles/{id}` | Update role | Admin only |
| DELETE | `/admin/roles/{id}` | Delete role | Admin only |
| POST | `/admin/roles/{id}/assign-permissions` | Assign permissions | Admin only |
| POST | `/admin/roles/{id}/grant-permission` | Grant permission | Admin only |
| POST | `/admin/roles/{id}/revoke-permission` | Revoke permission | Admin only |
| POST | `/admin/roles/assign-to-user` | Assign role to user | Admin only |
| DELETE | `/admin/roles/remove-role-from-user` | Remove role | Admin only |

### Audit Log Endpoints
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/admin/audit-logs` | List audit logs | Admin/Auditor |
| GET | `/admin/audit-logs/stats` | Audit statistics | Admin/Auditor |
| GET | `/admin/audit-logs/modules` | Module list | Admin/Auditor |
| GET | `/admin/audit-logs/actions` | Action list | Admin/Auditor |
| GET | `/admin/audit-logs/export` | Export logs | Admin/Auditor |
| GET | `/admin/audit-logs/{id}` | Get log entry | Admin/Auditor |

### System Status Endpoints
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/admin/system-status/current` | Current status | Admin only |
| GET | `/admin/system-status/history` | Status history | Admin only |
| GET | `/admin/system-status/summary` | Status summary | Admin only |
| GET | `/admin/system-status/component/{component}` | Component status | Admin only |
| POST | `/admin/system-status/refresh` | Refresh status | Admin only |

### Backup Endpoints
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/admin/backups` | List backups | Admin only |
| POST | `/admin/backups` | Create backup | Admin only |
| GET | `/admin/backups/stats` | Backup statistics | Admin only |
| GET | `/admin/backups/{id}` | Get backup details | Admin only |
| DELETE | `/admin/backups/{id}` | Delete backup | Admin only |
| GET | `/admin/backups/{id}/download` | Download backup | Admin only |
| POST | `/admin/backups/{id}/restore` | Restore backup | Admin only |
| POST | `/admin/backups/clean` | Clean old backups | Admin only |

### Admin Requisition Management Endpoints
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/admin/requisitions/all` | All requisitions | Admin only |
| GET | `/admin/requisitions/stats` | Admin requisition stats | Admin only |
| GET | `/admin/requisitions/department/{deptId}` | Dept requisitions | Admin only |
| POST | `/admin/requisitions/{id}/force-approve` | Force approve | Admin only |
| POST | `/admin/requisitions/{id}/force-decline` | Force decline | Admin only |
| POST | `/admin/requisitions/{id}/force-return` | Force return | Admin only |
| POST | `/admin/requisitions/{id}/assign-approver` | Assign approver | Admin only |

### Admin Approval Management Endpoints
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/admin/approvals/all-pending` | All pending approvals | Admin only |
| GET | `/admin/approvals/delayed` | Delayed approvals | Admin only |
| POST | `/admin/approvals/{id}/escalate` | Escalate approval | Admin only |
| POST | `/admin/approvals/{id}/reassign` | Reassign approval | Admin only |

### Requisition Notification Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List notifications |
| GET | `/notifications/unread-count` | Unread count |
| POST | `/notifications/mark-all-read` | Mark all as read |
| DELETE | `/notifications/delete-all` | Delete all |
| GET | `/notifications/requisition/{reqId}` | Requisition notifications |
| GET | `/notifications/{id}` | Get notification |
| POST | `/notifications/{id}/mark-read` | Mark as read |
| DELETE | `/notifications/{id}` | Delete notification |

### Requisition Report Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/dashboard` | Dashboard report |
| GET | `/reports/summary` | Summary report |
| GET | `/reports/approval-performance` | Approval performance |
| GET | `/reports/budget-utilization` | Budget utilization |
| GET | `/reports/department/{deptId}` | Department report |
| GET | `/reports/export` | Export report |

### Global Budget Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/budgets/stats` | Budget statistics |
| GET | `/budgets/fiscal-years` | Fiscal years |

### Global Dropdown Data Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/departments/active` | Active departments |
| GET | `/roles/available` | Available roles |
| GET | `/supplier-categories` | Supplier categories |
| GET | `/approval-workflows/public` | Public workflows |
| GET | `/requisition-statuses` | Requisition statuses |
| GET | `/requisition-priorities` | Requisition priorities |
| GET | `/procurement-methods` | Procurement methods |
| GET | `/quotation-statuses` | Quotation statuses |
| GET | `/purchase-order-statuses` | PO statuses |
| GET | `/purchase-order-types` | PO types |

---

## 📊 Reports Available

1. **Requisition Register** - Complete list with filters
2. **Approval Tracking Report** - Time at each stage, bottlenecks
3. **Department Spending Report** - Spending by department with trends
4. **LPO/LSO Register** - All issued purchase/service orders
5. **Supplier Performance Report** - Delivery times, response rates
6. **GRN/SAN Register** - Received goods/services
7. **Payment Register** - All payments with voucher/cheque numbers
8. **Tender Register** - Tender-related requisitions
9. **Audit Trail Report** - Complete history of changes
10. **Approval Workflow Report** - Complete flow with timestamps
11. **Supplier Quotation Analysis** - Compare quotations
12. **Requisition by User** - Requisitions per user
13. **Average Approval Time** - Time from submission to final approval
14. **Rejected/Declined Requisitions** - With reasons
15. **Outstanding Payments** - Invoices not yet paid
16. **Emergency Requisitions** - Fast-track requisitions
17. **Supplier Blacklist** - Blacklisted suppliers with reasons
18. **Requisition Status Summary** - Dashboard summary

---

## 🔔 Notification System

### Methods
- **In-app notifications** (Dashboard alerts)
- **Email notifications** (SMTP configured)

### Events Triggering Notifications
- Requisition submitted/approved/declined/returned
- Quotation request sent/responded
- LPO/LSO generated
- GRN/SAN generated/approved
- Invoice submitted/verified/sent back
- Payment voucher generated/endorsed
- Approval deadline approaching/missed
- Supplier blacklisted/unblacklisted

---

## 📄 Document Generation

### PDF Documents
- Quotation Request (QTN)
- Local Purchase Order (LPO)
- Local Service Order (LSO)
- Goods Received Note (GRN)
- Service Acknowledgment Note (SAN)
- Payment Voucher
- Cheque
- Contract
- Tender Document

### Export Formats
- PDF (Print-ready with company branding)
- Excel (XLSX)
- CSV

---

## 🧪 Testing

### Backend Testing
```bash
# Run all tests
php artisan test

# Run specific test suites
php artisan test --testsuite=Unit
php artisan test --testsuite=Feature

# Run with coverage
php artisan test --coverage
```

### API Testing
```bash
# Using Laravel's built-in testing
php artisan test tests/Feature/Api/

# Using Pest (if configured)
./vendor/bin/pest
```

---

## 📁 Database Schema

### Core Tables
- `users` - System users with roles
- `roles` - User roles (ADMIN, HOD, ACCOUNTANT, PRINCIPAL, FINAL_APPROVER, PROCUREMENT, SUPPLIER, AUDITOR)
- `departments` - School departments
- `requisitions` - Main requisition records
- `requisition_items` - Items within requisitions
- `requisition_attachments` - File attachments
- `requisition_history` - Audit trail
- `requisition_budgets` - Budget allocations
- `requisition_revisions` - Revision history
- `approval_workflows` - Workflow definitions
- `approval_trails` - Approval tracking
- `suppliers` - Supplier information
- `suppliers_blacklist` - Blacklisted suppliers
- `quotation_requests` - QTN records
- `supplier_quotations` - Supplier responses
- `purchase_orders` - LPO/LSO records
- `purchase_order_items` - PO items
- `goods_received_notes` - GRN records
- `service_acknowledgment_notes` - SAN records
- `invoices` - Supplier invoices
- `invoice_items` - Invoice items
- `payment_vouchers` - Payment records
- `cheques` - Cheque tracking
- `contracts` - Contract management
- `tenders` - Tender management
- `signature_specimens` - Digital signatures
- `company_profiles` - Company information
- `audit_logs` - System audit trail
- `notifications` - In-app notifications
- `jobs` - Queue jobs
- `failed_jobs` - Failed queue jobs

---

## 🚨 Business Rules

1. ✅ All reference numbers are system-generated and configurable
2. ✅ Supplier accounts are created by Admin (no self-registration)
3. ✅ 2FA required for Admin, Accountant, Director/Finance Administrator
4. ✅ In-app + Email notifications for all events
5. ✅ 4-level approval workflow: HOD → Accountant → Principal → Director/Finance Administrator
6. ✅ System suggests lowest supplier price but requires recheck
7. ✅ LPO (Goods) / LSO (Services) - auto-determined
8. ✅ GRN/SAN approved by Head User (HOD/Principal)
9. ✅ Three-way matching: LPO + GRN + Invoice
10. ✅ Payment Voucher prepared by Accountant, endorsed by Head/Diocesan Accountant
11. ✅ Cheque Number recorded after physical issuance
12. ✅ Fast track/Emergency option available
13. ✅ Supplier blacklist tracking
14. ✅ Requisition amendments allowed after approval
15. ✅ Acting HOD temporary permissions available
16. ✅ All data retained forever unless explicitly removed

---

## 🔧 Maintenance

### Daily Tasks
- Review audit logs for suspicious activity
- Check system health (CPU, memory, disk space)
- Verify backup completion
- Monitor pending approvals

### Weekly Tasks
- Review pending approvals
- Check supplier blacklist
- Generate weekly reports
- Review system performance

### Monthly Tasks
- Review department spending
- Update system settings if needed
- Perform full system backup
- Review and update security settings
- User account review

---

## 🆘 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check MySQL/PostgreSQL status
sudo systemctl status mysql
# or
sudo systemctl status postgresql

# Verify credentials in .env
# Test connection
mysql -u sspms_user -p -h localhost sspms
```

**Email Sending Failed**
```bash
# Check SMTP configuration in .env
# Test with Laravel Tinker
php artisan tinker
Mail::raw('Test email', function($msg) { $msg->to('admin@example.com')->subject('Test'); });
```

**Permission Denied**
```bash
# Fix storage permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

**Queue Jobs Not Processing**
```bash
# Check queue worker status
sudo supervisorctl status

# Restart queue workers
php artisan queue:restart
sudo supervisorctl restart sspms-worker:*
```

---

## 📞 Support

### Documentation
- **User Manual**: `/docs/user-manual.md`
- **Admin Guide**: `/docs/admin-guide.md`
- **API Reference**: `/docs/api-reference.md`
- **Developer Guide**: `/docs/developer-guide.md`

### Contact
- **Issues**: [GitHub Issues](https://github.com/yourusername/sspms/issues)
- **Email**: support@sspms.com
- **Phone**: +254 XXX XXX XXX

---

## 🔒 License

This project is proprietary software. All rights reserved.

---

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- **PHP**: PSR-12
- **JavaScript**: ESLint + Prettier
- **CSS**: Tailwind CSS conventions
- **Git**: Conventional Commits

---

## 📈 Performance Metrics

- **Page Load Time**: < 2 seconds
- **API Response Time**: < 500ms
- **Concurrent Users**: Support for 100+ users
- **Uptime**: 99.9% SLA
- **Backup Recovery Time**: < 30 minutes

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT                           │
│  ┌─────────────────┐    ┌─────────────────┐        │
│  │  React/Vue SPA  │    │   Mobile App   │        │
│  └─────────────────┘    └─────────────────┘        │
└─────────────────┬───────────────────────────────────┘
                  │ HTTPS
                  ▼
┌─────────────────────────────────────────────────────┐
│                    Nginx                            │
│  ┌─────────────────────────────────────────────┐    │
│  │         Load Balancer & SSL Termination     │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│              PHP-FPM                                │
│  ┌─────────────────────────────────────────────┐    │
│  │         Laravel Application                 │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│                Laravel API                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │  Controllers │  │  Middleware  │  │  Routes  │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │   Services   │  │  Repositories│  │  Models  │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│              Data Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │   MySQL/     │  │    Redis     │  │   S3/    │  │
│  │ PostgreSQL   │  │   (Cache)    │  │  Files   │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Success Criteria

1. ✅ All users log in with role-specific permissions
2. ✅ Requisition creation < 5 minutes
3. ✅ One-click approval/decline with comments
4. ✅ Supplier portal for quotation responses
5. ✅ Professional PDF documents generated
6. ✅ Immediate notifications for all events
7. ✅ Reports generated and exported
8. ✅ Complete audit trail tracking
9. ✅ Fully configurable system settings
10. ✅ 2FA works for sensitive roles
11. ✅ All data secured and backed up
12. ✅ Mobile-responsive interface
13. ✅ 99.9% uptime SLA
14. ✅ All reference numbers configurable
15. ✅ Complete procurement lifecycle management

---

## 📝 Version History

- **v1.0.0** - Initial Release (Planned)
  - Complete requisition management
  - 4-level approval workflow
  - Quotation management
  - LPO/LSO generation
  - GRN/SAN management
  - Payment processing
  - Full reporting suite
  - Digital signatures
  - Company profile management

---

## 🤖 AI Development Guidelines

When developing this system with AI assistance:

### Context Awareness
- The AI should understand the complete procurement workflow
- All features should be interconnected as described
- Follow the exact specifications without modifications

### Code Quality
- Write clean, well-documented code
- Include comprehensive error handling
- Implement logging throughout
- Write unit tests for all features
- Follow security best practices

### Database Design
- Use MySQL/PostgreSQL with proper relationships
- Implement indexes for performance
- Use UUIDs for primary keys
- Store audit logs with user_id and timestamps
- Implement soft deletes where appropriate

### API Design
- RESTful principles
- Proper HTTP status codes
- Consistent response formats
- Authentication required
- Permission checking on every endpoint
- Versioned API structure (/api/v1)

### Documentation
- Maintain comprehensive README
- Include API documentation
- Provide user guides
- Document deployment process
- List all configuration options

---

## 📖 Additional Resources

- [System Requirements Document](./docs/requirements.md)
- [Technical Architecture](./docs/architecture.md)
- [Database Schema](./docs/database-schema.md)
- [API Reference](./docs/api-reference.md)
- [User Manual](./docs/user-manual.md)
- [Admin Guide](./docs/admin-guide.md)
- [Deployment Guide](./docs/deployment.md)
- [Security Guidelines](./docs/security.md)

---

**© 2026 SSPMS - School Supplies & Purchases Management System**
