# Introduction
Pulse - A Gamified Learning System for Cardiovascular Disease

Description: This is an cloud-based application specifically targetting individuals who want to learn about cardiovascular disease through interactive and gamified experiences. It is designed to make complex medical concepts easier to understand, engaging, and memorable.

Developed by:

- Chin Hong Wei

- Sia Jun Ian

- Soh Jia Seng

Technical Stacks:

- Next.Js (Frontend & Backend)

- AWS RDS (PostgreSQL)

- AWS DynamoDB

- Ably - Cloud Websocket Service [LiveChat, Online Status Handling] 

  `Require api access key from ably dashboard`

Note: Environment setup refer .env.example

## AWS RDS (PostgreSQL) Schema
PostgreSQL Database: [Database Name: pulse]

`Connection Require [DB_NAME, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_ENDPOINT, DATABASE_URL] `

Tables / Entities:

1. oauth_accounts -> Save OAuth Token Information
2. users -> Save User Info
3. leaderboards -> Save User Score According to Quest Completed & Rankings.
4. pets -> Save User Pet Info
5. quests -> Save Quest Info
6. quest_completions -> Quest Completed Record for Each User [User & Practitioner Roles]
7. achievements -> Achievement Badge Acquire Once A Quest is Completed
8. forum -> Save Forum Topics
9. forum_posts -> Save Forum Posts
10. forum_comments -> Save Forum Comments
11. practitioners -> Save Users' Practitioner Requests.

Commands to Migrate:
```
drizzle-kit generate
drizzle-kit push
```
## AWS DynamoDB (NoSQL) Schema
DynamoDB: Integrating Live Chat Function

* Rotation Required for Each 4 Hours with Learner Lab

` Require [AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN] `

1. ChatSession -> Save Chat Record Created By Users [PK]
2. ChatMessage -> Save Chat Messages according to Chat Record [PK + SK]

Commands to Migrate:
```
npm run dynamodb
```

## S3 Buckets: Document/Images Storage
* Rotation Required for Each 4 Hours with Learner Lab

` Require [AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN, S3_BUCKET_NAME] `

Current Route:
1. /profile/userId/xxx... [profile picture]
2. /chat/chatmessageId/xxx... [chat message attachment]
3. /practitioner/practitionerId/xxx... [practitioner verification docs]
4. /achievement/achievementId/xxx... [achievement pictures]

## Docker Setup [App Image Building Only]:

```
docker build -t your-image-name .
```

```
docker-compose up -d
```