# Phase 3: Resume Storage API Routes

This document describes the API routes implemented for resume storage and management.

## API Routes

### 1. Save Resume (`POST /api/resume/save`)

Creates a new resume or updates an existing one.

**Request Body:**
```json
{
  "sections": StructuredResumeSection[],
  "templateId": string (optional),
  "title": string (optional),
  "resumeId": string (optional) // If provided, updates existing resume
}
```

**Response:**
```json
{
  "success": true,
  "resumeId": "uuid",
  "resume": {
    "id": "uuid",
    "title": "string",
    "template_id": "string",
    "sections": StructuredResumeSection[],
    "created_at": "ISO string",
    "updated_at": "ISO string"
  }
}
```

**Features:**
- Validates sections structure
- Auto-generates title from personal info if not provided
- Creates new resume if `resumeId` is not provided
- Updates existing resume if `resumeId` is provided
- Enforces user ownership (RLS)

**Example:**
```typescript
const response = await fetch('/api/resume/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sections: resumeSections,
    templateId: 'modern',
    title: 'My Resume'
  })
});
```

---

### 2. Load Resume (`GET /api/resume/[id]`)

Fetches a resume by ID.

**Response:**
```json
{
  "success": true,
  "resume": {
    "id": "uuid",
    "title": "string",
    "template_id": "string",
    "sections": StructuredResumeSection[],
    "status": "draft" | "compiled",
    "ats_score": number | null,
    "created_at": "ISO string",
    "updated_at": "ISO string"
  }
}
```

**Error Responses:**
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (resume belongs to another user)
- `404` - Resume not found

**Features:**
- RLS ensures users can only access their own resumes
- Returns full resume data including sections

**Example:**
```typescript
const response = await fetch(`/api/resume/${resumeId}`);
const { resume } = await response.json();
```

---

### 3. List Resumes (`GET /api/resume/list`)

Fetches all resumes for the authenticated user with pagination.

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20, max: 100) - Items per page

**Response:**
```json
{
  "success": true,
  "resumes": [
    {
      "id": "uuid",
      "title": "string",
      "template_id": "string",
      "status": "draft" | "compiled",
      "ats_score": number | null,
      "created_at": "ISO string",
      "updated_at": "ISO string"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

**Features:**
- Paginated results
- Sorted by `updated_at` DESC (most recent first)
- Returns metadata only (no sections_data for performance)

**Example:**
```typescript
const response = await fetch('/api/resume/list?page=1&limit=20');
const { resumes, pagination } = await response.json();
```

---

### 4. Delete Resume (`DELETE /api/resume/[id]`)

Deletes a resume and its associated PDF from storage.

**Response:**
```json
{
  "success": true,
  "message": "Resume deleted successfully"
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Resume not found or unauthorized

**Features:**
- Deletes resume from database
- Attempts to delete associated PDF from storage
- Continues with database deletion even if storage deletion fails
- Enforces user ownership

**Example:**
```typescript
const response = await fetch(`/api/resume/${resumeId}`, {
  method: 'DELETE'
});
```

---

## Security

All routes:
- ✅ Require authentication
- ✅ Use RLS (Row Level Security) policies
- ✅ Verify user ownership
- ✅ Use server-side Supabase client with session management
- ✅ Return appropriate error codes

## Error Handling

All routes return consistent error responses:
```json
{
  "error": "Error message",
  "details": "Detailed error information (in development)"
}
```

Common status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Usage Examples

### Save a new resume
```typescript
const saveResume = async (sections: StructuredResumeSection[], templateId?: string) => {
  const response = await fetch('/api/resume/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sections, templateId })
  });
  
  if (!response.ok) {
    throw new Error('Failed to save resume');
  }
  
  return await response.json();
};
```

### Update existing resume
```typescript
const updateResume = async (resumeId: string, sections: StructuredResumeSection[]) => {
  const response = await fetch('/api/resume/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeId, sections })
  });
  
  return await response.json();
};
```

### Load resume
```typescript
const loadResume = async (resumeId: string) => {
  const response = await fetch(`/api/resume/${resumeId}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Resume not found');
    }
    throw new Error('Failed to load resume');
  }
  
  const { resume } = await response.json();
  return resume;
};
```

### List all resumes
```typescript
const listResumes = async (page = 1, limit = 20) => {
  const response = await fetch(`/api/resume/list?page=${page}&limit=${limit}`);
  const { resumes, pagination } = await response.json();
  return { resumes, pagination };
};
```

### Delete resume
```typescript
const deleteResume = async (resumeId: string) => {
  const response = await fetch(`/api/resume/${resumeId}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete resume');
  }
  
  return await response.json();
};
```

## Next Steps

After implementing these API routes, you can:
1. Create Zustand stores to manage resume state
2. Integrate save/load functionality in the resume builder
3. Add auto-save functionality
4. Update dashboard to list and manage resumes
5. Add resume versioning/history
