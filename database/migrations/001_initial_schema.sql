-- ─────────────────────────────────────────────────────────────────────────────
-- EduFlow LMS — Database Schema   PostgreSQL 15+
-- ─────────────────────────────────────────────────────────────────────────────

-- Users
CREATE TABLE IF NOT EXISTS users (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  role          VARCHAR(50)  NOT NULL DEFAULT 'student',
  avatar_url    VARCHAR(500),
  headline      VARCHAR(255),
  bio           TEXT,
  website       VARCHAR(255),
  is_active     BOOLEAN      NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(100) NOT NULL,
  slug         VARCHAR(100) UNIQUE NOT NULL,
  icon         VARCHAR(50),
  color        VARCHAR(7)   DEFAULT '#7C3AED',
  course_count INT          NOT NULL DEFAULT 0
);

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  title              VARCHAR(255)  NOT NULL,
  slug               VARCHAR(255)  UNIQUE NOT NULL,
  description        TEXT,
  short_description  VARCHAR(500),
  thumbnail_url      VARCHAR(500),
  preview_video_url  VARCHAR(500),
  instructor_id      UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id        UUID          REFERENCES categories(id) ON DELETE SET NULL,
  level              VARCHAR(50)   NOT NULL DEFAULT 'beginner',
  language           VARCHAR(50)   NOT NULL DEFAULT 'English',
  price              DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_published       BOOLEAN       NOT NULL DEFAULT false,
  is_featured        BOOLEAN       NOT NULL DEFAULT false,
  total_lessons      INT           NOT NULL DEFAULT 0,
  total_duration_min INT           NOT NULL DEFAULT 0,
  enrollment_count   INT           NOT NULL DEFAULT 0,
  rating_average     DECIMAL(3,2)  NOT NULL DEFAULT 0,
  rating_count       INT           NOT NULL DEFAULT 0,
  requirements       TEXT[]        DEFAULT '{}',
  outcomes           TEXT[]        DEFAULT '{}',
  tags               TEXT[]        DEFAULT '{}',
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Sections (chapters within a course)
CREATE TABLE IF NOT EXISTS sections (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  UUID         NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title      VARCHAR(255) NOT NULL,
  position   INTEGER      NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id       UUID         NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  course_id        UUID         NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title            VARCHAR(255) NOT NULL,
  content          TEXT,
  video_url        VARCHAR(500),
  duration_minutes INTEGER      NOT NULL DEFAULT 5,
  position         INTEGER      NOT NULL DEFAULT 0,
  type             VARCHAR(50)  NOT NULL DEFAULT 'video',
  is_free_preview  BOOLEAN      NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id           UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress_percentage INTEGER     NOT NULL DEFAULT 0,
  last_lesson_id      UUID        REFERENCES lessons(id) ON DELETE SET NULL,
  completed_at        TIMESTAMPTZ,
  enrolled_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Lesson Progress
CREATE TABLE IF NOT EXISTS lesson_progress (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id    UUID        NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id    UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed    BOOLEAN     NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id  UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  rating     INTEGER     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email         ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role          ON users(role);
CREATE INDEX IF NOT EXISTS idx_courses_instructor  ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_category    ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_published   ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_featured    ON courses(is_featured);
CREATE INDEX IF NOT EXISTS idx_sections_course     ON sections(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_section     ON lessons(section_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course      ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user    ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course  ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lp_user             ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lp_lesson           ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_reviews_course      ON reviews(course_id);

-- ─── Auto-update trigger ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_upd    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_courses_upd  BEFORE UPDATE ON courses  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_lessons_upd  BEFORE UPDATE ON lessons  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ─── Seed Categories ─────────────────────────────────────────────────────────
INSERT INTO categories (name, slug, icon, color) VALUES
  ('Web Development',    'web-development',    'Code',        '#3B82F6'),
  ('Data Science',       'data-science',       'BarChart2',   '#8B5CF6'),
  ('Mobile Development', 'mobile-development', 'Smartphone',  '#10B981'),
  ('UI/UX Design',       'ui-ux-design',       'Palette',     '#EC4899'),
  ('Business',           'business',           'Briefcase',   '#F59E0B'),
  ('Photography',        'photography',        'Camera',      '#EF4444'),
  ('Marketing',          'marketing',          'TrendingUp',  '#06B6D4'),
  ('Cloud & DevOps',     'cloud-devops',       'Cloud',       '#6366F1')
ON CONFLICT (slug) DO NOTHING;
