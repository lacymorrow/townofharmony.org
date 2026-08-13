CREATE TABLE IF NOT EXISTS "toh_contact_submission" (
	"id" text PRIMARY KEY NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(320) NOT NULL,
	"phone" varchar(64),
	"inquiry_type" varchar(128) NOT NULL,
	"inquiry_label" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"attachment_filename" varchar(512),
	"ip" varchar(64),
	"send_status" varchar(32) DEFAULT 'pending' NOT NULL,
	"send_error" text,
	"resend_message_id" varchar(255),
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contact_submission_created_at_idx" ON "toh_contact_submission" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contact_submission_send_status_idx" ON "toh_contact_submission" USING btree ("send_status");
