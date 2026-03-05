# 🚀 Next.js Quick Reference Guide

A cheat sheet for common Next.js patterns used in this project.

## 📁 File Structure

```
app/
  page.tsx              → Route: /
  about/page.tsx        → Route: /about
  api/route.ts          → API: /api/route
  layout.tsx            → Wraps all pages
```

## 🔑 Key Concepts

### Server vs Client Components

```typescript
// ✅ Server Component (default - no "use client")
export default function ServerPage() {
  // Can directly await data
  const data = await fetch('...');
  return <div>{data}</div>;
}

// ✅ Client Component (needs "use client")
"use client";
export default function ClientPage() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

## 🛣️ Routing

### Create a Page
```typescript
// app/about/page.tsx
export default function About() {
  return <h1>About Page</h1>;
}
// Access at: /about
```

### Create an API Route
```typescript
// app/api/users/route.ts
export async function GET() {
  return NextResponse.json({ users: [] });
}
// Access at: /api/users
```

### Dynamic Routes
```typescript
// app/posts/[id]/page.tsx
export default function Post({ params }) {
  return <h1>Post {params.id}</h1>;
}
// Access at: /posts/123
```

## 🔌 API Routes

### GET Request
```typescript
export async function GET() {
  const data = await fetchData();
  return NextResponse.json(data);
}
```

### POST Request
```typescript
export async function POST(request: Request) {
  const body = await request.json();
  const result = await createItem(body);
  return NextResponse.json(result, { status: 201 });
}
```

### PUT Request
```typescript
export async function PUT(request: Request) {
  const body = await request.json();
  const result = await updateItem(body);
  return NextResponse.json(result);
}
```

### DELETE Request
```typescript
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  await deleteItem(id);
  return NextResponse.json({ success: true });
}
```

## 🎣 React Hooks (Client Components Only)

### useState
```typescript
const [count, setCount] = useState(0);
const [name, setName] = useState('');
```

### useEffect
```typescript
useEffect(() => {
  // Runs after component mounts
  fetchData();
}, []); // Empty array = run once

useEffect(() => {
  // Runs when 'id' changes
  fetchData(id);
}, [id]); // Dependency array
```

### useRouter (Navigation)
```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/about');      // Navigate
router.refresh();           // Refresh page
router.back();              // Go back
```

## 🔐 Authentication (Clerk)

### Get Current User (Server)
```typescript
import { auth } from '@clerk/nextjs/server';

const { userId } = await auth();
if (!userId) {
  return NextResponse.redirect('/sign-in');
}
```

### Get Current User (Client)
```typescript
import { useUser } from '@clerk/nextjs';

const { user, isLoaded } = useUser();
if (!isLoaded) return <div>Loading...</div>;
if (!user) return <div>Not signed in</div>;
```

### User Button Component
```typescript
import { UserButton } from '@clerk/nextjs';

<UserButton />
```

## 📡 Fetching Data

### In Server Component
```typescript
export default async function Page() {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();
  return <div>{data.name}</div>;
}
```

### In Client Component
```typescript
"use client";
export default function Page() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => setData(data));
  }, []);
  
  if (!data) return <div>Loading...</div>;
  return <div>{data.name}</div>;
}
```

## 🎨 Styling

### CSS Modules
```typescript
// Component
import styles from './page.module.css';
<div className={styles.container}>Hello</div>

// CSS
.container {
  padding: 20px;
}
```

### Inline Styles
```typescript
<div style={{ color: 'red', padding: '20px' }}>
  Hello
</div>
```

## 🔄 Common Patterns

### Loading State
```typescript
const [isLoading, setIsLoading] = useState(true);
const [data, setData] = useState(null);

useEffect(() => {
  fetchData()
    .then(data => {
      setData(data);
      setIsLoading(false);
    });
}, []);

if (isLoading) return <div>Loading...</div>;
if (!data) return <div>No data</div>;
return <div>{data.name}</div>;
```

### Error Handling
```typescript
const [error, setError] = useState(null);

try {
  const data = await fetchData();
} catch (err) {
  setError(err.message);
}

if (error) return <div>Error: {error}</div>;
```

### Form Handling
```typescript
const [formData, setFormData] = useState({ name: '', email: '' });

const handleSubmit = async (e) => {
  e.preventDefault();
  const res = await fetch('/api/submit', {
    method: 'POST',
    body: JSON.stringify(formData)
  });
  const result = await res.json();
};

return (
  <form onSubmit={handleSubmit}>
    <input
      value={formData.name}
      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    />
    <button type="submit">Submit</button>
  </form>
);
```

## 🔧 Environment Variables

### Server-Side Only
```env
DATABASE_URL=...
SECRET_KEY=...
```

### Client-Side (must have NEXT_PUBLIC_)
```env
NEXT_PUBLIC_API_URL=...
NEXT_PUBLIC_CLERK_KEY=...
```

### Usage
```typescript
// Server or Client
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Server only
const secret = process.env.SECRET_KEY;
```

## 📦 Common Imports

```typescript
// Next.js
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { NextResponse } from 'next/server';

// React
import { useState, useEffect } from 'react';

// Clerk
import { UserButton, useUser } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
```

## 🚦 Middleware Pattern

```typescript
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  
  if (!userId && !isPublicRoute(request)) {
    return NextResponse.redirect('/sign-in');
  }
  
  return NextResponse.next();
});
```

## 📝 TypeScript Types

```typescript
// Props
interface Props {
  name: string;
  age?: number;  // Optional
}

export default function Component({ name, age }: Props) {
  return <div>{name}</div>;
}

// API Response
interface ApiResponse {
  items: Array<{
    id: string;
    name: string;
  }>;
}
```

## 🎯 Project-Specific Patterns

### Fetching Events
```typescript
const res = await fetch('/api/collection');
const data = await res.json();
const events = data.items;
```

### Creating Event
```typescript
const res = await fetch('/api/collection/items', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(eventData)
});
```

### Updating Event
```typescript
const res = await fetch(`/api/collection/items/${itemId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updatedData)
});
```

## 🐛 Debugging Tips

1. **Check Console**: Browser DevTools → Console
2. **Check Network**: Browser DevTools → Network tab
3. **Server Logs**: Check terminal where `npm run dev` is running
4. **Type Errors**: TypeScript will show errors in IDE
5. **Build Errors**: Run `npm run build` to see all errors

## 📚 Useful Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Check for errors
```

---

*Keep this handy while coding! 🎯*


