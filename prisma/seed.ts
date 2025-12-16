import {
  PrismaClient,
  UserRole,
  UserStatus,
  CourseStatus,
  CourseLevel,
  ExerciseType,
  Prisma,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

// ============================================================================
// USER SEEDS
// ============================================================================

interface SeedUser {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

const seedUsers: SeedUser[] = [
  {
    email: 'superadmin@inntexia.com',
    password: 'SuperAdmin123!',
    fullName: 'Super Admin',
    role: UserRole.super_admin,
  },
  {
    email: 'staff@inntexia.com',
    password: 'Staff123!',
    fullName: 'Staff Member',
    role: UserRole.staff,
  },
  {
    email: 'instructor@inntexia.com',
    password: 'Instructor123!',
    fullName: 'John Instructor',
    role: UserRole.instructor,
  },
  {
    email: 'student@inntexia.com',
    password: 'Student123!',
    fullName: 'Jane Student',
    role: UserRole.student,
  },
];

// ============================================================================
// COURSE SEEDS
// ============================================================================

interface SeedExercise {
  title: string;
  type: ExerciseType;
  content: Prisma.InputJsonValue;
  estimatedDuration?: number;
}

interface SeedLesson {
  title: string;
  description?: string;
  estimatedDuration?: number;
  exercises: SeedExercise[];
}

interface SeedSection {
  title: string;
  description?: string;
  lessons: SeedLesson[];
}

interface SeedCourse {
  title: string;
  slug: string;
  description: string;
  coverImage?: string;
  category: string;
  level: CourseLevel;
  language: string;
  estimatedDuration: number;
  status: CourseStatus;
  sections: SeedSection[];
}

const seedCourses: SeedCourse[] = [
  {
    title: 'Python untuk Pemula',
    slug: 'python-untuk-pemula',
    description:
      'Belajar bahasa pemrograman Python dari dasar hingga mahir. Cocok untuk pemula yang baru memulai perjalanan coding.',
    coverImage: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935',
    category: 'Programming',
    level: CourseLevel.beginner,
    language: 'indonesian',
    estimatedDuration: 20,
    status: CourseStatus.published,
    sections: [
      {
        title: 'Pengenalan Python',
        description: 'Memahami dasar-dasar Python dan cara instalasinya',
        lessons: [
          {
            title: 'Apa itu Python?',
            description: 'Pengenalan bahasa pemrograman Python',
            estimatedDuration: 15,
            exercises: [
              {
                title: 'Video: Pengenalan Python',
                type: ExerciseType.video,
                content: {
                  youtubeId: 'kqtD5dpn9C8',
                  duration: 600,
                },
                estimatedDuration: 10,
              },
              {
                title: 'Materi: Sejarah Python',
                type: ExerciseType.material,
                content: {
                  body: '# Sejarah Python\n\nPython dibuat oleh Guido van Rossum...',
                },
                estimatedDuration: 5,
              },
            ],
          },
          {
            title: 'Instalasi Python',
            description: 'Cara menginstall Python di berbagai sistem operasi',
            estimatedDuration: 20,
            exercises: [
              {
                title: 'Video: Instalasi Python',
                type: ExerciseType.video,
                content: {
                  youtubeId: 'YYXdXT2l-Gg',
                  duration: 480,
                },
                estimatedDuration: 8,
              },
              {
                title: 'Quiz: Instalasi Python',
                type: ExerciseType.quiz,
                content: {
                  quizType: 'multiple_choice',
                  questions: [
                    {
                      id: 'q1',
                      question: 'Apa nama interpreter Python?',
                      options: ['python', 'java', 'node', 'ruby'],
                      correctAnswer: 'python',
                      points: 10,
                    },
                  ],
                  passingScore: 70,
                },
                estimatedDuration: 5,
              },
            ],
          },
        ],
      },
      {
        title: 'Variabel dan Tipe Data',
        description: 'Memahami variabel dan berbagai tipe data di Python',
        lessons: [
          {
            title: 'Variabel di Python',
            description: 'Cara membuat dan menggunakan variabel',
            estimatedDuration: 25,
            exercises: [
              {
                title: 'Video: Variabel Python',
                type: ExerciseType.video,
                content: {
                  youtubeId: 'cQT33yu9pY8',
                  duration: 720,
                },
                estimatedDuration: 12,
              },
              {
                title: 'Coding: Hello Variable',
                type: ExerciseType.coding,
                content: {
                  instructions:
                    'Buat variabel `nama` dengan nilai nama kamu dan print hasilnya',
                  starterCode: '# Tulis kode kamu di sini\n',
                  testCases: [
                    {
                      input: '',
                      expectedOutput: 'nama',
                      hidden: false,
                    },
                  ],
                  language: 'python',
                },
                estimatedDuration: 10,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Web Development dengan JavaScript',
    slug: 'web-development-javascript',
    description:
      'Pelajari cara membuat website interaktif dengan JavaScript. Dari DOM manipulation hingga modern ES6+.',
    coverImage: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479',
    category: 'Web Development',
    level: CourseLevel.intermediate,
    language: 'indonesian',
    estimatedDuration: 30,
    status: CourseStatus.published,
    sections: [
      {
        title: 'JavaScript Fundamentals',
        description: 'Dasar-dasar JavaScript yang wajib dikuasai',
        lessons: [
          {
            title: 'Pengenalan JavaScript',
            description:
              'Apa itu JavaScript dan perannya dalam web development',
            estimatedDuration: 20,
            exercises: [
              {
                title: 'Video: Intro to JavaScript',
                type: ExerciseType.video,
                content: {
                  youtubeId: 'W6NZfCO5SIk',
                  duration: 900,
                },
                estimatedDuration: 15,
              },
              {
                title: 'Materi: JavaScript di Browser',
                type: ExerciseType.material,
                content: {
                  body: '# JavaScript di Browser\n\nJavaScript berjalan di browser...',
                },
                estimatedDuration: 5,
              },
            ],
          },
        ],
      },
      {
        title: 'DOM Manipulation',
        description: 'Memanipulasi elemen HTML dengan JavaScript',
        lessons: [
          {
            title: 'Selecting Elements',
            description: 'Cara memilih elemen HTML dengan JavaScript',
            estimatedDuration: 30,
            exercises: [
              {
                title: 'Video: DOM Selectors',
                type: ExerciseType.video,
                content: {
                  youtubeId: '0ik6X4DJKCc',
                  duration: 1200,
                },
                estimatedDuration: 20,
              },
              {
                title: 'Quiz: DOM Methods',
                type: ExerciseType.quiz,
                content: {
                  quizType: 'multiple_choice',
                  questions: [
                    {
                      id: 'q1',
                      question:
                        'Method untuk memilih element berdasarkan ID adalah?',
                      options: [
                        'getElementById',
                        'querySelector',
                        'getElement',
                        'findById',
                      ],
                      correctAnswer: 'getElementById',
                      points: 10,
                    },
                  ],
                  passingScore: 70,
                },
                estimatedDuration: 5,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Data Science dengan Python',
    slug: 'data-science-python',
    description:
      'Kuasai data science menggunakan Python. Pandas, NumPy, dan visualisasi data.',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
    category: 'Data Science',
    level: CourseLevel.advanced,
    language: 'indonesian',
    estimatedDuration: 40,
    status: CourseStatus.draft,
    sections: [
      {
        title: 'Pengenalan Data Science',
        description: 'Apa itu data science dan mengapa penting',
        lessons: [
          {
            title: 'Apa itu Data Science?',
            description: 'Pengenalan dunia data science',
            estimatedDuration: 20,
            exercises: [
              {
                title: 'Video: Intro to Data Science',
                type: ExerciseType.video,
                content: {
                  youtubeId: 'X3paOmcrTjQ',
                  duration: 840,
                },
                estimatedDuration: 14,
              },
            ],
          },
        ],
      },
    ],
  },
];

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function seedUsersData(): Promise<Map<string, string>> {
  console.log('👤 Seeding users...\n');
  const userIdMap = new Map<string, string>();

  for (const userData of seedUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      console.log(`   ⏭️  User ${userData.email} already exists`);
      userIdMap.set(userData.email, existingUser.id);
      continue;
    }

    const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash,
        fullName: userData.fullName,
        role: userData.role,
        status: UserStatus.active,
        emailVerified: true,
        onboardingCompleted: true,
      },
    });

    userIdMap.set(userData.email, user.id);
    console.log(`   ✅ Created ${userData.role}: ${user.email}`);
  }

  return userIdMap;
}

async function seedCoursesData(instructorId: string): Promise<void> {
  console.log('\n📚 Seeding courses...\n');

  for (const courseData of seedCourses) {
    const existingCourse = await prisma.course.findUnique({
      where: { slug: courseData.slug },
    });

    if (existingCourse) {
      console.log(`   ⏭️  Course "${courseData.title}" already exists`);
      continue;
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        slug: courseData.slug,
        description: courseData.description,
        coverImage: courseData.coverImage,
        category: courseData.category,
        level: courseData.level,
        language: courseData.language,
        estimatedDuration: courseData.estimatedDuration,
        status: courseData.status,
        createdById: instructorId,
        publishedAt:
          courseData.status === CourseStatus.published ? new Date() : null,
      },
    });

    // Create sections
    for (let sIdx = 0; sIdx < courseData.sections.length; sIdx++) {
      const sectionData = courseData.sections[sIdx];

      const section = await prisma.section.create({
        data: {
          courseId: course.id,
          title: sectionData.title,
          description: sectionData.description,
          orderIndex: sIdx,
        },
      });

      // Create lessons
      for (let lIdx = 0; lIdx < sectionData.lessons.length; lIdx++) {
        const lessonData = sectionData.lessons[lIdx];

        const lesson = await prisma.lesson.create({
          data: {
            sectionId: section.id,
            title: lessonData.title,
            description: lessonData.description,
            orderIndex: lIdx,
            estimatedDuration: lessonData.estimatedDuration,
            status: 'published',
          },
        });

        // Create exercises
        for (let eIdx = 0; eIdx < lessonData.exercises.length; eIdx++) {
          const exerciseData = lessonData.exercises[eIdx];

          await prisma.exercise.create({
            data: {
              lessonId: lesson.id,
              title: exerciseData.title,
              type: exerciseData.type,
              content: exerciseData.content,
              orderIndex: eIdx,
              estimatedDuration: exerciseData.estimatedDuration,
            },
          });
        }
      }
    }

    console.log(
      `   ✅ Created course: "${courseData.title}" (${courseData.status})`,
    );
    console.log(
      `      └─ ${courseData.sections.length} sections, ${courseData.sections.reduce((acc, s) => acc + s.lessons.length, 0)} lessons`,
    );
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🌱 Seeding database...\n');
  console.log('═'.repeat(50));

  // Seed users
  const userIdMap = await seedUsersData();

  // Get instructor ID for courses
  const instructorId = userIdMap.get('instructor@inntexia.com');
  if (!instructorId) {
    throw new Error('Instructor user not found');
  }

  // Seed courses
  await seedCoursesData(instructorId);

  console.log('\n' + '═'.repeat(50));
  console.log('\n🎉 Seed completed!\n');

  // Print credentials
  console.log('📋 Test Credentials:');
  console.log('─'.repeat(50));
  seedUsers.forEach((u) => {
    console.log(`   ${u.role.padEnd(12)} | ${u.email} | ${u.password}`);
  });
  console.log('─'.repeat(50));

  // Print courses summary
  console.log('\n📚 Courses Created:');
  console.log('─'.repeat(50));
  seedCourses.forEach((c) => {
    console.log(`   [${c.status.padEnd(9)}] ${c.title}`);
  });
  console.log('─'.repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
