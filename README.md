# CRM Module - Laravel Backend + React Frontend

A full-stack CRM (Customer Relationship Management) module built with Laravel (PHP) backend and React (TypeScript) frontend, based on the ERPNext CRM module architecture.

## Architecture

```
CRM/
├── backend/          # Laravel PHP API
│   ├── app/
│   │   ├── Http/Controllers/Api/   # API Controllers
│   │   ├── Models/                  # Eloquent Models
│   │   └── Services/                # Business Logic Services
│   ├── database/migrations/         # Database Migrations
│   └── routes/api.php               # API Routes
├── frontend/         # React TypeScript SPA
│   ├── src/
│   │   ├── components/              # UI Components
│   │   ├── pages/                   # Page Components
│   │   ├── services/api.ts          # API Integration
│   │   └── types/                   # TypeScript Types
│   └── package.json
└── README.md
```

## Backend Setup

### Requirements
- PHP 8.1+
- Composer

### Installation

```bash
cd backend
composer install
cp .env.example .env   # Then set DB_CONNECTION=sqlite
touch database/database.sqlite
php artisan key:generate
php artisan migrate
php artisan serve
```

The API will be available at `http://localhost:8000/api/v1`.

## Frontend Setup

### Requirements
- Node.js 18+

### Installation

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

Configure the API URL in `frontend/.env`:
```
VITE_API_URL=http://localhost:8000/api/v1
```

---

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Get CRM dashboard statistics (lead counts, opportunity values, etc.) |
| GET | `/dashboard/lead-conversion-funnel` | Get lead conversion funnel data |
| GET | `/dashboard/opportunity-pipeline` | Get opportunity pipeline by sales stage |

### Leads

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/leads` | List leads (filters: `status`, `qualification_status`, `lead_owner_id`, `territory`, `search`) |
| POST | `/leads` | Create a new lead |
| GET | `/leads/{id}` | Get a single lead with relationships |
| PUT | `/leads/{id}` | Update a lead |
| DELETE | `/leads/{id}` | Delete a lead |
| POST | `/leads/{id}/convert-to-opportunity` | Convert lead to opportunity |
| POST | `/leads/{id}/add-to-prospect` | Add lead to existing prospect (body: `prospect_id`) |
| POST | `/leads/{id}/create-prospect` | Create a new prospect from lead |

**Lead Create/Update Fields:**
- `first_name`, `last_name`, `middle_name`, `salutation` - Name fields
- `email_id`, `mobile_no`, `phone`, `whatsapp_no` - Contact info
- `company_name`, `job_title`, `industry` - Company info
- `status` - One of: Lead, Open, Replied, Opportunity, Quotation, Lost Quotation, Interested, Converted, Do Not Contact
- `qualification_status` - One of: Unqualified, In Process, Qualified
- `city`, `state`, `country`, `territory` - Location
- `annual_revenue`, `no_of_employees`, `market_segment` - Business info
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` - UTM tracking

### Opportunities

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/opportunities` | List opportunities (filters: `status`, `sales_stage_id`, `opportunity_owner_id`, `opportunity_from`, `search`) |
| POST | `/opportunities` | Create a new opportunity |
| GET | `/opportunities/{id}` | Get a single opportunity with items and relationships |
| PUT | `/opportunities/{id}` | Update an opportunity |
| DELETE | `/opportunities/{id}` | Delete an opportunity |
| POST | `/opportunities/{id}/declare-lost` | Mark opportunity as lost (body: `lost_reason_ids[]`, `competitor_ids[]`, `detailed_reason`) |
| POST | `/opportunities/set-multiple-status` | Bulk update status (body: `ids[]`, `status`) |

**Opportunity Fields:**
- `opportunity_from` (required) - Lead, Prospect, or Customer
- `party_id` (required) - ID of the source entity
- `customer_name`, `status`, `opportunity_type`
- `sales_stage_id`, `expected_closing`, `probability`
- `opportunity_amount`, `currency`, `conversion_rate`
- `contact_person`, `contact_email`, `contact_mobile`
- `items[]` - Array of line items with `item_code`, `item_name`, `qty`, `rate`, `uom`

### Prospects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/prospects` | List prospects (filters: `industry`, `territory`, `search`) |
| POST | `/prospects` | Create a new prospect |
| GET | `/prospects/{id}` | Get prospect with linked leads and opportunities |
| PUT | `/prospects/{id}` | Update a prospect |
| DELETE | `/prospects/{id}` | Delete a prospect |

**Prospect Fields:**
- `company_name` (required, unique)
- `industry`, `market_segment`, `customer_group`, `territory`
- `no_of_employees`, `annual_revenue`, `website`, `fax`

### Campaigns

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/campaigns` | List campaigns |
| POST | `/campaigns` | Create a campaign (with optional `email_schedules[]`) |
| GET | `/campaigns/{id}` | Get campaign with schedules and email campaigns |
| PUT | `/campaigns/{id}` | Update a campaign |
| DELETE | `/campaigns/{id}` | Delete a campaign |
| GET | `/email-campaigns` | List email campaigns |
| POST | `/email-campaigns` | Create an email campaign |
| PUT | `/email-campaigns/{id}` | Update an email campaign |
| DELETE | `/email-campaigns/{id}` | Delete an email campaign |

### Contracts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/contracts` | List contracts (filters: `status`, `party_type`, `search`) |
| POST | `/contracts` | Create a contract (with optional `fulfilment_checklists[]`) |
| GET | `/contracts/{id}` | Get contract with fulfilment checklists |
| PUT | `/contracts/{id}` | Update a contract |
| DELETE | `/contracts/{id}` | Delete a contract |
| POST | `/contracts/{id}/sign` | Sign a contract (body: `signee`, `ip_address`) |

**Contract Fields:**
- `party_type` (required) - Customer, Supplier, or Employee
- `party_name` (required), `contract_terms` (required)
- `start_date`, `end_date`, `contract_template`
- `requires_fulfilment`, `fulfilment_deadline`
- `fulfilment_checklists[]` - Array with `requirement`, `fulfilled`, `notes`

### Appointments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/appointments` | List appointments (filters: `status`, `search`) |
| POST | `/appointments` | Create an appointment |
| GET | `/appointments/{id}` | Get a single appointment |
| PUT | `/appointments/{id}` | Update an appointment |
| DELETE | `/appointments/{id}` | Delete an appointment |

**Appointment Fields:**
- `scheduled_time` (required), `customer_name` (required), `customer_email` (required)
- `status` - Open, Unverified, or Closed
- `customer_phone_number`, `customer_skype`, `customer_details`

### CRM Notes (Polymorphic)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notes?notable_type={type}&notable_id={id}` | List notes for an entity (type: lead, opportunity, prospect) |
| POST | `/notes` | Create a note (body: `notable_type`, `notable_id`, `note`) |
| DELETE | `/notes/{id}` | Delete a note |

### Sales Stages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sales-stages` | List all sales stages |
| POST | `/sales-stages` | Create a sales stage |
| GET | `/sales-stages/{id}` | Get a single sales stage |
| PUT | `/sales-stages/{id}` | Update a sales stage |
| DELETE | `/sales-stages/{id}` | Delete a sales stage |

### Lost Reasons

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/lost-reasons` | List all opportunity lost reasons |
| POST | `/lost-reasons` | Create a lost reason (body: `reason`) |
| DELETE | `/lost-reasons/{id}` | Delete a lost reason |

### Competitors

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/competitors` | List all competitors |
| POST | `/competitors` | Create a competitor (body: `competitor_name`, `website`) |
| DELETE | `/competitors/{id}` | Delete a competitor |

### CRM Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/settings` | Get CRM settings |
| PUT | `/settings` | Update CRM settings |

**Settings Fields:**
- `campaign_naming_by` - Campaign Name or Naming Series
- `allow_lead_duplication_based_on_emails` - boolean
- `auto_creation_of_contact` - boolean
- `close_opportunity_after_days` - integer
- `carry_forward_communication_and_comments` - boolean

---

## Data Models

### Core Entities
- **Lead** - Sales leads with contact info, company details, qualification status, UTM tracking
- **Opportunity** - Sales opportunities linked to leads/prospects with pipeline stages, amounts, line items
- **Prospect** - Organization-level entity grouping multiple leads and opportunities
- **Campaign** - Marketing campaigns with email schedules
- **Contract** - Contracts with party management, signing workflow, fulfilment checklists
- **Appointment** - Customer appointment scheduling

### Supporting Entities
- **SalesStage** - Configurable pipeline stages (e.g., Prospecting, Qualification, Proposal)
- **OpportunityLostReason** - Reasons for lost opportunities
- **Competitor** - Competitor tracking linked to opportunities
- **CrmNote** - Polymorphic notes attachable to leads, opportunities, or prospects
- **CrmSetting** - Global CRM configuration

## Key Workflows

1. **Lead Qualification**: Lead -> Qualified -> Convert to Opportunity
2. **Opportunity Pipeline**: Open -> Quotation -> Converted/Lost (with reasons and competitors)
3. **Prospect Grouping**: Group multiple leads under a prospect organization
4. **Contract Lifecycle**: Create -> Sign -> Track Fulfilment -> Active/Expired
5. **Campaign Management**: Create campaigns with email schedules and track execution
