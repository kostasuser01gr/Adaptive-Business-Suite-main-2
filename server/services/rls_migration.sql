-- NEXUS OS: ENTERPRISE HARDENING - ROW LEVEL SECURITY POLICIES
-- This file documents the policies that must be applied to the Postgres database.

-- 1. Enable RLS on all core tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

-- 2. Define Policy: Users can only see/mutate their own data
-- We use the 'app.current_user_id' session variable set via server/db.ts

CREATE POLICY tenant_isolation_users ON users 
  USING (id = current_setting('app.current_user_id'));

CREATE POLICY tenant_isolation_workspaces ON workspaces 
  USING (owner_id = current_setting('app.current_user_id'));

CREATE POLICY tenant_isolation_vehicles ON vehicles 
  USING (user_id = current_setting('app.current_user_id'));

CREATE POLICY tenant_isolation_customers ON customers 
  USING (user_id = current_setting('app.current_user_id'));

CREATE POLICY tenant_isolation_bookings ON bookings 
  USING (user_id = current_setting('app.current_user_id'));

CREATE POLICY tenant_isolation_maintenance ON maintenance_records 
  USING (user_id = current_setting('app.current_user_id'));

CREATE POLICY tenant_isolation_tasks ON tasks 
  USING (user_id = current_setting('app.current_user_id'));

CREATE POLICY tenant_isolation_notes ON notes 
  USING (user_id = current_setting('app.current_user_id'));

CREATE POLICY tenant_isolation_actions ON action_history 
  USING (user_id = current_setting('app.current_user_id'));

CREATE POLICY tenant_isolation_chat ON chat_messages 
  USING (user_id = current_setting('app.current_user_id'));

CREATE POLICY tenant_isolation_notifications ON notifications 
  USING (user_id = current_setting('app.current_user_id'));

CREATE POLICY tenant_isolation_automations ON automations 
  USING (user_id = current_setting('app.current_user_id'));

CREATE POLICY tenant_isolation_inspections ON inspections 
  USING (user_id = current_setting('app.current_user_id'));
