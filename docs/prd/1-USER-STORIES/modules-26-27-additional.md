# Additional Modules - Community & Communication

**Document Type:** User Stories - Additional Modules  
**Project:** LMS Baby Owl  
**Version:** 1.0  
**Date:** December 15, 2025  
**Modules:** 26-27  
**Total Story Points:** 100 points

---

## 📋 Overview

This document covers the additional modules for community features and communication tools that enhance student engagement and instructor-student interaction.

---

## GROUP 9: Community & Communication

### Module 26: Community & Social

**Priority:** 🟡 Medium (Phase 5, Sprint 15-16)  
**Story Points:** 55 points  
**Dependencies:** Module 2 (User system), Module 8 (XP system)

#### User Stories

---

##### 9.1.1 - Community Feed

**As a** student  
**I want to** see a feed of posts from other students  
**So that** I can stay connected with my learning community

**Story Points:** 8

**Acceptance Criteria:**

- [ ] Display list of community posts in chronological order (newest first)
- [ ] Each post shows: author name, avatar, level, content, timestamp
- [ ] Each post shows engagement: likes count, comments count
- [ ] Infinite scroll pagination (load more on scroll)
- [ ] Pull-to-refresh on mobile
- [ ] Empty state when no posts

**API Endpoints:**

- `GET /api/community/posts` - List posts with pagination
- `GET /api/community/posts/{id}` - Get single post with comments

**UI Components:**

- `CommunityPostCard` - Individual post display
- `PostList` - Feed container with infinite scroll

---

##### 9.1.2 - Create Post

**As a** student  
**I want to** create posts in the community feed  
**So that** I can share my learning journey with others

**Story Points:** 8

**Acceptance Criteria:**

- [ ] Post composer with text input (max 2000 characters)
- [ ] Character count indicator
- [ ] Media upload (images, up to 4 images per post)
- [ ] Preview before posting
- [ ] Submit button disabled until content is valid
- [ ] Success notification after posting
- [ ] New post appears at top of feed immediately

**API Endpoints:**

- `POST /api/community/posts` - Create new post
- `POST /api/community/posts/{id}/media` - Upload media

**UI Components:**

- `PostComposer` - Create post form
- `MediaUploader` - Image upload with preview

---

##### 9.1.3 - Post Interactions

**As a** student  
**I want to** like, comment, and share posts  
**So that** I can engage with other students' content

**Story Points:** 8

**Acceptance Criteria:**

- [ ] Like button toggles like status
- [ ] Like count updates in real-time
- [ ] Comment button opens comment section
- [ ] Comment form with text input
- [ ] Comments displayed in chronological order
- [ ] Share button copies post link to clipboard
- [ ] Share count tracked

**API Endpoints:**

- `POST /api/community/posts/{id}/like` - Toggle like
- `GET /api/community/posts/{id}/comments` - Get comments
- `POST /api/community/posts/{id}/comments` - Add comment
- `POST /api/community/posts/{id}/share` - Track share

**UI Components:**

- `PostActions` - Like/Comment/Share buttons
- `CommentSection` - Comments list and form

---

##### 9.1.4 - Study Groups

**As a** student  
**I want to** join study groups based on topics or courses  
**So that** I can learn together with peers who share my interests

**Story Points:** 8

**Acceptance Criteria:**

- [ ] Display list of available groups
- [ ] Each group shows: name, icon, member count, description
- [ ] Join/Leave group button
- [ ] Group membership persists
- [ ] Filter groups by category (course-related, topic-based)
- [ ] Search groups by name
- [ ] My Groups section showing joined groups

**API Endpoints:**

- `GET /api/community/groups` - List all groups
- `GET /api/community/groups/my` - User's joined groups
- `POST /api/community/groups/{id}/join` - Join group
- `DELETE /api/community/groups/{id}/leave` - Leave group

**UI Components:**

- `GroupCard` - Individual group display
- `GroupList` - Groups grid/list

---

##### 9.1.5 - Group Management

**As a** group admin  
**I want to** manage my study group  
**So that** I can maintain a healthy learning community

**Story Points:** 5

**Acceptance Criteria:**

- [ ] Edit group details (name, description, icon)
- [ ] View member list
- [ ] Remove members (admin only)
- [ ] Assign/remove admin role
- [ ] Delete group (creator only)

**API Endpoints:**

- `PATCH /api/community/groups/{id}` - Update group
- `GET /api/community/groups/{id}/members` - List members
- `DELETE /api/community/groups/{id}/members/{userId}` - Remove member
- `PATCH /api/community/groups/{id}/members/{userId}/role` - Change role

---

##### 9.1.6 - Community Events

**As a** student  
**I want to** view and RSVP to community events  
**So that** I can participate in workshops and webinars

**Story Points:** 8

**Acceptance Criteria:**

- [ ] Events tab in community section
- [ ] Event card shows: title, date, time, location (online/offline), attendee count
- [ ] Event detail page with full description
- [ ] RSVP button (Attending/Not Attending)
- [ ] My Events section (RSVPed events)
- [ ] Calendar integration (add to calendar)
- [ ] Filter: Upcoming, Past, My Events

**API Endpoints:**

- `GET /api/community/events` - List events
- `GET /api/community/events/{id}` - Event detail
- `POST /api/community/events/{id}/rsvp` - RSVP to event
- `DELETE /api/community/events/{id}/rsvp` - Cancel RSVP

**UI Components:**

- `EventCard` - Event summary display
- `EventDetail` - Full event page

---

##### 9.1.7 - Popular Topics & Trending

**As a** student  
**I want to** see popular topics and trending posts  
**So that** I can discover relevant content quickly

**Story Points:** 5

**Acceptance Criteria:**

- [ ] Sidebar widget showing popular hashtags
- [ ] Each topic shows post count
- [ ] Click topic to filter feed by topic
- [ ] Trending section showing most engaged posts (24h)
- [ ] Suggested groups based on activity

**API Endpoints:**

- `GET /api/community/topics/popular` - Popular topics
- `GET /api/community/posts/trending` - Trending posts
- `GET /api/community/groups/suggested` - Suggested groups

**UI Components:**

- `PopularTopics` - Sidebar widget
- `TrendingPosts` - Trending section

---

##### 9.1.8 - User Mentions & Notifications

**As a** student  
**I want to** mention other users in posts/comments  
**So that** they get notified and can join the conversation

**Story Points:** 5

**Acceptance Criteria:**

- [ ] @mention autocomplete in post/comment composer
- [ ] Mentioned users receive notification
- [ ] Mention highlighted in post content
- [ ] Click mention to view user profile
- [ ] Notification center shows all community notifications

**API Endpoints:**

- `GET /api/users/search?q=` - Search users for mention
- `GET /api/notifications` - User notifications
- `PATCH /api/notifications/{id}/read` - Mark as read

---

### Module 27: Messaging System

**Priority:** 🟡 Medium (Phase 5, Sprint 16)  
**Story Points:** 45 points  
**Dependencies:** Module 12 (Classes), Module 18 (Student monitoring)

#### User Stories

---

##### 9.2.1 - Message List (Inbox)

**As an** instructor  
**I want to** see all my message conversations  
**So that** I can communicate with students efficiently

**Story Points:** 5

**Acceptance Criteria:**

- [ ] Inbox view with list of conversations
- [ ] Each conversation shows: student name, avatar, last message preview, timestamp
- [ ] Unread count badge on conversations
- [ ] Sort by most recent message
- [ ] Search messages by student name or content
- [ ] Filter: All, Unread, Starred

**API Endpoints:**

- `GET /api/instructor/messages` - List conversations
- `GET /api/instructor/messages/unread-count` - Total unread count

**UI Components:**

- `MessageList` - Conversation list
- `MessagePreview` - Single conversation preview

---

##### 9.2.2 - Message Thread

**As an** instructor  
**I want to** view a conversation thread with a student  
**So that** I can see the full context of our communication

**Story Points:** 8

**Acceptance Criteria:**

- [ ] Thread view showing all messages in conversation
- [ ] Messages grouped by date
- [ ] Sender/receiver visually distinguished (left/right alignment)
- [ ] Timestamp on each message
- [ ] Auto-scroll to newest message
- [ ] Load older messages on scroll up (pagination)
- [ ] Read status indicator

**API Endpoints:**

- `GET /api/instructor/messages/{conversationId}` - Get thread
- `PATCH /api/instructor/messages/{conversationId}/read` - Mark as read

**UI Components:**

- `MessageThread` - Conversation view
- `MessageBubble` - Individual message

---

##### 9.2.3 - Send Message

**As an** instructor  
**I want to** send messages to students  
**So that** I can provide feedback and support

**Story Points:** 8

**Acceptance Criteria:**

- [ ] Message composer at bottom of thread
- [ ] Text input with send button
- [ ] Support for attachments (files, images)
- [ ] Send on Enter (Shift+Enter for newline)
- [ ] Message appears immediately after sending
- [ ] Optimistic UI update
- [ ] Error handling with retry option
- [ ] New conversation: select student from roster

**API Endpoints:**

- `POST /api/instructor/messages/{conversationId}` - Send message
- `POST /api/instructor/messages` - Start new conversation
- `POST /api/instructor/messages/{id}/attachments` - Upload attachment

**UI Components:**

- `MessageComposer` - Input form
- `StudentPicker` - Select student for new message

---

##### 9.2.4 - Class Announcements

**As an** instructor  
**I want to** send announcements to all students in a class  
**So that** I can communicate important information efficiently

**Story Points:** 8

**Acceptance Criteria:**

- [ ] Announcements tab separate from direct messages
- [ ] List of sent announcements
- [ ] Each announcement shows: title, content preview, date, recipients count
- [ ] Announcement detail view with full content
- [ ] Read/unread statistics per announcement
- [ ] Filter by class

**API Endpoints:**

- `GET /api/instructor/announcements` - List announcements
- `GET /api/instructor/announcements/{id}` - Announcement detail
- `GET /api/instructor/announcements/{id}/stats` - Read statistics

**UI Components:**

- `AnnouncementList` - Announcements list
- `AnnouncementCard` - Single announcement preview

---

##### 9.2.5 - Create Announcement

**As an** instructor  
**I want to** create and schedule announcements  
**So that** I can plan my communication in advance

**Story Points:** 5

**Acceptance Criteria:**

- [ ] Announcement form: title, content (rich text)
- [ ] Select target class(es) or all classes
- [ ] Send immediately or schedule for later
- [ ] Date/time picker for scheduled announcements
- [ ] Preview before sending
- [ ] Confirmation dialog before sending
- [ ] Success notification

**API Endpoints:**

- `POST /api/instructor/announcements` - Create announcement
- `GET /api/instructor/classes` - List classes for selection

**UI Components:**

- `AnnouncementForm` - Create/edit form
- `ClassSelector` - Multi-select for target classes

---

##### 9.2.6 - Message Notifications

**As a** user  
**I want to** receive notifications for new messages  
**So that** I don't miss important communications

**Story Points:** 5

**Acceptance Criteria:**

- [ ] In-app notification badge on messages icon
- [ ] Push notification for new messages (if enabled)
- [ ] Email notification for important messages
- [ ] Notification preferences in settings
- [ ] Toggle: Direct messages, Announcements
- [ ] Quiet hours setting (don't notify during certain times)

**API Endpoints:**

- `GET /api/notifications/settings` - Get preferences
- `PATCH /api/notifications/settings` - Update preferences

**UI Components:**

- `NotificationBadge` - Unread count indicator
- `NotificationSettings` - Preferences form

---

##### 9.2.7 - Message Search & Filter

**As an** instructor  
**I want to** search through my messages  
**So that** I can find specific conversations quickly

**Story Points:** 3

**Acceptance Criteria:**

- [ ] Search input in messages page
- [ ] Search by student name
- [ ] Search by message content
- [ ] Search results highlight matching text
- [ ] Clear search button

**API Endpoints:**

- `GET /api/instructor/messages/search?q=` - Search messages

---

##### 9.2.8 - Read Receipts & Status

**As an** instructor  
**I want to** see if students have read my messages  
**So that** I know my communication is being received

**Story Points:** 3

**Acceptance Criteria:**

- [ ] Read receipt indicator (checkmarks or "Seen" label)
- [ ] Timestamp when message was read
- [ ] Delivery status: Sent, Delivered, Read
- [ ] For announcements: percentage of students who read

**API Endpoints:**

- Included in message detail responses

---

## 📊 Summary

### Story Points by Module

| Module    | Description        | Story Points |
| --------- | ------------------ | ------------ |
| M26       | Community & Social | 55 pts       |
| M27       | Messaging System   | 45 pts       |
| **Total** |                    | **100 pts**  |

### Implementation Notes

1. **Community (M26)** can be implemented in parallel with Gamification (M08-M11) as they share some user engagement concepts
2. **Messaging (M27)** depends on Class system and can be built after Class Management modules are complete
3. Both modules enhance user engagement and retention

### Frontend Pages

| Module | Pages                                                                                                                               |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| M26    | `/community` (Feed, Groups, Events tabs)                                                                                            |
| M27    | `/instructor/messages`, `/instructor/messages/[id]`, `/instructor/messages/announcements`, `/instructor/messages/announcements/new` |

---

**End of Additional Modules Document**

_These modules complement the core LMS functionality with community and communication features that drive student engagement._
