-- Add token tracking columns to tasks table
-- These are nullable: only populated for AI-driven tasks

ALTER TABLE tasks ADD COLUMN input_tokens BIGINT;
ALTER TABLE tasks ADD COLUMN output_tokens BIGINT;
ALTER TABLE tasks ADD COLUMN cached_tokens BIGINT;
ALTER TABLE tasks ADD COLUMN model_used TEXT;
