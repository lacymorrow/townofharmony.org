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
CREATE INDEX "contact_submission_form_type_idx" ON "toh_contact_submission" USING btree ("form_type");--> statement-breakpoint
CREATE INDEX "contact_submission_status_idx" ON "toh_contact_submission" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contact_submission_created_at_idx" ON "toh_contact_submission" USING btree ("created_at");
