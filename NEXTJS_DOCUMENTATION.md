# 📚 Complete Next.js Documentation for Beginners

## Table of Contents
1. [What is Next.js?](#what-is-nextjs)
2. [Project Overview](#project-overview)
3. [Next.js Core Concepts](#nextjs-core-concepts)
4. [Project Structure Explained](#project-structure-explained)
5. [File-by-File Breakdown](#file-by-file-breakdown)
6. [How the Application Works](#how-the-application-works)
7. [Key Technologies Used](#key-technologies-used)
8. [Common Patterns & Best Practices](#common-patterns--best-practices)
9. [Development Workflow](#development-workflow)
10. [Troubleshooting](#troubleshooting)

---

## What is Next.js?

**Next.js** is a React framework that makes it easy to build full-stack web applications. Think of it as React with superpowers:

### Key Features:
- **Server-Side Rendering (SSR)**: Pages are rendered on the server before sending to the browser
- **Static Site Generation (SSG)**: Pages can be pre-built at build time
- **API Routes**: Build backend APIs without a separate server
- **File-Based Routing**: Create pages by adding files to folders
- **Automatic Code Splitting**: Only loads the code needed for each page
- **Built-in CSS Support**: Easy styling with CSS Modules, Tailwind, etc.
- **Image Optimization**: Automatically optimizes images
- **TypeScript Support**: Built-in TypeScript support

### Why Next.js?
- **Faster Development**: Less configuration needed
- **Better Performance**: Optimized out of the box
- **SEO Friendly**: Server-side rendering helps with search engines
- **Full-Stack**: Can build both frontend and backend in one project

---

## Project Overview

This project is a **Content Management System (CMS)** for managing events. It connects to Webflow CMS to store and retrieve event data.

### What This App Does:
1. **User Authentication**: Users sign in/up using Clerk
2. **Event Management**: Create, view, and edit events
3. **Data Sync**: Automatically syncs user data to Webflow CMS
4. **Image Upload**: Upload event thumbnails
5. **Admin Features**: Admins can see all events, regular users see only their own

### Tech Stack:
- **Next.js 15.5.11**: The framework
- **React 19**: UI library
- **TypeScript**: Type-safe JavaScript
- **Clerk**: Authentication service
- **Webflow CMS API**: Backend data storage
- **CSS Modules**: Component-scoped styling

---

## Next.js Core Concepts

### 1. **App Router (Next.js 13+)**

This project uses the **App Router**, which is the modern way to build Next.js apps. Key features:

#### File-Based Routing
```
app/
  page.tsx          → http://localhost:3000/
  addevents/
    page.tsx        → http://localhost:3000/addevents
  sign-in/
    [[...sign-in]]/
      page.tsx      → http://localhost:3000/sign-in
```

#### Special Files:
- `page.tsx` - Creates a route/page
- `layout.tsx` - Shared layout for routes
- `route.ts` - API endpoint (not a page)
- `loading.tsx` - Loading UI
- `error.tsx` - Error UI

### 2. **Server Components vs Client Components**

#### Server Components (Default)
- Run on the server
- Can directly access databases/APIs
- Smaller bundle size (code doesn't go to browser)
- Cannot use React hooks (`useState`, `useEffect`)
- Cannot use browser APIs

```typescript
// Server Component (default)
export default function ServerPage() {
  // This runs on the server
  const data = await fetch('https://api.example.com/data');
  return <div>{data}</div>;
}
```

#### Client Components
- Run in the browser
- Can use React hooks
- Can use browser APIs
- Must have `"use client"` directive at the top

```typescript
// Client Component
"use client";

import { useState } from 'react';

export default function ClientPage() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### 3. **API Routes**

API routes are server-side endpoints. They live in `app/api/` folder:

```
app/api/
  collection/
    route.ts        → GET /api/collection
  collection/items/
    route.ts        → GET/POST /api/collection/items
    [itemId]/
      route.ts      → GET/PUT/DELETE /api/collection/items/123
```

**Example API Route:**
```typescript
// app/api/collection/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // This runs on the server
  const data = await fetch('https://api.webflow.com/...');
  return NextResponse.json(data);
}
```

### 4. **Middleware**

Middleware runs before requests are processed. Used for:
- Authentication checks
- Redirects
- Request/response modification

```typescript
// middleware.ts
export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.redirect('/sign-in');
  }
  
  return NextResponse.next();
});
```

### 5. **Layouts**

Layouts wrap pages and persist across navigation:

```typescript
// app/layout.tsx - Root layout (wraps all pages)
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Navbar />
        {children} {/* This is where page content goes */}
      </body>
    </html>
  );
}
```

---

## Project Structure Explained

```
Gatherings/
├── app/                          # Main application folder (App Router)
│   ├── layout.tsx               # Root layout (wraps all pages)
│   ├── page.tsx                 # Home page (/)
│   ├── globals.css              # Global styles
│   │
│   ├── api/                     # API routes (backend)
│   │   ├── collection/          # Event collection API
│   │   ├── categories/          # Categories API
│   │   ├── communities/         # Communities API
│   │   ├── locations/           # Locations API
│   │   ├── users/               # Users API
│   │   ├── upload-image/        # Image upload API
│   │   ├── sync-user/           # User sync API
│   │   └── webhooks/            # Webhook handlers
│   │
│   ├── components/              # Reusable React components
│   │   ├── EditItemModal.tsx    # Modal for editing events
│   │   ├── MultiSelectBadge.tsx # Multi-select component
│   │   ├── ImageUpload.tsx      # Image upload component
│   │   ├── RichTextEditor.tsx   # Rich text editor
│   │   └── Navbar.tsx           # Navigation bar
│   │
│   ├── addevents/               # Add event page
│   │   └── page.tsx
│   │
│   ├── sign-in/                 # Sign-in page
│   │   └── [[...sign-in]]/
│   │       └── page.tsx
│   │
│   └── sign-up/                 # Sign-up page
│       └── [[...sign-up]]/
│           └── page.tsx
│
├── config.ts                    # Configuration (API keys, IDs)
├── middleware.ts                # Authentication middleware
├── next.config.ts               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies and scripts
└── .env.local                   # Environment variables (not in git)
```

---

## File-by-File Breakdown

### 1. **`app/layout.tsx`** - Root Layout

**Purpose**: Wraps all pages with shared components and providers.

**Key Concepts**:
- **ClerkProvider**: Wraps the app with authentication context
- **Font Loading**: Loads Google Fonts (Geist)
- **Metadata**: Sets page title and description

```typescript
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>
          <ConditionalNavbar />
          {children} {/* Page content goes here */}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

**What happens**:
1. Every page is wrapped with this layout
2. ClerkProvider enables authentication throughout the app
3. Navbar appears on all pages
4. `{children}` is replaced with the actual page content

---

### 2. **`app/page.tsx`** - Home Page

**Purpose**: Displays a list of events.

**Key Concepts**:
- **Client Component**: Uses `"use client"` because it needs React hooks
- **useState**: Manages component state (data, loading, modals)
- **useEffect**: Fetches data when component mounts
- **API Calls**: Fetches events from `/api/collection`

```typescript
"use client"; // Makes this a Client Component

export default function Home() {
  const [data, setData] = useState(null); // State for events
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Runs when component first loads
    fetch('/api/collection')
      .then(res => res.json())
      .then(data => setData(data));
  }, []);
  
  return <div>{/* Display events */}</div>;
}
```

**Flow**:
1. Component mounts → `useEffect` runs
2. Fetches data from `/api/collection`
3. Updates state with `setData()`
4. Component re-renders with events
5. User clicks event → opens edit modal

---

### 3. **`app/api/collection/route.ts`** - Collection API

**Purpose**: Fetches events from Webflow CMS.

**Key Concepts**:
- **Server-Side**: Runs on the server (not in browser)
- **Route Handler**: Handles HTTP requests
- **GET Function**: Handles GET requests
- **NextResponse**: Returns JSON response

```typescript
export async function GET() {
  // This runs on the server
  const response = await fetch('https://api.webflow.com/...', {
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }
  });
  
  const data = await response.json();
  return NextResponse.json(data);
}
```

**Flow**:
1. Browser requests `/api/collection`
2. Next.js calls `GET()` function
3. Function fetches from Webflow API
4. Returns JSON to browser
5. Frontend receives data

---

### 4. **`middleware.ts`** - Authentication Middleware

**Purpose**: Protects routes - redirects unauthenticated users to sign-in.

**Key Concepts**:
- **Runs First**: Executes before any page loads
- **Route Matching**: Checks which route is being accessed
- **Authentication Check**: Verifies user is logged in
- **Redirect**: Sends to sign-in if not authenticated

```typescript
export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  
  // Public routes (sign-in, sign-up) are allowed
  if (isPublicRoute(request)) {
    return NextResponse.next(); // Allow access
  }
  
  // Protected routes require authentication
  if (!userId) {
    return NextResponse.redirect('/sign-in'); // Redirect to sign-in
  }
  
  return NextResponse.next(); // Allow access
});
```

**Flow**:
1. User tries to access `/addevents`
2. Middleware checks if user is authenticated
3. If not → redirect to `/sign-in`
4. If yes → allow access to page

---

### 5. **`app/addevents/page.tsx`** - Add Event Page

**Purpose**: Form to create new events.

**Key Concepts**:
- **Client Component**: Needs form state and user interaction
- **Form Handling**: Manages form inputs with `useState`
- **API Submission**: Sends data to `/api/collection/items` (POST)
- **Navigation**: Uses Next.js router to redirect after submission

```typescript
"use client";

export default function AddItemPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    // ... other fields
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Send to API
    const response = await fetch('/api/collection/items', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    
    // Redirect to home page
    router.push('/');
  };
  
  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

---

### 6. **`app/components/EditItemModal.tsx`** - Edit Modal Component

**Purpose**: Reusable modal component for editing events.

**Key Concepts**:
- **Props**: Receives data from parent component
- **State Management**: Manages form state internally
- **Event Handlers**: `onClose`, `onSave` callbacks
- **Conditional Rendering**: Shows/hides based on `isOpen` prop

```typescript
interface EditItemModalProps {
  item: any;              // Event data
  isOpen: boolean;        // Should modal be visible?
  onClose: () => void;    // Function to close modal
  onSave: (item) => void; // Function to save changes
}

export default function EditItemModal({ item, isOpen, onClose, onSave }) {
  if (!isOpen) return null; // Don't render if closed
  
  return (
    <div className="modal">
      {/* Modal content */}
      <button onClick={onClose}>Close</button>
      <button onClick={() => onSave(updatedItem)}>Save</button>
    </div>
  );
}
```

**Usage**:
```typescript
// In parent component (page.tsx)
<EditItemModal
  item={selectedItem}
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSave={(updatedItem) => {
    // Update the event list
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      )
    }));
  }}
/>
```

---

### 7. **`config.ts`** - Configuration File

**Purpose**: Centralizes API keys and configuration.

**Key Concepts**:
- **Environment Variables**: Uses `process.env` for sensitive data
- **Fallback Values**: Provides defaults for development
- **Type Safety**: TypeScript ensures correct types

```typescript
// Uses environment variable if available, otherwise uses default
export const AUTH_TOKEN = process.env.NEXT_PUBLIC_AUTH_TOKEN || 'default_token';
export const COLLECTION_ID = process.env.NEXT_PUBLIC_COLLECTION_ID || 'default_id';
```

**Why `NEXT_PUBLIC_` prefix?**
- Variables with `NEXT_PUBLIC_` are exposed to the browser
- Without prefix, they're server-only (more secure)

---

## How the Application Works

### Complete Flow: Viewing Events

1. **User visits homepage** (`/`)
   - Browser requests `http://localhost:3000/`

2. **Middleware runs** (`middleware.ts`)
   - Checks if user is authenticated
   - If not → redirects to `/sign-in`
   - If yes → continues

3. **Page loads** (`app/page.tsx`)
   - React component renders
   - `useEffect` hook runs

4. **Data fetching** (in `useEffect`)
   - Calls `/api/collection` (API route)
   - API route fetches from Webflow CMS
   - Returns JSON with events

5. **State update**
   - `setData()` updates component state
   - Component re-renders with events

6. **Display events**
   - Maps through events array
   - Renders event cards

### Complete Flow: Creating an Event

1. **User clicks "Add Event"**
   - Navigates to `/addevents`

2. **Form loads** (`app/addevents/page.tsx`)
   - User fills out form
   - State updates with `setFormData()`

3. **User submits form**
   - `handleSubmit` function runs
   - Sends POST request to `/api/collection/items`

4. **API route processes** (`app/api/collection/items/route.ts`)
   - Receives form data
   - Sends to Webflow API to create item
   - Returns success/error

5. **Redirect**
   - On success → redirects to homepage
   - User sees new event in list

---

## Key Technologies Used

### 1. **Clerk Authentication**

**What it does**: Handles user authentication (sign-in, sign-up, sessions)

**How it works**:
- Provides `<ClerkProvider>` wrapper
- Provides `<UserButton />` component
- Handles authentication state
- Protects routes via middleware

**Key Files**:
- `app/layout.tsx` - Wraps app with ClerkProvider
- `middleware.ts` - Protects routes
- `app/sign-in/` - Sign-in page (handled by Clerk)

### 2. **Webflow CMS API**

**What it does**: Stores and retrieves event data

**How it works**:
- API routes call Webflow API
- Uses authentication token
- CRUD operations (Create, Read, Update, Delete)

**Key Files**:
- `config.ts` - API credentials
- `app/api/collection/route.ts` - Fetches events
- `app/api/collection/items/route.ts` - Creates/updates events

### 3. **CSS Modules**

**What it does**: Scoped CSS (styles don't leak to other components)

**How it works**:
```typescript
// Component
import styles from './page.module.css';

<div className={styles.container}>
  <h1 className={styles.title}>Hello</h1>
</div>
```

```css
/* page.module.css */
.container {
  padding: 20px;
}

.title {
  color: blue;
}
```

**Benefits**:
- Styles are scoped to component
- No naming conflicts
- Better performance (only loads needed CSS)

### 4. **TypeScript**

**What it does**: Adds type safety to JavaScript

**Benefits**:
- Catches errors before runtime
- Better IDE autocomplete
- Self-documenting code

**Example**:
```typescript
// Without TypeScript (JavaScript)
function greet(name) {
  return `Hello ${name}`;
}

// With TypeScript
function greet(name: string): string {
  return `Hello ${name}`;
}
```

---

## Common Patterns & Best Practices

### 1. **Client vs Server Components**

**Rule of Thumb**:
- Use **Server Components** by default (faster, smaller)
- Use **Client Components** only when needed:
  - React hooks (`useState`, `useEffect`)
  - Event handlers (`onClick`, `onChange`)
  - Browser APIs (`window`, `localStorage`)

**Example**:
```typescript
// ✅ Server Component (default)
export default function EventList() {
  const events = await fetchEvents(); // Can await directly
  return <div>{events.map(...)}</div>;
}

// ✅ Client Component (needs interactivity)
"use client";
export default function EventForm() {
  const [name, setName] = useState('');
  return <input value={name} onChange={(e) => setName(e.target.value)} />;
}
```

### 2. **API Route Patterns**

**GET Request**:
```typescript
export async function GET() {
  const data = await fetchData();
  return NextResponse.json(data);
}
```

**POST Request**:
```typescript
export async function POST(request: Request) {
  const body = await request.json();
  const result = await createItem(body);
  return NextResponse.json(result, { status: 201 });
}
```

**Error Handling**:
```typescript
export async function GET() {
  try {
    const data = await fetchData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch' },
      { status: 500 }
    );
  }
}
```

### 3. **State Management**

**Local State** (Component-level):
```typescript
const [count, setCount] = useState(0);
```

**Lifted State** (Shared between components):
```typescript
// Parent component
const [items, setItems] = useState([]);

// Pass to child
<ChildComponent items={items} onUpdate={setItems} />
```

**Server State** (Fetch from API):
```typescript
useEffect(() => {
  fetch('/api/items')
    .then(res => res.json())
    .then(data => setItems(data));
}, []);
```

### 4. **Loading States**

**Pattern**:
```typescript
const [isLoading, setIsLoading] = useState(true);
const [data, setData] = useState(null);

useEffect(() => {
  setIsLoading(true);
  fetchData()
    .then(data => {
      setData(data);
      setIsLoading(false);
    });
}, []);

if (isLoading) return <div>Loading...</div>;
if (!data) return <div>No data</div>;

return <div>{/* Render data */}</div>;
```

### 5. **Error Handling**

**In API Routes**:
```typescript
export async function GET() {
  try {
    const data = await fetchData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
```

**In Components**:
```typescript
const [error, setError] = useState(null);

useEffect(() => {
  fetchData()
    .catch(err => setError(err.message));
}, []);

if (error) return <div>Error: {error}</div>;
```

---

## Development Workflow

### 1. **Starting the Development Server**

```bash
npm run dev
```

**What happens**:
- Starts Next.js development server
- Watches for file changes
- Auto-reloads on save
- Available at `http://localhost:3000`

### 2. **Making Changes**

1. **Edit a file** (e.g., `app/page.tsx`)
2. **Save the file**
3. **Browser auto-reloads** (Hot Module Replacement)
4. **See changes instantly**

### 3. **Adding a New Page**

1. **Create folder**: `app/new-page/`
2. **Create file**: `app/new-page/page.tsx`
3. **Add content**:
```typescript
export default function NewPage() {
  return <h1>New Page</h1>;
}
```
4. **Access at**: `http://localhost:3000/new-page`

### 4. **Adding a New API Route**

1. **Create folder**: `app/api/new-endpoint/`
2. **Create file**: `app/api/new-endpoint/route.ts`
3. **Add handler**:
```typescript
export async function GET() {
  return NextResponse.json({ message: 'Hello' });
}
```
4. **Access at**: `http://localhost:3000/api/new-endpoint`

### 5. **Building for Production**

```bash
npm run build    # Build the app
npm start        # Start production server
```

---

## Troubleshooting

### Common Issues

#### 1. **"use client" Error**

**Error**: `'use client' must be in a Server Component`

**Solution**: Add `"use client"` at the top of file if using hooks:
```typescript
"use client";

import { useState } from 'react';
```

#### 2. **API Route Not Working**

**Check**:
- File is in `app/api/` folder
- File is named `route.ts`
- Export function matches HTTP method (`GET`, `POST`, etc.)

#### 3. **Environment Variables Not Working**

**Check**:
- File is named `.env.local` (not `.env`)
- Variable name starts with `NEXT_PUBLIC_` for client-side
- Restart dev server after adding variables

#### 4. **Authentication Not Working**

**Check**:
- `.env.local` has Clerk keys
- Keys are correct (no typos)
- Dev server restarted after adding keys

#### 5. **Import Errors**

**Check**:
- Import path is correct
- File extension matches (`.ts` vs `.tsx`)
- File actually exists

---

## Next Steps for Learning

1. **Official Next.js Docs**: https://nextjs.org/docs
2. **React Docs**: https://react.dev
3. **TypeScript Handbook**: https://www.typescriptlang.org/docs/
4. **Practice**: Try modifying this project:
   - Add a new page
   - Create a new API route
   - Add a new component
   - Modify existing features

---

## Quick Reference

### File Structure Rules
- `app/page.tsx` → Creates a route
- `app/api/route.ts` → Creates an API endpoint
- `app/layout.tsx` → Wraps pages
- `"use client"` → Makes component client-side

### Common Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Check for errors
```

### Common Imports
```typescript
// Next.js
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NextResponse } from 'next/server';

// React
import { useState, useEffect } from 'react';

// Clerk
import { UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
```

---

## Summary

This project demonstrates:
- ✅ **Next.js App Router** - Modern file-based routing
- ✅ **Server & Client Components** - When to use each
- ✅ **API Routes** - Building backend in Next.js
- ✅ **Authentication** - Protecting routes with Clerk
- ✅ **State Management** - React hooks for UI state
- ✅ **TypeScript** - Type-safe development
- ✅ **CSS Modules** - Scoped styling
- ✅ **External APIs** - Integrating with Webflow CMS

**Key Takeaway**: Next.js lets you build full-stack apps with React, handling both frontend and backend in one project, with great developer experience and performance out of the box.

---

*Happy coding! 🚀*

