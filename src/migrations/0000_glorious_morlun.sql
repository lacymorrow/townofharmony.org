CREATE TYPE "public"."team_type" AS ENUM('personal', 'workspace');--> statement-breakpoint
CREATE TABLE "toh_account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "toh_account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "toh_api_key" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"key" varchar(255) NOT NULL,
	"user_id" varchar(255),
	"project_id" varchar(255),
	"name" varchar(255) NOT NULL,
	"description" text,
	"expires_at" timestamp,
	"last_used_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "toh_authenticator" (
	"credentialID" text NOT NULL,
	"userId" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"credentialPublicKey" text NOT NULL,
	"counter" integer NOT NULL,
	"credentialDeviceType" text NOT NULL,
	"credentialBackedUp" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "toh_authenticator_userId_credentialID_pk" PRIMARY KEY("userId","credentialID"),
	CONSTRAINT "toh_authenticator_credentialID_unique" UNIQUE("credentialID")
);
--> statement-breakpoint
CREATE TABLE "toh_contact_submission" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"form_type" varchar(20) NOT NULL,
	"inquiry_type" varchar(50),
	"submitter_email_partial" varchar(100),
	"ip_hash" varchar(64),
	"status" varchar(20) DEFAULT 'success' NOT NULL,
	"rejection_reason" varchar(100),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "toh_credit_transaction" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"amount" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"description" text,
	"metadata" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "toh_deployments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"project_name" text NOT NULL,
	"description" text,
	"github_repo_url" text,
	"github_repo_name" text,
	"vercel_project_id" text,
	"vercel_project_url" text,
	"vercel_deployment_id" text,
	"vercel_deployment_url" text,
	"status" text DEFAULT 'deploying' NOT NULL,
	"error" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "toh_feedback" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"source" varchar(50) NOT NULL,
	"metadata" text DEFAULT '{}',
	"status" varchar(20) DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "toh_payment" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"order_id" varchar(255),
	"processor_order_id" varchar(255),
	"amount" integer,
	"status" varchar(255) NOT NULL,
	"processor" varchar(50),
	"product_name" text,
	"is_free_product" boolean DEFAULT false,
	"metadata" text DEFAULT '{}',
	"purchased_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "toh_permission" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"resource" varchar(255) NOT NULL,
	"action" varchar(255) NOT NULL,
	"attributes" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "toh_plan" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"productName" text,
	"variantId" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" text NOT NULL,
	"isUsageBased" boolean DEFAULT false,
	"interval" text,
	"intervalCount" integer,
	"trialInterval" text,
	"trialIntervalCount" integer,
	"sort" integer,
	CONSTRAINT "toh_plan_variantId_unique" UNIQUE("variantId")
);
--> statement-breakpoint
CREATE TABLE "toh_post" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"createdById" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "toh_project_member" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"project_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"role" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "toh_project" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"team_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "toh_role_permission" (
	"role_id" varchar(255) NOT NULL,
	"permission_id" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "toh_role_permission_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "toh_role" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "toh_session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "toh_team_member" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"team_id" varchar(255) NOT NULL,
	"role" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "toh_team" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "team_type" DEFAULT 'workspace' NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "toh_temporary_link" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"data" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"type" varchar(50) NOT NULL,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "toh_user_credit" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "toh_user_credit_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "toh_user_file" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"location" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "toh_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"image" varchar(255),
	"password" varchar(255),
	"github_username" varchar(255),
	"role" varchar(50) DEFAULT 'user' NOT NULL,
	"bio" text,
	"theme" varchar(20) DEFAULT 'system',
	"metadata" text,
	"vercel_connection_attempted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "toh_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "toh_verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "toh_verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "toh_waitlist_entry" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"company" varchar(255),
	"role" varchar(100),
	"project_type" varchar(100),
	"timeline" varchar(100),
	"interests" text,
	"is_notified" boolean DEFAULT false,
	"notified_at" timestamp with time zone,
	"source" varchar(50) DEFAULT 'website',
	"metadata" text DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "toh_waitlist_entry_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "toh_webhook_event" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_name" text NOT NULL,
	"processed" boolean DEFAULT false,
	"body" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "toh_account" ADD CONSTRAINT "toh_account_userId_toh_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."toh_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toh_api_key" ADD CONSTRAINT "toh_api_key_user_id_toh_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."toh_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toh_api_key" ADD CONSTRAINT "toh_api_key_project_id_toh_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."toh_project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toh_authenticator" ADD CONSTRAINT "toh_authenticator_userId_toh_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."toh_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toh_credit_transaction" ADD CONSTRAINT "toh_credit_transaction_user_id_toh_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."toh_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toh_deployments" ADD CONSTRAINT "toh_deployments_user_id_toh_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."toh_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toh_post" ADD CONSTRAINT "toh_post_createdById_toh_user_id_fk" FOREIGN KEY ("createdById") REFERENCES "public"."toh_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toh_project_member" ADD CONSTRAINT "toh_project_member_project_id_toh_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."toh_project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toh_project_member" ADD CONSTRAINT "toh_project_member_user_id_toh_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."toh_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toh_project" ADD CONSTRAINT "toh_project_team_id_toh_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."toh_team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toh_role_permission" ADD CONSTRAINT "toh_role_permission_role_id_toh_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."toh_role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toh_role_permission" ADD CONSTRAINT "toh_role_permission_permission_id_toh_permission_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."toh_permission"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toh_session" ADD CONSTRAINT "toh_session_userId_toh_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."toh_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toh_team_member" ADD CONSTRAINT "toh_team_member_user_id_toh_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."toh_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toh_team_member" ADD CONSTRAINT "toh_team_member_team_id_toh_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."toh_team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toh_temporary_link" ADD CONSTRAINT "toh_temporary_link_user_id_toh_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."toh_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toh_user_credit" ADD CONSTRAINT "toh_user_credit_user_id_toh_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."toh_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toh_user_file" ADD CONSTRAINT "toh_user_file_user_id_toh_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."toh_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "toh_account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "contact_submission_form_type_idx" ON "toh_contact_submission" USING btree ("form_type");--> statement-breakpoint
CREATE INDEX "contact_submission_status_idx" ON "toh_contact_submission" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contact_submission_created_at_idx" ON "toh_contact_submission" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "credit_transaction_user_id_idx" ON "toh_credit_transaction" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "credit_transaction_type_idx" ON "toh_credit_transaction" USING btree ("type");--> statement-breakpoint
CREATE INDEX "deployment_user_id_idx" ON "toh_deployments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "deployment_status_idx" ON "toh_deployments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "deployment_created_at_idx" ON "toh_deployments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "createdById_idx" ON "toh_post" USING btree ("createdById");--> statement-breakpoint
CREATE INDEX "name_idx" ON "toh_post" USING btree ("name");--> statement-breakpoint
CREATE INDEX "user_credit_user_id_idx" ON "toh_user_credit" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_file_user_id_idx" ON "toh_user_file" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "waitlist_email_idx" ON "toh_waitlist_entry" USING btree ("email");--> statement-breakpoint
CREATE INDEX "waitlist_created_at_idx" ON "toh_waitlist_entry" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "waitlist_is_notified_idx" ON "toh_waitlist_entry" USING btree ("is_notified");