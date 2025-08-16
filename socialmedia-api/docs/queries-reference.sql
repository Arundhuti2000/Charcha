-- ===== SOCIAL MEDIA API - COMPLETE DATABASE QUERIES REFERENCE =====
-- All SQLAlchemy queries translated to raw SQL for reference

-- ===== 1. USER QUERIES =====

-- 1.1 Get User by Email
SELECT users.id, users.email, users.username, users.full_name, users.password, 
       users.created_at, users.phone_number
FROM users 
WHERE users.email = 'user@example.com';

-- 1.2 Get User by Username  
SELECT users.id, users.email, users.username, users.full_name, users.password, 
       users.created_at, users.phone_number
FROM users 
WHERE users.username = 'johndoe';

-- 1.3 Get User by ID
SELECT users.id, users.email, users.username, users.full_name, users.password, 
       users.created_at, users.phone_number
FROM users 
WHERE users.id = 1;

-- 1.4 Check if Email Exists
SELECT COUNT(*) > 0 as exists
FROM users 
WHERE users.email = 'user@example.com';

-- 1.5 Check if Username Exists
SELECT COUNT(*) > 0 as exists
FROM users 
WHERE users.username = 'johndoe';

-- 1.6 Create User
INSERT INTO users (email, username, full_name, password, phone_number, created_at)
VALUES ('user@example.com', 'johndoe', 'John Doe', 'hashed_password', '+1234567890', NOW())
RETURNING *;

-- 1.7 Update User Email
UPDATE users 
SET email = 'newemail@example.com'
WHERE id = 1
RETURNING *;

-- 1.8 Update Username
UPDATE users 
SET username = 'newusername'
WHERE id = 1
RETURNING *;

-- 1.9 Update Full Name
UPDATE users 
SET full_name = 'New Full Name'
WHERE id = 1
RETURNING *;

-- 1.10 Update Phone Number
UPDATE users 
SET phone_number = '+0987654321'
WHERE id = 1
RETURNING *;

-- 1.11 Search Users (by username, full_name, or email)
SELECT users.id, users.email, users.username, users.full_name, users.created_at
FROM users 
WHERE users.username ILIKE '%search_term%' 
   OR users.full_name ILIKE '%search_term%' 
   OR users.email ILIKE '%search_term%'
ORDER BY users.created_at DESC
LIMIT 10 OFFSET 0;

-- ===== 2. USER PROFILE WITH STATS (COMPLEX QUERY) =====

-- 2.1 Get User Profile with Complete Stats
SELECT 
    users.id, users.username, users.full_name, users.email, 
    users.created_at, users.phone_number,
    
    -- Follower count
    COALESCE((
        SELECT COUNT(followers.follower_id) 
        FROM followers 
        WHERE followers.following_id = users.id
    ), 0) AS followers_count,
    
    -- Following count  
    COALESCE((
        SELECT COUNT(followers.following_id) 
        FROM followers 
        WHERE followers.follower_id = users.id
    ), 0) AS following_count,
    
    -- Posts count
    COALESCE((
        SELECT COUNT(posts.id) 
        FROM posts 
        WHERE posts.user_id = users.id
    ), 0) AS posts_count,
    
    -- Total votes received on all posts
    COALESCE((
        SELECT COUNT(votes.post_id) 
        FROM votes 
        JOIN posts ON posts.id = votes.post_id 
        WHERE posts.user_id = users.id
    ), 0) AS total_votes_received,
    
    -- Total upvotes received
    COALESCE((
        SELECT COUNT(CASE WHEN votes.dir = 1 THEN 1 END) 
        FROM votes 
        JOIN posts ON posts.id = votes.post_id 
        WHERE posts.user_id = users.id
    ), 0) AS total_upvotes_received,
    
    -- Total downvotes received
    COALESCE((
        SELECT COUNT(CASE WHEN votes.dir = -1 THEN 1 END) 
        FROM votes 
        JOIN posts ON posts.id = votes.post_id 
        WHERE posts.user_id = users.id
    ), 0) AS total_downvotes_received,
    
    -- Relationship status (when viewing someone else's profile)
    CASE 
        WHEN $current_user_id IS NOT NULL AND $current_user_id != users.id THEN
            EXISTS(SELECT 1 FROM followers 
                   WHERE follower_id = $current_user_id AND following_id = users.id)
        ELSE NULL 
    END AS is_following,
    
    CASE 
        WHEN $current_user_id IS NOT NULL AND $current_user_id != users.id THEN
            EXISTS(SELECT 1 FROM followers 
                   WHERE follower_id = users.id AND following_id = $current_user_id)
        ELSE NULL 
    END AS is_followed_by,
    
    CASE 
        WHEN $current_user_id IS NOT NULL AND $current_user_id != users.id THEN
            EXISTS(SELECT 1 FROM followers 
                   WHERE follower_id = $current_user_id AND following_id = users.id)
            AND
            EXISTS(SELECT 1 FROM followers 
                   WHERE follower_id = users.id AND following_id = $current_user_id)
        ELSE NULL 
    END AS is_mutual

FROM users 
WHERE users.id = $user_id;

-- ===== 3. POST QUERIES =====

-- 3.1 Get All Posts with Vote Counts and User Vote Status
SELECT 
    posts.id, posts.title, posts.content, posts.category, posts.published, 
    posts.rating, posts.created_at, posts.user_id,
    
    -- Owner information
    users.id as owner_id, users.email as owner_email, 
    users.username as owner_username, users.full_name as owner_full_name,
    users.created_at as owner_created_at,
    
    -- Vote counts
    COUNT(votes.post_id) AS votes,
    COUNT(CASE WHEN votes.dir = 1 THEN 1 END) AS upvotes,
    COUNT(CASE WHEN votes.dir = -1 THEN 1 END) AS downvotes,
    
    -- User's vote status
    CASE 
        WHEN MAX(CASE WHEN votes.user_id = $current_user_id THEN votes.dir END) IN (1, -1) 
        THEN TRUE 
        ELSE FALSE 
    END AS has_liked

FROM posts 
LEFT JOIN votes ON posts.id = votes.post_id  
JOIN users ON posts.user_id = users.id
WHERE posts.title ILIKE '%search_term%'
GROUP BY posts.id, users.id
ORDER BY posts.created_at DESC
LIMIT 10 OFFSET 0;

-- 3.2 Get User's Own Posts with Vote Counts
SELECT 
    posts.id, posts.title, posts.content, posts.category, posts.published, 
    posts.rating, posts.created_at, posts.user_id,
    users.id as owner_id, users.email as owner_email, 
    users.username as owner_username, users.full_name as owner_full_name,
    COUNT(votes.post_id) AS votes,
    COUNT(CASE WHEN votes.dir = 1 THEN 1 END) AS upvotes,
    COUNT(CASE WHEN votes.dir = -1 THEN 1 END) AS downvotes,
    CASE 
        WHEN MAX(CASE WHEN votes.user_id = $current_user_id THEN votes.dir END) IN (1, -1) 
        THEN TRUE 
        ELSE FALSE 
    END AS has_liked
FROM posts 
LEFT JOIN votes ON posts.id = votes.post_id
JOIN users ON posts.user_id = users.id  
WHERE posts.user_id = $current_user_id
GROUP BY posts.id, users.id
ORDER BY posts.created_at DESC
LIMIT 10 OFFSET 0;

-- 3.3 Get Single Post with Vote Counts
SELECT 
    posts.id, posts.title, posts.content, posts.category, posts.published, 
    posts.rating, posts.created_at, posts.user_id,
    users.id as owner_id, users.email as owner_email, 
    users.username as owner_username, users.full_name as owner_full_name,
    COUNT(votes.post_id) AS votes,
    COUNT(CASE WHEN votes.dir = 1 THEN 1 END) AS upvotes,
    COUNT(CASE WHEN votes.dir = -1 THEN 1 END) AS downvotes,
    CASE 
        WHEN MAX(CASE WHEN votes.user_id = $current_user_id THEN votes.dir END) IN (1, -1) 
        THEN TRUE 
        ELSE FALSE 
    END AS has_liked
FROM posts 
LEFT JOIN votes ON posts.id = votes.post_id
JOIN users ON posts.user_id = users.id
WHERE posts.id = $post_id
GROUP BY posts.id, users.id;

-- 3.4 Create Post
INSERT INTO posts (title, content, category, published, rating, user_id, created_at)
VALUES ('Post Title', 'Post Content', 'Technology', TRUE, 5, $user_id, NOW())
RETURNING *;

-- 3.5 Update Post
UPDATE posts 
SET title = 'Updated Title', content = 'Updated Content', 
    category = 'Updated Category', published = TRUE, rating = 4
WHERE id = $post_id AND user_id = $current_user_id
RETURNING *;

-- 3.6 Delete Post
DELETE FROM posts 
WHERE id = $post_id AND user_id = $current_user_id
RETURNING *;

-- 3.7 Search Posts
SELECT posts.id, posts.title, posts.content, posts.category, posts.created_at
FROM posts 
WHERE posts.title ILIKE '%search_term%' 
   OR posts.content ILIKE '%search_term%'
ORDER BY posts.created_at DESC
LIMIT 10 OFFSET 0;

-- ===== 4. VOTE QUERIES =====

-- 4.1 Get User's Vote for Specific Post
SELECT votes.post_id, votes.user_id, votes.dir
FROM votes 
WHERE votes.post_id = $post_id AND votes.user_id = $user_id;

-- 4.2 Create Vote
INSERT INTO votes (post_id, user_id, dir)
VALUES ($post_id, $user_id, $direction)
RETURNING *;

-- 4.3 Update Vote Direction
UPDATE votes 
SET dir = $new_direction
WHERE post_id = $post_id AND user_id = $user_id
RETURNING *;

-- 4.4 Delete Vote
DELETE FROM votes 
WHERE post_id = $post_id AND user_id = $user_id
RETURNING *;

-- 4.5 Get Vote Counts for Post
SELECT 
    COUNT(votes.post_id) AS total_votes,
    COUNT(CASE WHEN votes.dir = 1 THEN 1 END) AS upvotes,
    COUNT(CASE WHEN votes.dir = -1 THEN 1 END) AS downvotes,
    COUNT(CASE WHEN votes.dir = 1 THEN 1 END) - COUNT(CASE WHEN votes.dir = -1 THEN 1 END) AS score
FROM votes 
WHERE votes.post_id = $post_id;

-- 4.6 Get User's Votes for Multiple Posts
SELECT votes.post_id, votes.dir
FROM votes 
WHERE votes.user_id = $user_id AND votes.post_id IN ($post_id_list);

-- 4.7 Check if User Has Voted on Post
SELECT COUNT(*) > 0 as has_voted
FROM votes 
WHERE votes.post_id = $post_id AND votes.user_id = $user_id;

-- ===== 5. FOLLOWER QUERIES =====

-- 5.1 Check if User A Follows User B
SELECT COUNT(*) > 0 as is_following
FROM followers 
WHERE follower_id = $follower_id AND following_id = $following_id;

-- 5.2 Create Follow Relationship
INSERT INTO followers (follower_id, following_id, created_at)
VALUES ($follower_id, $following_id, NOW())
RETURNING *;

-- 5.3 Remove Follow Relationship
DELETE FROM followers 
WHERE follower_id = $follower_id AND following_id = $following_id
RETURNING *;

-- 5.4 Get User's Followers
SELECT 
    users.id, users.email, users.username, users.full_name, users.created_at,
    followers.created_at as followed_at
FROM users 
JOIN followers ON users.id = followers.follower_id
WHERE followers.following_id = $user_id
ORDER BY followers.created_at DESC
LIMIT 20 OFFSET 0;

-- 5.5 Get Users that User is Following
SELECT 
    users.id, users.email, users.username, users.full_name, users.created_at,
    followers.created_at as started_following_at
FROM users 
JOIN followers ON users.id = followers.following_id
WHERE followers.follower_id = $user_id
ORDER BY followers.created_at DESC
LIMIT 20 OFFSET 0;

-- 5.6 Get Follower Count
SELECT COUNT(followers.follower_id) as follower_count
FROM followers 
WHERE followers.following_id = $user_id;

-- 5.7 Get Following Count
SELECT COUNT(followers.following_id) as following_count
FROM followers 
WHERE followers.follower_id = $user_id;

-- 5.8 Get User Follow Stats
SELECT 
    users.id, users.email, users.username, users.full_name, users.created_at,
    COALESCE(follower_counts.follower_count, 0) as followers_count,
    COALESCE(following_counts.following_count, 0) as following_count
FROM users
LEFT JOIN (
    SELECT following_id, COUNT(*) as follower_count
    FROM followers
    GROUP BY following_id
) follower_counts ON users.id = follower_counts.following_id
LEFT JOIN (
    SELECT follower_id, COUNT(*) as following_count
    FROM followers
    GROUP BY follower_id
) following_counts ON users.id = following_counts.follower_id
WHERE users.id = $user_id;

-- 5.9 Get Mutual Follows (Users who follow each other)
SELECT DISTINCT users.id, users.email, users.username, users.full_name, users.created_at
FROM users
JOIN followers f1 ON users.id = f1.following_id
JOIN followers f2 ON users.id = f2.follower_id
WHERE f1.follower_id = $user_id 
  AND f2.following_id = $user_id;

-- 5.10 Get Follow Status Between Two Users
SELECT 
    EXISTS(SELECT 1 FROM followers 
           WHERE follower_id = $current_user_id AND following_id = $target_user_id) AS is_following,
    EXISTS(SELECT 1 FROM followers 
           WHERE follower_id = $target_user_id AND following_id = $current_user_id) AS is_followed_by,
    EXISTS(SELECT 1 FROM followers 
           WHERE follower_id = $current_user_id AND following_id = $target_user_id)
    AND
    EXISTS(SELECT 1 FROM followers 
           WHERE follower_id = $target_user_id AND following_id = $current_user_id) AS is_mutual;

-- 5.11 Get Followers with Pagination Info
SELECT 
    users.id, users.email, users.username, users.full_name, users.created_at,
    COUNT(*) OVER() as total_count,
    20 as limit_value,
    0 as offset_value,
    CASE WHEN COUNT(*) OVER() > (0 + 20) THEN TRUE ELSE FALSE END as has_more
FROM users 
JOIN followers ON users.id = followers.follower_id
WHERE followers.following_id = $user_id
ORDER BY followers.created_at DESC
LIMIT 20 OFFSET 0;

-- ===== 6. AUTHENTICATION QUERIES =====

-- 6.1 Login by Email
SELECT users.id, users.email, users.username, users.password, users.created_at
FROM users 
WHERE users.email = $email_or_username;

-- 6.2 Login by Username
SELECT users.id, users.email, users.username, users.password, users.created_at
FROM users 
WHERE users.username = $email_or_username;

-- ===== 7. ADVANCED ANALYTICS QUERIES =====

-- 7.1 Get Most Popular Post by User
SELECT 
    posts.id, posts.title, posts.content, posts.category, posts.published, 
    posts.rating, posts.created_at, posts.user_id,
    COUNT(votes.post_id) as vote_count,
    users.id as owner_id, users.email as owner_email, 
    users.username as owner_username, users.full_name as owner_full_name
FROM posts
LEFT JOIN votes ON posts.id = votes.post_id
JOIN users ON posts.user_id = users.id
WHERE posts.user_id = $user_id
GROUP BY posts.id, users.id
ORDER BY COUNT(votes.post_id) DESC
LIMIT 1;

-- 7.2 Get User Vote Statistics  
SELECT 
    COUNT(votes.post_id) as total_votes,
    COUNT(CASE WHEN votes.dir = 1 THEN 1 END) as total_upvotes,
    COUNT(CASE WHEN votes.dir = -1 THEN 1 END) as total_downvotes
FROM votes 
JOIN posts ON votes.post_id = posts.id
WHERE posts.user_id = $user_id;

-- 7.3 Get Top Posts by Vote Count
SELECT 
    posts.id, posts.title, posts.content, COUNT(votes.post_id) as vote_count
FROM posts
LEFT JOIN votes ON posts.id = votes.post_id
GROUP BY posts.id
ORDER BY COUNT(votes.post_id) DESC
LIMIT 10;

-- 7.4 Get Most Active Users (by post count)
SELECT 
    users.id, users.username, users.full_name, COUNT(posts.id) as post_count
FROM users
LEFT JOIN posts ON users.id = posts.user_id
GROUP BY users.id
ORDER BY COUNT(posts.id) DESC
LIMIT 10;

-- 7.5 Get Users with Most Followers
SELECT 
    users.id, users.username, users.full_name, COUNT(followers.follower_id) as follower_count
FROM users
LEFT JOIN followers ON users.id = followers.following_id
GROUP BY users.id
ORDER BY COUNT(followers.follower_id) DESC
LIMIT 10;

-- ===== 8. UTILITY QUERIES =====

-- 8.1 Check if Post Exists
SELECT COUNT(*) > 0 as exists
FROM posts 
WHERE id = $post_id;

-- 8.2 Check if User Owns Post
SELECT COUNT(*) > 0 as owns_post
FROM posts 
WHERE id = $post_id AND user_id = $user_id;

-- 8.3 Get Total Counts (Dashboard Stats)
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM posts) as total_posts,
    (SELECT COUNT(*) FROM votes) as total_votes,
    (SELECT COUNT(*) FROM followers) as total_follows;

-- ===== NOTES =====
/*
Parameters used in queries:
- $user_id, $current_user_id, $target_user_id: User identifiers
- $post_id: Post identifier  
- $email_or_username: Login credential
- $direction, $new_direction: Vote direction (1 for upvote, -1 for downvote)
- $follower_id, $following_id: User IDs for follow relationships
- $search_term: Text search parameter
- $post_id_list: Array of post IDs

All timestamps use timezone-aware TIMESTAMP columns
All COUNT queries use COALESCE to handle NULL values and return 0
Pagination uses LIMIT and OFFSET for consistent results
*/