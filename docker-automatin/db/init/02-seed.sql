-- Seed data for testing

-- Insert a test user
INSERT INTO users (email, password_hash, first_name, last_name, role, institution, research_purpose)
VALUES (
  'researcher@example.com',
  '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', -- 'password123'
  'John',
  'Doe',
  'Research Scientist',
  'University Research Center',
  'Investigating novel inhibitors for dengue virus NS3 protease'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample docking jobs
INSERT INTO docking_jobs (user_id, name, status, grid_size_x, grid_size_y, grid_size_z, created_at, completed_at)
VALUES 
  ((SELECT id FROM users WHERE email = 'researcher@example.com'), 'Dengue Protease Docking', 'completed', 30, 30, 30, NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days'),
  ((SELECT id FROM users WHERE email = 'researcher@example.com'), 'NS3 Inhibitor Analysis', 'in-progress', 35, 35, 35, NOW() - INTERVAL '2 days', NULL)
ON CONFLICT DO NOTHING;
