/**
 * EduFlow LMS — Demo Server (In-Memory, No Database)
 * Run: node demo-server.js
 */
const express = require('express');
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const cors    = require('cors');

const app    = express();
const SECRET = 'eduflow-demo-secret';
const PORT   = 5000;

app.use(express.json());
app.use(cors({ origin: '*' }));

// ─── In-memory DB ─────────────────────────────────────────────────────────────
const db = { users: [], enrollments: [], lessonProgress: [], reviews: [] };

const uid = () => Math.random().toString(36).slice(2)+Date.now().toString(36);
const now = () => new Date().toISOString();
const safeUser = u => { const { password_hash, ...r } = u; return r; };

// ─── Seed Data ────────────────────────────────────────────────────────────────
const INSTRUCTOR = {
  id:'instructor-1', email:'alex@eduflow.com', password_hash:'$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LkR/9LpXLuK',
  first_name:'Alex', last_name:'Morgan', role:'instructor',
  headline:'Senior Full Stack Developer · 10+ yrs', bio:'Passionate educator and developer.',
  avatar_url:null, is_active:true, created_at:now(), updated_at:now(),
};
db.users.push(INSTRUCTOR);

const CATEGORIES = [
  { id:'cat-1', name:'Web Development',    slug:'web',    icon:'Code',       color:'#3B82F6', course_count:2 },
  { id:'cat-2', name:'Data Science',       slug:'data',   icon:'BarChart2',  color:'#8B5CF6', course_count:1 },
  { id:'cat-3', name:'Mobile Development', slug:'mobile', icon:'Smartphone', color:'#10B981', course_count:1 },
  { id:'cat-4', name:'UI/UX Design',       slug:'design', icon:'Palette',    color:'#EC4899', course_count:1 },
  { id:'cat-5', name:'Business',           slug:'biz',    icon:'Briefcase',  color:'#F59E0B', course_count:1 },
  { id:'cat-6', name:'Cloud & DevOps',     slug:'cloud',  icon:'Cloud',      color:'#6366F1', course_count:1 },
];

const COURSES = [
  {
    id:'c1', title:'Complete React Developer in 2024', slug:'react-2024',
    short_description:'Master React, Redux, TypeScript, and modern React patterns.',
    description:'This comprehensive course covers everything from React fundamentals to advanced patterns including hooks, context, Redux Toolkit, and TypeScript integration. Build 5 real-world projects.',
    category_id:'cat-1', category_name:'Web Development', category_color:'#3B82F6',
    instructor_id:'instructor-1', instructor_name:'Alex Morgan', instructor_avatar:null, instructor_headline:'Senior Full Stack Developer · 10+ yrs',
    level:'beginner', language:'English', price:0, is_published:true, is_featured:true,
    total_lessons:24, total_duration_min:840, enrollment_count:3420,
    rating_average:4.8, rating_count:312, requirements:['Basic HTML/CSS','JavaScript fundamentals'],
    outcomes:['Build real-world React apps','Master Hooks and Context API','TypeScript with React','State management with Redux'],
    tags:['react','javascript','typescript'], created_at:now(), updated_at:now(),
  },
  {
    id:'c2', title:'Python for Data Science & ML', slug:'python-data-science',
    short_description:'From Python basics to Machine Learning algorithms with scikit-learn.',
    description:'Learn Python from scratch and quickly get to building machine learning models. Covers NumPy, Pandas, Matplotlib, and scikit-learn with hands-on projects.',
    category_id:'cat-2', category_name:'Data Science', category_color:'#8B5CF6',
    instructor_id:'instructor-1', instructor_name:'Alex Morgan', instructor_avatar:null, instructor_headline:'Senior Full Stack Developer · 10+ yrs',
    level:'intermediate', language:'English', price:0, is_published:true, is_featured:true,
    total_lessons:30, total_duration_min:1080, enrollment_count:2180,
    rating_average:4.7, rating_count:189, requirements:['Basic programming knowledge'],
    outcomes:['Python for data analysis','Pandas & NumPy mastery','Machine learning fundamentals','Data visualization'],
    tags:['python','machine learning','data science'], created_at:now(), updated_at:now(),
  },
  {
    id:'c3', title:'Flutter App Development Bootcamp', slug:'flutter-bootcamp',
    short_description:'Build iOS & Android apps with Flutter and Dart from scratch.',
    description:'Master Flutter development and build beautiful, natively compiled apps. This course covers Dart language, Flutter widgets, state management, and publishing to app stores.',
    category_id:'cat-3', category_name:'Mobile Development', category_color:'#10B981',
    instructor_id:'instructor-1', instructor_name:'Alex Morgan', instructor_avatar:null, instructor_headline:'Senior Full Stack Developer · 10+ yrs',
    level:'beginner', language:'English', price:0, is_published:true, is_featured:false,
    total_lessons:28, total_duration_min:960, enrollment_count:1560,
    rating_average:4.6, rating_count:134, requirements:['Basic programming concepts'],
    outcomes:['Build cross-platform apps','Dart language mastery','Flutter UI development','Publish to App Store & Play Store'],
    tags:['flutter','dart','mobile'], created_at:now(), updated_at:now(),
  },
  {
    id:'c4', title:'UI/UX Design Masterclass', slug:'uiux-masterclass',
    short_description:'Complete UI/UX design course: Figma, prototyping, user research.',
    description:'From design thinking to high-fidelity prototypes — this course takes you through the complete UI/UX design process using Figma and industry-standard techniques.',
    category_id:'cat-4', category_name:'UI/UX Design', category_color:'#EC4899',
    instructor_id:'instructor-1', instructor_name:'Alex Morgan', instructor_avatar:null, instructor_headline:'Senior Full Stack Developer · 10+ yrs',
    level:'all-levels', language:'English', price:0, is_published:true, is_featured:true,
    total_lessons:22, total_duration_min:780, enrollment_count:890,
    rating_average:4.9, rating_count:98, requirements:['No prior design experience needed'],
    outcomes:['Figma proficiency','User research methods','Wireframing & prototyping','Design systems'],
    tags:['figma','ui design','ux'], created_at:now(), updated_at:now(),
  },
  {
    id:'c5', title:'Node.js & Express API Development', slug:'nodejs-api',
    short_description:'Build production-ready REST APIs with Node.js, Express, and PostgreSQL.',
    description:'This advanced course covers building scalable REST APIs with Node.js and Express. Topics include authentication, authorization, database design, caching, testing, and deployment.',
    category_id:'cat-1', category_name:'Web Development', category_color:'#3B82F6',
    instructor_id:'instructor-1', instructor_name:'Alex Morgan', instructor_avatar:null, instructor_headline:'Senior Full Stack Developer · 10+ yrs',
    level:'advanced', language:'English', price:0, is_published:true, is_featured:false,
    total_lessons:32, total_duration_min:1200, enrollment_count:1240,
    rating_average:4.8, rating_count:156, requirements:['JavaScript proficiency','Basic Node.js knowledge'],
    outcomes:['RESTful API design','JWT authentication','PostgreSQL integration','AWS deployment'],
    tags:['nodejs','express','api','postgresql'], created_at:now(), updated_at:now(),
  },
  {
    id:'c6', title:'AWS Cloud & DevOps Fundamentals', slug:'aws-devops',
    short_description:'Master AWS services, Docker, CI/CD pipelines and cloud architecture.',
    description:'Get hands-on with AWS services including EC2, ECS, RDS, S3, and CloudWatch. Learn Docker, GitHub Actions CI/CD, and best practices for production cloud deployments.',
    category_id:'cat-6', category_name:'Cloud & DevOps', category_color:'#6366F1',
    instructor_id:'instructor-1', instructor_name:'Alex Morgan', instructor_avatar:null, instructor_headline:'Senior Full Stack Developer · 10+ yrs',
    level:'intermediate', language:'English', price:0, is_published:true, is_featured:true,
    total_lessons:26, total_duration_min:900, enrollment_count:780,
    rating_average:4.7, rating_count:72, requirements:['Basic Linux knowledge','Familiarity with web apps'],
    outcomes:['AWS core services','Docker & containerization','CI/CD pipelines','Production deployments'],
    tags:['aws','docker','devops','cloud'], created_at:now(), updated_at:now(),
  },
];

const SECTIONS = {
  c1: [
    { id:'s1-1', course_id:'c1', title:'Getting Started with React', position:0,
      lessons:[
        { id:'l1-1', section_id:'s1-1', course_id:'c1', title:'Introduction & Course Overview', type:'video', duration_minutes:8, is_free_preview:true, position:0, video_url:'https://www.youtube.com/watch?v=SqcY0GlETPk' },
        { id:'l1-2', section_id:'s1-1', course_id:'c1', title:'Setting Up Your Development Environment', type:'video', duration_minutes:12, is_free_preview:true, position:1, video_url:'https://www.youtube.com/watch?v=Tn6-PIqc4UM' },
        { id:'l1-3', section_id:'s1-1', course_id:'c1', title:'Your First React Component', type:'video', duration_minutes:15, is_free_preview:false, position:2, video_url:'https://www.youtube.com/watch?v=s2skans2dP4' },
        { id:'l1-4', section_id:'s1-1', course_id:'c1', title:'Understanding JSX', type:'text', duration_minutes:10, is_free_preview:false, position:3 },
      ]
    },
    { id:'s1-2', course_id:'c1', title:'React Hooks Deep Dive', position:1,
      lessons:[
        { id:'l1-5', section_id:'s1-2', course_id:'c1', title:'useState and useEffect', type:'video', duration_minutes:20, is_free_preview:false, position:0, video_url:'https://www.youtube.com/watch?v=O6P86uwfdR0' },
        { id:'l1-6', section_id:'s1-2', course_id:'c1', title:'Custom Hooks', type:'video', duration_minutes:18, is_free_preview:false, position:1, video_url:'https://www.youtube.com/watch?v=6ThXsUwLWvc' },
        { id:'l1-7', section_id:'s1-2', course_id:'c1', title:'useContext and State Management', type:'video', duration_minutes:22, is_free_preview:false, position:2, video_url:'https://www.youtube.com/watch?v=5LrDIWkK_Bc' },
      ]
    },
    { id:'s1-3', course_id:'c1', title:'Advanced Patterns', position:2,
      lessons:[
        { id:'l1-8', section_id:'s1-3', course_id:'c1', title:'Performance Optimization', type:'video', duration_minutes:25, is_free_preview:false, position:0 },
        { id:'l1-9', section_id:'s1-3', course_id:'c1', title:'TypeScript with React', type:'video', duration_minutes:30, is_free_preview:false, position:1 },
      ]
    },
  ],
  c2: [
    { id:'s2-1', course_id:'c2', title:'Python Fundamentals', position:0,
      lessons:[
        { id:'l2-1', section_id:'s2-1', course_id:'c2', title:'Python Setup & Introduction', type:'video', duration_minutes:10, is_free_preview:true, position:0 },
        { id:'l2-2', section_id:'s2-1', course_id:'c2', title:'Data Types & Variables', type:'video', duration_minutes:15, is_free_preview:false, position:1 },
        { id:'l2-3', section_id:'s2-1', course_id:'c2', title:'Functions & Modules', type:'video', duration_minutes:18, is_free_preview:false, position:2 },
      ]
    },
    { id:'s2-2', course_id:'c2', title:'Data Analysis with Pandas', position:1,
      lessons:[
        { id:'l2-4', section_id:'s2-2', course_id:'c2', title:'Introduction to Pandas', type:'video', duration_minutes:20, is_free_preview:false, position:0 },
        { id:'l2-5', section_id:'s2-2', course_id:'c2', title:'Data Cleaning & Transformation', type:'video', duration_minutes:25, is_free_preview:false, position:1 },
      ]
    },
  ],
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
const auth = (req, res, next) => {
  const h = req.headers['authorization'];
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ success:false, message:'Authentication required' });
  try { req.user = jwt.verify(h.split(' ')[1], SECRET); next(); }
  catch { res.status(401).json({ success:false, message:'Invalid token' }); }
};

const sign = (user) => jwt.sign({ userId:user.id, email:user.email, role:user.role }, SECRET, { expiresIn:'7d' });

app.get('/health', (_,res) => res.json({ status:'healthy', mode:'demo-in-memory', timestamp:now() }));

app.post('/api/auth/register', async (req, res) => {
  const { email, password, first_name, last_name } = req.body;
  if (db.users.find(u => u.email === email?.toLowerCase()))
    return res.status(409).json({ success:false, message:'Email already registered' });
  const hash = await bcrypt.hash(password, 10);
  const user = { id:uid(), email:email.toLowerCase(), password_hash:hash, first_name, last_name,
    role:'student', avatar_url:null, headline:null, bio:null, website:null,
    is_active:true, created_at:now(), updated_at:now() };
  db.users.push(user);

  // Auto-enroll in 2 courses with demo progress
  db.enrollments.push({ id:uid(), user_id:user.id, course_id:'c1', progress_percentage:65, last_lesson_id:'l1-5', completed_at:null, enrolled_at:now() });
  db.enrollments.push({ id:uid(), user_id:user.id, course_id:'c4', progress_percentage:100, last_lesson_id:null, completed_at:now(), enrolled_at:now() });
  db.enrollments.push({ id:uid(), user_id:user.id, course_id:'c6', progress_percentage:20, last_lesson_id:'l1-2', completed_at:null, enrolled_at:now() });

  // Seed some lesson progress
  ['l1-1','l1-2','l1-3','l1-4','l1-5'].forEach(lid => {
    db.lessonProgress.push({ id:uid(), user_id:user.id, lesson_id:lid, course_id:'c1', completed:true, completed_at:now() });
  });

  res.status(201).json({ success:true, data:{ user:safeUser(user), token:sign(user) } });
});

app.post('/api/auth/login', async (req, res) => {
  const u = db.users.find(u => u.email === req.body.email?.toLowerCase());
  if (!u) return res.status(401).json({ success:false, message:'Invalid email or password' });
  const ok = await bcrypt.compare(req.body.password, u.password_hash);
  if (!ok) return res.status(401).json({ success:false, message:'Invalid email or password' });
  res.json({ success:true, data:{ user:safeUser(u), token:sign(u) } });
});

app.get('/api/auth/me', auth, (req,res) => {
  const u = db.users.find(u => u.id === req.user.userId);
  if (!u) return res.status(404).json({ success:false, message:'Not found' });
  res.json({ success:true, data:safeUser(u) });
});

app.put('/api/auth/me', auth, (req,res) => {
  const u = db.users.find(u => u.id === req.user.userId);
  if (!u) return res.status(404).json({ success:false, message:'Not found' });
  ['first_name','last_name','headline','bio','website'].forEach(k => { if (req.body[k] !== undefined) u[k] = req.body[k]; });
  u.updated_at = now();
  res.json({ success:true, data:safeUser(u) });
});

app.put('/api/auth/me/password', auth, async (req,res) => {
  const u = db.users.find(u => u.id === req.user.userId);
  const ok = await bcrypt.compare(req.body.current_password, u.password_hash);
  if (!ok) return res.status(400).json({ success:false, message:'Current password incorrect' });
  u.password_hash = await bcrypt.hash(req.body.new_password, 10);
  res.json({ success:true, message:'Password changed' });
});

// ─── Categories ───────────────────────────────────────────────────────────────
app.get('/api/courses/categories', (_,res) => res.json({ success:true, data:CATEGORIES }));

// ─── Courses ──────────────────────────────────────────────────────────────────
app.get('/api/courses', (req,res) => {
  let courses = [...COURSES];
  const { search, category, level, featured } = req.query;
  if (search)   courses = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
  if (category) courses = courses.filter(c => c.category_name.toLowerCase().includes(category.toLowerCase()) || CATEGORIES.find(cat => cat.slug===category)?.id === c.category_id);
  if (level)    courses = courses.filter(c => c.level === level);
  if (featured === 'true') courses = courses.filter(c => c.is_featured);
  res.json({ success:true, data:{ courses, total:courses.length } });
});

app.get('/api/courses/instructor/my-courses', auth, (req,res) => {
  const courses = COURSES.filter(c => c.instructor_id === req.user.userId);
  res.json({ success:true, data:{ courses, total:courses.length } });
});

app.get('/api/courses/:id', (req,res) => {
  const course = COURSES.find(c => c.id===req.params.id || c.slug===req.params.id);
  if (!course) return res.status(404).json({ success:false, message:'Course not found' });
  const sections = (SECTIONS[course.id]||[]).map(s => ({
    ...s, lessons: s.lessons.map(l => ({ ...l, content: getContent(l.id, l.title) }))
  }));
  let is_enrolled = false; let user_progress = 0;
  try {
    const h = req.headers['authorization'];
    if (h?.startsWith('Bearer ')) {
      const u = jwt.verify(h.split(' ')[1], SECRET);
      const e = db.enrollments.find(e => e.user_id===u.userId && e.course_id===course.id);
      is_enrolled = !!e; user_progress = e?.progress_percentage??0;
    }
  } catch {}
  res.json({ success:true, data:{ ...course, sections, is_enrolled, user_progress } });
});

app.get('/api/courses/:id/reviews', (req,res) => {
  const reviews = db.reviews.filter(r => r.course_id===req.params.id);
  res.json({ success:true, data:reviews });
});

// ─── Enrollments ──────────────────────────────────────────────────────────────
app.post('/api/enrollments/:courseId/enroll', auth, (req,res) => {
  const { courseId } = req.params;
  const exists = db.enrollments.find(e => e.user_id===req.user.userId && e.course_id===courseId);
  if (exists) return res.status(409).json({ success:false, message:'Already enrolled' });
  const e = { id:uid(), user_id:req.user.userId, course_id:courseId, progress_percentage:0, last_lesson_id:null, completed_at:null, enrolled_at:now() };
  db.enrollments.push(e);
  const c = COURSES.find(c => c.id===courseId);
  if (c) c.enrollment_count++;
  res.status(201).json({ success:true, data:e, message:'Enrolled successfully!' });
});

app.get('/api/enrollments/my', auth, (req,res) => {
  const myEnrollments = db.enrollments.filter(e => e.user_id===req.user.userId).map(e => {
    const c = COURSES.find(c => c.id===e.course_id);
    return c ? { ...e, title:c.title, slug:c.slug, thumbnail_url:c.thumbnail_url,
      total_lessons:c.total_lessons, level:c.level, rating_average:c.rating_average,
      instructor_name:c.instructor_name, category_name:c.category_name, category_color:c.category_color } : e;
  });
  res.json({ success:true, data:myEnrollments });
});

app.put('/api/enrollments/lessons/:lessonId/complete', auth, (req,res) => {
  const { lessonId } = req.params; const { courseId } = req.body;
  const existing = db.lessonProgress.find(lp => lp.user_id===req.user.userId && lp.lesson_id===lessonId);
  if (!existing) db.lessonProgress.push({ id:uid(), user_id:req.user.userId, lesson_id:lessonId, course_id:courseId, completed:true, completed_at:now() });
  else { existing.completed=true; existing.completed_at=now(); }
  const course = COURSES.find(c => c.id===courseId);
  const totalLessons = course?.total_lessons || 10;
  const doneLessons = db.lessonProgress.filter(lp => lp.user_id===req.user.userId && lp.course_id===courseId && lp.completed).length;
  const pct = Math.min(100, Math.round((doneLessons/totalLessons)*100));
  const enroll = db.enrollments.find(e => e.user_id===req.user.userId && e.course_id===courseId);
  if (enroll) { enroll.progress_percentage=pct; enroll.last_lesson_id=lessonId; if (pct===100) enroll.completed_at=now(); }
  res.json({ success:true, message:'Progress saved' });
});

app.get('/api/enrollments/:courseId/progress', auth, (req,res) => {
  const e = db.enrollments.find(e => e.user_id===req.user.userId && e.course_id===req.params.courseId);
  if (!e) return res.status(404).json({ success:false, message:'Not enrolled' });
  const completedLessons = db.lessonProgress.filter(lp => lp.user_id===req.user.userId && lp.course_id===req.params.courseId && lp.completed);
  res.json({ success:true, data:{ enrollment:e, completedLessons } });
});

// ─── Dashboard ────────────────────────────────────────────────────────────────
app.get('/api/dashboard/student', auth, (req,res) => {
  const uid = req.user.userId;
  const myEnrollments = db.enrollments.filter(e => e.user_id===uid);
  const recentEnrollments = myEnrollments.map(e => {
    const c = COURSES.find(c => c.id===e.course_id);
    return c ? { ...e, title:c.title, thumbnail_url:null, total_lessons:c.total_lessons, level:c.level, instructor_name:c.instructor_name, category_color:c.category_color } : e;
  }).slice(0,6);
  const inProgress = myEnrollments.filter(e => e.progress_percentage>0 && e.progress_percentage<100).map(e => {
    const c = COURSES.find(c => c.id===e.course_id);
    return c ? { ...e, title:c.title, thumbnail_url:null } : e;
  }).slice(0,4);
  res.json({ success:true, data:{
    stats:{ total_enrolled:myEnrollments.length, completed:myEnrollments.filter(e=>e.completed_at).length, avg_progress: myEnrollments.length ? Math.round(myEnrollments.reduce((s,e)=>s+e.progress_percentage,0)/myEnrollments.length) : 0 },
    recentEnrollments, inProgress,
  }});
});

app.get('/api/dashboard/instructor', auth, (req,res) => {
  const myCourses = COURSES.filter(c => c.instructor_id===req.user.userId);
  res.json({ success:true, data:{
    stats:{ total_courses:myCourses.length, published:myCourses.filter(c=>c.is_published).length, total_students:myCourses.reduce((s,c)=>s+c.enrollment_count,0), avg_rating:(myCourses.reduce((s,c)=>s+c.rating_average,0)/Math.max(myCourses.length,1)).toFixed(1) },
    recentEnrollments:[], topCourses:myCourses.slice(0,5),
  }});
});

// ─── Users ────────────────────────────────────────────────────────────────────
app.get('/api/users', auth, (_,res) => res.json({ success:true, data:db.users.map(safeUser) }));

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getContent(id, title) {
  const contents = {
    'l1-1': `# Welcome to the Complete React Developer Course!\n\nIn this course you will learn everything you need to build production-ready React applications. We cover:\n\n- React fundamentals and component architecture\n- Hooks: useState, useEffect, useContext, and more\n- State management with Redux Toolkit\n- TypeScript integration\n- Performance optimization techniques\n\n## What You'll Build\nYou'll build 5 real-world projects including a task manager, e-commerce site, and social platform.\n\n**Prerequisites:** Basic HTML, CSS, and JavaScript knowledge.`,
    'l1-2': `# Setting Up Your Development Environment\n\n## Tools You'll Need\n\n1. **Node.js** (v18 or later) — [nodejs.org](https://nodejs.org)\n2. **VS Code** — Best editor for React development\n3. **Git** — For version control\n\n## Creating Your First Project\n\n\`\`\`bash\nnpx create-react-app my-first-app --template typescript\ncd my-first-app\nnpm start\n\`\`\`\n\nOr with Vite (recommended for 2024):\n\`\`\`bash\nnpm create vite@latest my-app -- --template react-ts\ncd my-app\nnpm install && npm run dev\n\`\`\`\n\nYour app will be running at **http://localhost:5173** 🚀`,
    'l1-3': `# Your First React Component\n\nA React component is simply a JavaScript function that returns JSX:\n\n\`\`\`tsx\nfunction WelcomeMessage({ name }: { name: string }) {\n  return (\n    <div className="welcome">\n      <h1>Hello, {name}!</h1>\n      <p>Welcome to React development.</p>\n    </div>\n  );\n}\n\nexport default WelcomeMessage;\n\`\`\`\n\n## Key Concepts\n\n- **JSX** — JavaScript + HTML syntax\n- **Props** — Data passed to components\n- **Return** — What the component renders\n\n## Using the Component\n\n\`\`\`tsx\n<WelcomeMessage name="Alex" />\n\`\`\``,
  };
  return contents[id] || `# ${title}\n\nThis lesson covers key concepts with hands-on examples and exercises.\n\n## Learning Objectives\n\n- Understand the core concept\n- Apply it in real-world scenarios\n- Practice with exercises\n\n## Summary\n\nBy completing this lesson you will have a solid understanding of ${title.toLowerCase()} and how to apply it in your projects.`;
}

app.listen(PORT, () => {
  console.log('\n  ╔═══════════════════════════════════════╗');
  console.log('  ║     🎓 EduFlow LMS Demo Server        ║');
  console.log('  ╠═══════════════════════════════════════╣');
  console.log(`  ║  API:    http://localhost:${PORT}          ║`);
  console.log(`  ║  Health: http://localhost:${PORT}/health   ║`);
  console.log('  ║  Mode:   In-Memory (no DB needed)     ║');
  console.log('  ╚═══════════════════════════════════════╝\n');
});
