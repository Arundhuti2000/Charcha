# Database Schema Design

## Overview

This document describes the database schema for the Social Media API, including table structures, relationships, and design decisions.

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    Users    │◄─────►│  Followers  │       │    Posts    │
│             │       │             │       │             │
│ id (PK)     │   ┌───┤ follower_id │◄──────┤ id (PK)     │
│ email       │   │   │ following_id│       │ title       │
│ username    │   │   │ created_at  │       │ content     │
│ full_name   │   │   └─────────────┘       │ category    │
│ password    │   │                         │ published   │
│ phone_number│   │   ┌─────────────┐       │ rating      │
│ created_at  │   └──►│    Votes    │◄──────┤ user_id (FK)│
└─────────────┘       │             │       │ created_at  │
                      │ post_id (PK)│       └─────────────┘
                      │ user_id (PK)│
                      │ dir         │
                      └─────────────┘
```

## Table Definitions

### 1. Users Table

**Purpose**: Store user account information and authentication data.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) UNIQUE,
    full_name VARCHAR(100),
    password VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

**Field Descriptions**:
- `id`: Auto-incrementing primary key
- `email`: Unique email address for authentication
- `username`: Optional unique username (3-50 chars, alphanumeric + underscore)
- `full_name`: User's display name (min 2 chars when provided)
- `password`: Bcrypt hashed password
- `phone_number`: Optional phone number (up to 15 digits)
- `created_at`: Account creation timestamp

**Constraints**:
- Email must be unique and valid format
- Username must be unique when provided
- Password is required and stored hashed
- Username format: `^[a-zA-Z0-9_]{3,50}$`

### 2. Posts Table

**Purpose**: Store user-generated content and metadata.

```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    content VARCHAR(1000) NOT NULL,
    category VARCHAR(50) NOT NULL,
    published BOOLEAN DEFAULT TRUE,
    rating INTEGER NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

**Field Descriptions**:
- `id`: Auto-incrementing primary key
- `title`: Post title (max 100 chars)
- `content`: Post content (max 1000 chars)
- `category`: Content category for organization
- `published`: Visibility status (default: true)
- `rating`: User-assigned rating/score
- `user_id`: Foreign key to post owner
- `created_at`: Post creation timestamp

**Relationships**:
- **Many-to-One** with Users: Each post belongs to one user
- **One-to-Many** with Votes: Each post can have multiple votes

### 3. Votes Table

**Purpose**: Store user voting data for posts (upvotes/downvotes).

```sql
CREATE TABLE votes (
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dir INTEGER NOT NULL,
    PRIMARY KEY (post_id, user_id)
);
```

**Field Descriptions**:
- `post_id`: Foreign key to voted post
- `user_id`: Foreign key to voting user
- `dir`: Vote direction (1 = upvote, -1 = downvote)

**Constraints**:
- Composite primary key prevents duplicate votes
- Each user can only vote once per post
- Vote direction must be 1 or -1
- Cascading deletes maintain referential integrity

**Business Rules**:
- Users cannot vote on their own posts (enforced in application)
- Users can change their vote direction
- Users can remove their vote (delete record)

### 4. Followers Table

**Purpose**: Store user-to-user follow relationships.

```sql
CREATE TABLE followers (
    follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT chk_no_self_follow CHECK (follower_id != following_id)
);
```

**Field Descriptions**:
- `follower_id`: User who is following (the follower)
- `following_id`: User being followed (the followee)
- `created_at`: When the follow relationship was created

**Constraints**:
- Composite primary key prevents duplicate follows
- Check constraint prevents self-following
- Cascading deletes maintain referential integrity

**Relationship Types**:
- **Unidirectional**: A follows B (but B doesn't follow A)
- **Mutual**: A follows B AND B follows A
- **No Relationship**: Neither follows the other

## Design Decisions

### 1. Authentication Strategy

**Email + Username Login**: 
- Primary: Email (required, unique)
- Secondary: Username (optional, unique when provided)
- Both can be used for login authentication

**Rationale**: Flexibility for users while maintaining uniqueness

### 2. Vote System Design

**Composite Primary Key**: `(post_id, user_id)`
- Prevents duplicate votes naturally
- Efficient lookups for user's vote on specific post
- Atomic vote changes (update vs insert/delete)

**Vote Direction Values**:
- `1`: Upvote (positive)
- `-1`: Downvote (negative)
- No record: No vote

**Rationale**: Simple, efficient, prevents vote manipulation

### 3. Follow System Design

**Asymmetric Following**: Like Twitter/Instagram model
- Following doesn't require mutual consent
- Separate from "friendship" models
- Allows for influencer/follower dynamics

**Mutual Detection**: Calculated, not stored
- Reduces data duplication
- Always accurate (computed from current state)
- Efficient with proper indexing

### 4. Post Content Limits

**Title**: 100 characters
**Content**: 1000 characters

**Rationale**: 
- Encourages concise, focused content
- Prevents database bloat
- Improves performance
- Can be adjusted based on requirements

### 5. Soft vs Hard Deletes

**Hard Deletes Used**: All deletes are permanent
- `ON DELETE CASCADE` maintains referential integrity
- Reduces storage complexity
- Simplified queries (no deleted flag checks)

**Alternative**: Could implement soft deletes for content recovery

## Data Integrity

### Referential Integrity
- All foreign keys use `ON DELETE CASCADE`
- Prevents orphaned records
- Maintains data consistency

### Application-Level Constraints
- Password hashing (bcrypt)
- Username format validation
- Email format validation
- Vote direction validation
- Self-follow prevention

### Database-Level Constraints
- Unique constraints on email/username
- NOT NULL constraints on required fields
- Check constraint preventing self-follows
- Foreign key constraints

## Scalability Considerations

### Current Design Strengths
- Normalized structure reduces redundancy
- Efficient composite keys for relationships
- Proper indexing strategy (see indexing-strategy.md)

### Future Scalability Options
- **Horizontal Partitioning**: Partition posts by date/user
- **Read Replicas**: For heavy read workloads
- **Caching Layer**: Redis for hot data (vote counts, follower counts)
- **Content Delivery**: For media files (future feature)

## Schema Migration History

The schema is managed using Alembic migrations:

1. **Initial**: Basic posts table
2. **Content**: Added content column to posts
3. **Enhanced Posts**: Added published, rating, category, user_id columns
4. **Users**: Created users table
5. **Relationships**: Added foreign key constraints
6. **Votes**: Created votes table with composite primary key
7. **Followers**: Created followers table with self-follow prevention
8. **User Enhancement**: Added username and full_name to users

## Performance Characteristics

### Query Patterns
- **High Read**: Post feeds, user profiles, vote counts
- **Medium Write**: New posts, votes, follows
- **Low Write**: User registration, profile updates

### Optimization Strategy
- Denormalization avoided in favor of efficient joins
- Aggregation queries use subqueries for accuracy
- Indexes optimize common access patterns

## Security Considerations

### Sensitive Data
- Passwords: Bcrypt hashed, never stored plain text
- Email: Required for account recovery
- Phone: Optional, for future 2FA implementation

### Access Patterns
- Users can only modify their own content
- Public read access to published posts
- Private access to vote history
- Follow relationships are public

### Privacy Controls
- Published flag controls post visibility
- User profile data has configurable privacy (future)
- Vote history is private to the user

## Future Enhancements

### Planned Features
- **User Profiles**: Bio, avatar, location fields
- **Post Media**: Image/video attachments
- **Comments**: Nested comment system
- **Notifications**: Follow/vote notifications
- **Privacy Controls**: Post visibility levels
- **Content Moderation**: Reporting system

### Schema Changes Required
```sql
-- Future user profile enhancements
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
ALTER TABLE users ADD COLUMN location VARCHAR(100);

-- Future post media support  
CREATE TABLE post_media (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    media_url VARCHAR(500) NOT NULL,
    media_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

This schema design balances simplicity, performance, and scalability while maintaining data integrity and supporting the core social media functionality.