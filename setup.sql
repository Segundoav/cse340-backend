-- Organization Table
CREATE TABLE IF NOT EXISTS public.organization (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_filename VARCHAR(255) NOT NULL
);

INSERT INTO public.organization (name, description, contact_email, logo_filename) VALUES
('BrightFuture Builders', 'A nonprofit focused on improving community infrastructure.', 'info@brightfuturebuilders.org', 'brightfuture-logo.png'),
('GreenHarvest Growers', 'An urban farming collective promoting food sustainability.', 'contact@greenharvest.org', 'greenharvest-logo.png'),
('UnityServe Volunteers', 'A volunteer coordination group supporting local charities.', 'hello@unityserve.org', 'unityserve-logo.png');

-- Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    project_id SERIAL PRIMARY KEY,
    project_name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    organization_id INT REFERENCES public.organization(organization_id) ON DELETE CASCADE
);

INSERT INTO public.projects (project_name, description, organization_id) VALUES
('Community Center Rebuild', 'Rebuilding the local community center with sustainable materials.', 1),
('Urban Garden Initiative', 'Creating urban gardens in food deserts across the city.', 2),
('Homeless Shelter Support', 'Providing weekly volunteer support to local homeless shelters.', 3);

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL
);

INSERT INTO public.categories (category_name) VALUES
('Construction & Infrastructure'),
('Education & Tutoring'),
('Environmental & Clean-up');

-- Project Categories (many-to-many)
CREATE TABLE IF NOT EXISTS public.project_categories (
    project_id INT REFERENCES public.projects(project_id) ON DELETE CASCADE,
    category_id INT REFERENCES public.categories(category_id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, category_id)
);

INSERT INTO public.project_categories (project_id, category_id) VALUES
(1, 1),
(2, 3),
(3, 2);

-- Roles Table
CREATE TABLE IF NOT EXISTS public.roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    role_description TEXT
);

INSERT INTO public.roles (role_name, role_description) VALUES 
    ('user', 'Standard user with basic access'),
    ('admin', 'Administrator with full system access');

-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES public.roles(role_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Volunteers (many-to-many: users <-> projects)
CREATE TABLE IF NOT EXISTS public.project_volunteers (
    user_id INT REFERENCES public.users(user_id) ON DELETE CASCADE,
    project_id INT REFERENCES public.projects(project_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, project_id)
);