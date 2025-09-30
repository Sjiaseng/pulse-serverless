CREATE TABLE "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"achievement_title" varchar(256) NOT NULL,
	"achievement_description" text,
	"achievement_icon" text,
	"quest_id" serial NOT NULL
);

CREATE TABLE "forum_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"date_created" timestamp with time zone DEFAULT now(),
	"upvotes" integer DEFAULT 0,
	"downvotes" integer DEFAULT 0,
	"forum_post_id" integer NOT NULL,
	"user_id" uuid NOT NULL
);

CREATE TABLE "forum_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(256) NOT NULL,
	"description" text NOT NULL,
	"date_posted" timestamp with time zone DEFAULT now(),
	"upvotes" integer DEFAULT 0,
	"downvotes" integer DEFAULT 0,
	"user_id" uuid NOT NULL,
	"forum_id" integer NOT NULL
);

CREATE TABLE "forums" (
	"id" serial PRIMARY KEY NOT NULL,
	"topic" varchar(256) NOT NULL,
	"description" text,
	"popular_rank" integer DEFAULT 0,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE "leaderboards" (
	"id" serial PRIMARY KEY NOT NULL,
	"highest_level" integer DEFAULT 0,
	"highest_score_cumulative" integer DEFAULT 0,
	"hightest_most_achievement" integer DEFAULT 0,
	"user_id" uuid NOT NULL
);

CREATE TABLE "oauth_accounts" (
	"user_id" uuid NOT NULL,
	"provider" varchar(50) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"access_token" varchar(1024),
	"refresh_token" varchar(1024),
	"scope" varchar(512),
	"token_type" varchar(50),
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "oauth_accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);

CREATE TABLE "pets" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_name" varchar(256) NOT NULL,
	"pet_type" varchar(256) NOT NULL,
	"pet_experience" integer DEFAULT 0 NOT NULL,
	"pet_level" integer DEFAULT 1 NOT NULL,
	"pet_happiness" integer DEFAULT 50 NOT NULL,
	"pet_status" varchar(256) DEFAULT 'healthy' NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE "practitioners" (
	"id" serial PRIMARY KEY NOT NULL,
	"license_url" text NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now(),
	"status" varchar(50) DEFAULT 'pending',
	"user_id" uuid NOT NULL
);

CREATE TABLE "quest_completions" (
	"id" serial PRIMARY KEY NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now(),
	"completion_status" varchar(50),
	"quest_id" serial NOT NULL,
	"user_id" uuid NOT NULL
);

CREATE TABLE "quests" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(256) NOT NULL,
	"description" text,
	"points_awarded" integer DEFAULT 0,
	"available_date" timestamp with time zone,
	"last_updated_at" timestamp with time zone DEFAULT now(),
	"expiration_date" timestamp with time zone,
	"difficulty_level" varchar(50)
);

CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"password" varchar(256),
	"profile_picture_url" text,
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"gender" varchar(10),
	"online_status" boolean DEFAULT false,
	"suspension_status" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

ALTER TABLE "achievements" ADD CONSTRAINT "achievements_quest_id_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."quests"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_forum_post_id_forum_posts_id_fk" FOREIGN KEY ("forum_post_id") REFERENCES "public"."forum_posts"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_forum_id_forums_id_fk" FOREIGN KEY ("forum_id") REFERENCES "public"."forums"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "forums" ADD CONSTRAINT "forums_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "leaderboards" ADD CONSTRAINT "leaderboards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pets" ADD CONSTRAINT "pets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "practitioners" ADD CONSTRAINT "practitioners_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "quest_completions" ADD CONSTRAINT "quest_completions_quest_id_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."quests"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "quest_completions" ADD CONSTRAINT "quest_completions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;