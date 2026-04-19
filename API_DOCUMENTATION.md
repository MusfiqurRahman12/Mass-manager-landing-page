````

### Role-Based Access Control
- **`manager`**: Full access to mess operations, member
management, financial records
- **`member`**: Read-only access to personal data, meals,
deposits, and notifications

---

## 2. Authentication Endpoints (`/auth`)

### 2.1 Register User
Create a new user account.

**Endpoint:** `POST /auth/register`
**Authentication:** None
**Rate Limit:** 5 requests/minute

**Request Schema:**
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `email` | string | Yes | Valid email format, max 255 chars
| User email address |
| `full_name` | string | Yes | 2-100 chars, letters/spaces
only | User full name |
| `password` | string | Yes | Min 8 chars, must contain
uppercase, lowercase, number | Secure password |

**Request Example:**
```json
{
  "email": "user@example.com",
  "full_name": "John Doe",
  "password": "SecurePass123"
}
````

**Response Schema (201 Created):**
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique user identifier |
| `email` | string | Registered email |
| `full_name` | string | User's full name |
| `role` | string | Default: `"member"` |
| `created_at` | ISO 8601 datetime | Registration timestamp  
|

**Response Example:**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "member",
  "created_at": "2025-04-15T10:30:00Z"
}
```

**Error Responses:**

- `400`: Email already exists or validation error
- `422`: Password too weak or invalid email format

---

### 2.2 Login

Authenticate and receive access token.

**Endpoint:** `POST /auth/login`  
**Authentication:** None  
**Rate Limit:** 10 requests/minute

**Request Schema:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Registered email |
| `password` | string | Yes | User password |

**Response Schema (200 OK):**
| Field | Type | Description |
|-------|------|-------------|
| `access_token` | JWT string | Bearer token (expires in
24h) |
| `token_type` | string | Always `"bearer"` |

**Response Example:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Error Responses:**

- `401`: Invalid credentials
- `403`: Account suspended (if implemented)

---

### 2.3 Create Mess

Initialize a new mess. First user automatically becomes
manager.

**Endpoint:** `POST /auth/create-mess`  
**Authentication:** Bearer Token  
**Prerequisites:** User must not be in any existing mess

**Request Schema:**
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `name` | string | Yes | 3-100 chars | Mess/household name  
|
| `address` | string | No | Max 500 chars | Physical
address |
| `automatic_market_date` | string | No | Enum: `Monday` to  
`Sunday` | Weekly market day |

**Request Example:**

```json
{
  "name": "Sunrise Mess",
  "address": "123 Main Street, Dhaka",
  "automatic_market_date": "Friday"
}
```

**Response Schema (201 Created):**
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Mess identifier |
| `name` | string | Mess name |
| `address` | string\|null | Address |
| `manager_id` | UUID | Current manager's user ID |
| `automatic_market_date` | string\|null | Market day |
| `created_at` | ISO 8601 datetime | Creation timestamp |

**Error Responses:**

- `400`: User already in a mess
- `403`: Insufficient permissions

---

### 2.4 Join Mess

Join an existing mess using invitation ID.

**Endpoint:** `POST /auth/join-mess/{mess_id}`  
**Authentication:** Bearer Token  
**Parameters:**

- `mess_id` (path): UUID of the mess to join

**Response Schema (200 OK):**
| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Success confirmation |
| `mess_name` | string | Joined mess name |

**Response Example:**

```json
{
  "message": "Successfully joined mess: Sunrise Mess",
  "mess_name": "Sunrise Mess"
}
```

**Error Responses:**

- `404`: Mess not found
- `409`: Already a member of a mess

---

### 2.5 Get Current User

Retrieve authenticated user details.

**Endpoint:** `GET /auth/me`  
**Authentication:** Bearer Token

**Response Schema (200 OK):** Same as Register User, plus:
| Field | Type | Description |
|-------|------|-------------|
| `mess_id` | UUID\|null | Current mess ID if joined |

---

## 3. Mess Management (`/mess`)

### 3.1 Get Mess Details

Retrieve current mess information.

**Endpoint:** `GET /mess`  
**Authentication:** Bearer Token

**Response Schema (200 OK):**
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Mess ID |
| `name` | string | Mess name |
| `address` | string\|null | Address |
| `manager_id` | UUID | Manager's user ID |
| `automatic_market_date` | string\|null | Weekly market day  
|
| `member_count` | integer | Number of active members |
| `created_at` | ISO 8601 datetime | Creation date |

---

### 3.2 Update Mess

Modify mess details.

**Endpoint:** `PUT /mess`
**Authentication:** Bearer Token (Manager only)  
**Content-Type:** `application/json`

**Request Schema:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | No | 3-100 chars |
| `address` | string | No | Max 500 chars |
| `automatic_market_date` | string | No | Enum:
`Monday`-`Sunday` |

**Note:** Partial updates supported. Omit fields to keep
current values.

**Response Schema (200 OK):** Updated mess object (same as  
3.1)

**Error Responses:**

- `403`: Requires manager role
- `404`: Mess not found

---

### 3.3 Delete Mess

Permanently delete mess and all associated data.

**Endpoint:** `DELETE /mess`  
**Authentication:** Bearer Token (Manager only)  
**Prerequisites:** No active months (all months must be
closed/archived)

**Response:** `204 No Content`

**Error Responses:**

- `403`: Not manager
- `409`: Cannot delete mess with active months

---

## 4. Member Management (`/members`)

### 4.1 List Members

Get all active members of current mess.

**Endpoint:** `GET /members`  
**Authentication:** Bearer Token

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `include_inactive` | boolean | `false` | Include
deactivated members |

**Response Schema (200 OK):** Array of Member objects

**Member Object Schema:**
| Field | Type | Description |
|-------|------|-------------|
| `user_id` | UUID | Member's user ID |
| `email` | string | Email address |
| `full_name` | string | Display name |
| `joined_at` | ISO 8601 datetime | Join date |
| `is_active` | boolean | Membership status |
| `role` | string | Enum: `manager`, `member` |
| `phone` | string\|null | Contact number (if available) |

**Response Example:**

```json
[
  {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "alice@example.com",
    "full_name": "Alice Smith",
    "joined_at": "2025-04-01T10:00:00Z",
    "is_active": true,
    "role": "manager"
  }
]
```

---

### 4.2 Add Member

Invite existing user to mess by email.

**Endpoint:** `POST /members`  
**Authentication:** Bearer Token (Manager only)

**Request Schema:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `email` | string | Yes | Valid email, user must exist in  
system |

**Response Schema (201 Created):** Member object (same as
4.1)

**Error Responses:**

- `404`: User with email not found
- `409`: User already in this mess

---

### 4.3 Remove Member

Remove member from mess.

**Endpoint:** `DELETE /members/{user_id}`  
**Authentication:** Bearer Token (Manager only)  
**Constraints:** Cannot remove self; cannot remove last
manager

**Parameters:**

- `user_id` (path): UUID of member to remove

**Response:** `204 No Content`

---

### 4.4 Transfer Manager Role

Immediately transfer manager privileges.

**Endpoint:** `PUT /members/transfer-manager`  
**Authentication:** Bearer Token (Manager only)

**Request Schema:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | UUID | Yes | Target member's user ID |

**Response Schema (200 OK):**

```json
{
  "message": "Manager role transferred to Bob",
  "new_manager_id": "uuid",
  "previous_manager_id": "uuid"
}
```

---

## 5. Monthly Operations (`/months`)

### 5.1 Get Active Month

Retrieve current active month details.

**Endpoint:** `GET /months/active`  
**Authentication:** Bearer Token

**Response Schema (200 OK):**
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Month record ID |
| `mess_id` | UUID | Mess reference |
| `month_year` | date | First day of month (YYYY-MM-DD) |
| `is_active` | boolean | Currently active flag |
| `opening_balance` | float | Starting balance (from
previous month) |
| `total_meal` | integer | Sum of all meals |
| `total_cost` | float | Total expenses for month |
| `meal_rate` | float | Calculated: `total_cost / 
total_meal` |
| `closing_balance` | float | Remaining balance |
| `created_at` | ISO 8601 datetime | Month start date |

**Calculation Formulas:**

```
meal_rate = total_cost / total_meal (if total_meal > 0, else
0)
closing_balance = opening_balance + total_deposits -
total_cost
```

---

### 5.2 Start New Month

Close current month and initialize new one.

**Endpoint:** `POST /months/start`  
**Authentication:** Bearer Token (Manager only)
**Side Effects:** Calculates final meal rate, carries over  
balance

**Request Schema:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `month_year` | date | Yes | Format: `YYYY-MM-01`, must be  
future month |

**Request Example:**

```json
{
  "month_year": "2025-05-01"
}
```

**Response Schema (201 Created):** Month object (same as
5.1)

**Error Responses:**

- `400`: Invalid date or month already exists
- `409`: Previous month has pending calculations

---

### 5.3 Get Month History

Paginated list of closed months.

**Endpoint:** `GET /months/history`  
**Authentication:** Bearer Token

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 12 | Max 50 |
| `offset` | integer | 0 | Pagination offset |
| `year` | integer | - | Filter by year |

**Response Schema (200 OK):**

```json
{
  "data": [
    /* Array of month objects */
  ],
  "total": 24,
  "limit": 12,
  "offset": 0
}
```

---

### 5.4 Get Specific Month

Retrieve any month's details by ID.

**Endpoint:** `GET /months/{month_id}`  
**Authentication:** Bearer Token

**Response:** Month object (same as 5.1)

---

## 6. Meal Management (`/meals`)

### 6.1 List Meals

Get meal records with optional filtering.

**Endpoint:** `GET /meals`  
**Authentication:** Bearer Token

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `member_id` | UUID | Filter by specific member (Manager
only) |
| `meal_date` | date | Format: YYYY-MM-DD |
| `start_date` | date | Date range start |
| `end_date` | date | Date range end |

**Response Schema (200 OK):** Array of Meal objects

**Meal Object Schema:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Meal record ID |
| `member_id` | UUID | Member reference |
| `month_id` | UUID | Month reference |
| `meal_date` | date | Date of meals |
| `meal_count` | float | Number of meals (0.5, 1, 2, etc.) |
| `created_at` | ISO 8601 datetime | Entry timestamp |
| `updated_at` | ISO 8601 datetime | Last modification |

---

### 6.2 Add/Update Meal

Create or update meal entry (upsert operation).

**Endpoint:** `POST /meals`  
**Authentication:** Bearer Token (Manager only)

**Request Schema:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `member_id` | UUID | Yes | Must be active member |
| `meal_date` | date | Yes | Current month only |
| `meal_count` | float | Yes | Min 0, max 10, increments of  
0.5 |

**Response Schema (201 Created):** Meal object

**Notes:** If entry exists for date+member, updates
existing; otherwise creates new.

---

### 6.3 Update Meal Entry

Modify existing meal record.

**Endpoint:** `PUT /meals/{meal_id}`  
**Authentication:** Bearer Token (Manager only)

**Request Schema:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `meal_count` | float | Yes | Min 0, max 10 |

**Response:** Updated meal object

---

### 6.4 Delete Meal

Remove meal entry.

**Endpoint:** `DELETE /meals/{meal_id}`  
**Authentication:** Bearer Token (Manager only)  
**Response:** `204 No Content`

---

### 6.5 Get Meal Cost Summary

Current month's financial summary.

**Endpoint:** `GET /meals/cost`  
**Authentication:** Bearer Token

**Response Schema (200 OK):**

```json
{
  "meal_rate": 125.0,
  "total_cost": 15000.0,
  "total_meal": 120,
  "projected_cost": 16000.0,
  "balance": 2000.0
}
```

---

### 6.6 Set Total Cost

Update monthly expense total (recalculates rate).

**Endpoint:** `POST /meals/cost`  
**Authentication:** Bearer Token (Manager only)

**Request Schema:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `total_cost` | float | Yes | Min 0, max 999999999.99 |

**Response:** Updated cost summary object

---

## 7. Expense Tracking (`/expenses`)

### 7.1 List Expenses

Retrieve expense records.

**Endpoint:** `GET /expenses`  
**Authentication:** Bearer Token

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `month_id` | UUID | Filter by month |
| `category` | string | Filter by category |
| `start_date` | date | Date range |
| `end_date` | date | Date range |

**Categories Enum:** `electricity`, `gas`, `water`, `rent`,  
`groceries`, `misc`, `salary`, `maintenance`

**Response Schema (200 OK):** Array of Expense objects

**Expense Object Schema:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Expense ID |
| `mess_id` | UUID | Mess reference |
| `month_id` | UUID | Month reference |
| `category` | string | Expense category |
| `amount` | float | Cost amount |
| `description` | string | Details |
| `expense_date` | date | When incurred |
| `created_by` | UUID | User who added |
| `created_at` | ISO 8601 datetime | Record creation |

---

### 7.2 Create Expense

Add new expense entry.

**Endpoint:** `POST /expenses`
**Authentication:** Bearer Token (Manager only)

**Request Schema:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `category` | string | Yes | Valid category enum |
| `amount` | float | Yes | Positive number |
| `description` | string | No | Max 500 chars |
| `expense_date` | date | Yes | Not future date |

**Response (201 Created):** Expense object

---

### 7.3 Update Expense

Modify expense details.

**Endpoint:** `PUT /expenses/{expense_id}`  
**Authentication:** Bearer Token (Manager only)

**Request Schema:** Partial update supported (any fields
from 7.2)

**Response:** Updated expense object

---

### 7.4 Delete Expense

Remove expense record.

**Endpoint:** `DELETE /expenses/{expense_id}`  
**Authentication:** Bearer Token (Manager only)  
**Response:** `204 No Content`

---

## 8. Deposit Management (`/deposits`)

### 8.1 List Deposits

View deposit records.

**Endpoint:** `GET /deposits`
**Authentication:** Bearer Token

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `month_id` | UUID | Filter by month |
| `member_id` | UUID | Manager only (members see only own
deposits) |

**Response Schema (200 OK):** Array of Deposit objects

**Deposit Object Schema:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Deposit ID |
| `member_id` | UUID | Who deposited |
| `month_id` | UUID | Which month |
| `amount` | float | Amount deposited |
| `deposit_date` | date | Transaction date |
| `note` | string | Reference/note |
| `created_by` | UUID | Manager who recorded |
| `created_at` | ISO 8601 datetime | Record timestamp |

---

### 8.2 Create Deposit

Record a member's deposit.

**Endpoint:** `POST /deposits`  
**Authentication:** Bearer Token (Manager only)

**Request Schema:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `member_id` | UUID | Yes | Active member |
| `amount` | float | Yes | Positive |
| `deposit_date` | date | Yes | Current or past date |
| `note` | string | No | Max 255 chars |

**Response (201 Created):** Deposit object

---

### 8.3 Update Deposit

Modify deposit record.

**Endpoint:** `PUT /deposits/{deposit_id}`  
**Authentication:** Bearer Token (Manager only)

**Request Schema:** Partial update supported

**Response:** Updated deposit object

---

### 8.4 Delete Deposit

Remove deposit entry.

**Endpoint:** `DELETE /deposits/{deposit_id}`  
**Authentication:** Bearer Token (Manager only)  
**Response:** `204 No Content`

---

## 9. Notifications (`/notifications`)

### 9.1 Get Notifications

Retrieve user's notifications.

**Endpoint:** `GET /notifications`  
**Authentication:** Bearer Token

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 50 | Max 100 |
| `offset` | integer | 0 | Pagination |
| `unread_only` | boolean | false | Filter unread |

**Notification Types:** `expense_added`, `meal_updated`,
`deposit_added`, `manager_transferred`, `month_closed`,
`member_joined`, `member_removed`

**Response Schema (200 OK):** Array of Notification objects

**Notification Object Schema:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Notification ID |
| `user_id` | UUID | Recipient |
| `mess_id` | UUID | Mess context |
| `type` | string | Notification type enum |
| `title` | string | Short description |
| `body` | string | Detailed message |
| `is_read` | boolean | Read status |
| `related_entity_id` | UUID | Reference to related record |
| `created_at` | ISO 8601 datetime | Timestamp |

---

### 9.2 Get Unread Count

Count unread notifications.

**Endpoint:** `GET /notifications/unread-count`  
**Authentication:** Bearer Token

**Response Schema (200 OK):**

```json
{
  "unread_count": 5,
  "last_notification_at": "2025-04-15T10:30:00Z"
}
```

---

### 9.3 Mark as Read

Update notification status.

**Endpoint:** `PATCH /notifications/{notification_id}`  
**Authentication:** Bearer Token

**Request Schema:**
| Field | Type | Required |
|-------|------|----------|
| `is_read` | boolean | Yes |

**Response:** Updated notification object

---

### 9.4 Mark All Read

Bulk update read status.

**Endpoint:** `POST /notifications/mark-all-read`  
**Authentication:** Bearer Token

**Response Schema (200 OK):**

```json
{
  "message": "All notifications marked as read",
  "updated_count": 5
}
```

---

### 9.5 Delete Notification

Remove notification.

**Endpoint:** `DELETE /notifications/{notification_id}`  
**Authentication:** Bearer Token  
**Response:** `204 No Content`

---

## 10. Manager Transfer (`/transfer`)

### 10.1 Request Transfer

Initiate manager role transfer process.

**Endpoint:** `POST /transfer/request`  
**Authentication:** Bearer Token (Manager only)

**Request Schema:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `to_member_id` | UUID | Yes | Member to receive
manager role |

**Response Schema (200 OK):**

```json
{
  "message": "Transfer request sent to John",
  "transfer_id": "uuid",
  "expires_at": "2025-04-22T10:00:00Z"
}
```

**Note:** Transfer request expires in 7 days.

---

### 10.2 Get Pending Transfers

View incoming transfer requests.

**Endpoint:** `GET /transfer/pending`  
**Authentication:** Bearer Token

**Response Schema (200 OK):** Array of TransferRequest
objects

**TransferRequest Object:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Transfer request ID |
| `from_manager_id` | UUID | Current manager |
| `from_manager_name` | string | Manager's name |
| `requested_at` | ISO 8601 datetime | Request time |
| `expires_at` | ISO 8601 datetime | Expiration time |

---

### 10.3 Approve Transfer

Accept manager role.

**Endpoint:** `POST /transfer/{transfer_id}/approve`  
**Authentication:** Bearer Token (Target member only)

**Response Schema (200 OK):**

```json
{
  "message": "You are now the manager",
  "effective_date": "2025-04-15T12:00:00Z"
}
```

---

### 10.4 Reject Transfer

Decline manager role.

**Endpoint:** `DELETE /transfer/{transfer_id}/reject`  
**Authentication:** Bearer Token (Target member or current  
manager)

**Response Schema (200 OK):**

```json
{
  "message": "Transfer request rejected"
}
```

---

## 11. Reports & PDFs (`/pdf`)

**Important:** These endpoints return `Content-Type:
application/pdf`, not JSON.

### 11.1 Monthly Mess Statement

Download complete monthly report.

**Endpoint:** `GET /pdf/month/{month_id}`  
**Authentication:** Bearer Token  
**Response:** PDF file  
**Filename:** `mess_statement_YYYY_MM.pdf`

**Contents Include:**

- Monthly summary (meals, costs, rates)
- Member-wise meal counts
- Expense breakdown
- Deposit summary
- Balance sheet

---

### 11.2 Individual Member Statement

Download specific member's monthly report.

**Endpoint:** `GET 
/pdf/member-statement/{member_id}/{month_id}`  
**Authentication:** Bearer Token (Manager can access any
member; members can access own)  
**Response:** PDF file  
**Filename:** `member_statement_{full_name}_{YYYY_MM}.pdf`

---

## 12. Error Handling

### Standard Error Response Format

```json
{
  "detail": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2025-04-15T10:30:00Z",
  "request_id": "req-uuid"
}
```

### HTTP Status Codes

| Code  | Meaning      | Common Causes                          |
| ----- | ------------ | -------------------------------------- |
| `200` | OK           | Success                                |
| `201` | Created      | Resource created successfully          |
| `204` | No Content   | Delete successful                      |
| `400` | Bad Request  | Validation error, malformed JSON       |
| `401` | Unauthorized | Missing or invalid token               |
| `403` | Forbidden    | Insufficient permissions (not manager) |

|
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Business logic violation (duplicate,
already exists) |
| `422` | Unprocessable Entity | Validation error (wrong
types) |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |

### Common Error Codes

| Code                     | Description                      | Resolution |
| ------------------------ | -------------------------------- | ---------- |
| `USER_ALREADY_IN_MESS`   | User cannot join multiple messes |
| Leave current mess first |
| `NO_ACTIVE_MONTH`        | Operation requires active month  |
| Start a new month        |
| `INVALID_MEAL_DATE`      | Date outside current month       | Use        |
| current month dates      |
| `INSUFFICIENT_BALANCE`   | Negative balance not allowed     |
| Add deposits             |
| `TRANSFER_EXPIRED`       | Manager transfer request expired |
| Create new request       |

---

## Data Types Reference

### UUID Format

Standard UUID v4: `550e8400-e29b-41d4-a716-446655440000`

### Date Formats

- **Date:** `YYYY-MM-DD` (e.g., `2025-04-15`)
- **DateTime:** ISO 8601 UTC `YYYY-MM-DDTHH:mm:ssZ` (e.g.,  
  `2025-04-15T10:30:00Z`)

### Monetary Values

- Type: Float/Decimal
- Precision: 2 decimal places
- Currency: Local currency (assumed BDT/Taka based on
  context)
- Example: `1500.50`

### Meal Counts

- Type: Float
- Allowed values: 0, 0.5, 1, 1.5, 2, ... up to 10
- Represents number of meals (0.5 = half meal)

---

## Implementation Notes for Frontend

### 1. Token Management

- Store token securely (HttpOnly cookie preferred, or secure  
  storage)
- Refresh token not implemented; re-login required after
  expiry
- Include token in all requests except login/register

### 2. Real-time Updates

- Polling recommended for notifications every 60 seconds
- Or implement WebSocket connection (if available) for live  
  updates

### 3. PDF Handling

```javascript
// Download PDF
window.open(`${BASE_URL}/pdf/month/${monthId}`, "_blank");

// Or with auth header (requires fetch + blob)
const response = await fetch(`${BASE_URL}/pdf/month/${monthId}`, {
  headers: { Authorization: `Bearer ${token}` },
});
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = `statement.pdf`;
a.click();
```

### 4. Calculation Caching

- Meal rate changes when `POST /meals/cost` is called
- Recalculate member balances client-side: `meals_consumed *      
meal_rate - deposits`

### 5. Validation

- Validate emails before sending to API
- Meal counts must be multiples of 0.5
- Dates should be timezone-aware (store UTC, display local)

### 6. Offline Support

- Queue meal updates if offline
- Sync when connection restored
- Handle conflict resolution for concurrent edits

---

**Last Updated:** 2025-04-15  
**API Version:** 1.0.0  
**Documentation Version:** 1.1.0
