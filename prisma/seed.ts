import {
  PrismaClient,
  UserRole,
  UserStatus,
  CourseStatus,
  CourseLevel,
  ExerciseType,
  ClassType,
  ClassStatus,
  EnrollmentStatus,
  AttendanceStatus,
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
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
}

const seedUsers: SeedUser[] = [
  {
    email: 'superadmin@inntexia.com',
    username: 'superadmin',
    password: 'SuperAdmin123!',
    fullName: 'Super Admin',
    role: UserRole.super_admin,
  },
  {
    email: 'staff@inntexia.com',
    username: 'staff',
    password: 'Staff123!',
    fullName: 'Staff Member',
    role: UserRole.staff,
  },
  {
    email: 'instructor@inntexia.com',
    username: 'johninstructor',
    password: 'Instructor123!',
    fullName: 'John Instructor',
    role: UserRole.instructor,
  },
  {
    email: 'instructor2@inntexia.com',
    username: 'sarahteacher',
    password: 'Instructor123!',
    fullName: 'Sarah Teacher',
    role: UserRole.instructor,
  },
  {
    email: 'student@inntexia.com',
    username: 'janestudent',
    password: 'Student123!',
    fullName: 'Jane Student',
    role: UserRole.student,
  },
  {
    email: 'student2@inntexia.com',
    username: 'boblearner',
    password: 'Student123!',
    fullName: 'Bob Learner',
    role: UserRole.student,
  },
  {
    email: 'student3@inntexia.com',
    username: 'alicecoder',
    password: 'Student123!',
    fullName: 'Alice Coder',
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
  // Empty course for CRUD testing
  {
    title: 'Course CRUD Testing',
    slug: 'course-crud-testing',
    description:
      'Empty course for testing Section/Lesson/Exercise CRUD operations via API.',
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
    category: 'Testing',
    level: CourseLevel.beginner,
    language: 'english',
    estimatedDuration: 10,
    status: CourseStatus.draft,
    sections: [], // Empty - for testing add section API
  },
  // Course with various quiz types
  {
    title: 'Quiz Types Demo',
    slug: 'quiz-types-demo',
    description:
      'Course demonstrating all quiz types: MCQ, True/False, Fill Blanks, Match Pairs.',
    coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173',
    category: 'Demo',
    level: CourseLevel.beginner,
    language: 'indonesian',
    estimatedDuration: 15,
    status: CourseStatus.published,
    sections: [
      {
        title: 'Quiz Examples',
        description: 'Various quiz type examples',
        lessons: [
          {
            title: 'Multiple Choice Quiz',
            description: 'Example of multiple choice quiz',
            estimatedDuration: 10,
            exercises: [
              {
                title: 'Quiz: Multiple Choice',
                type: ExerciseType.quiz,
                content: {
                  quizType: 'multiple_choice',
                  questions: [
                    {
                      id: 'mc1',
                      question: 'What is 2 + 2?',
                      options: ['3', '4', '5', '6'],
                      correctAnswer: '4',
                      points: 10,
                    },
                    {
                      id: 'mc2',
                      question: 'Which is a programming language?',
                      options: ['HTML', 'CSS', 'Python', 'JSON'],
                      correctAnswer: 'Python',
                      points: 10,
                    },
                  ],
                  passingScore: 70,
                  maxAttempts: 3,
                },
                estimatedDuration: 5,
              },
            ],
          },
          {
            title: 'True/False Quiz',
            description: 'Example of true/false quiz',
            estimatedDuration: 5,
            exercises: [
              {
                title: 'Quiz: True or False',
                type: ExerciseType.quiz,
                content: {
                  quizType: 'true_false',
                  questions: [
                    {
                      id: 'tf1',
                      question: 'Python is a compiled language.',
                      options: ['True', 'False'],
                      correctAnswer: 'False',
                      points: 10,
                    },
                    {
                      id: 'tf2',
                      question: 'JavaScript runs in the browser.',
                      options: ['True', 'False'],
                      correctAnswer: 'True',
                      points: 10,
                    },
                  ],
                  passingScore: 70,
                },
                estimatedDuration: 3,
              },
            ],
          },
          {
            title: 'Fill in the Blanks',
            description: 'Example of fill in the blanks quiz',
            estimatedDuration: 5,
            exercises: [
              {
                title: 'Quiz: Fill Blanks',
                type: ExerciseType.quiz,
                content: {
                  quizType: 'fill_blanks',
                  questions: [
                    {
                      id: 'fb1',
                      question: 'The function to print in Python is ___.',
                      correctAnswer: 'print',
                      points: 10,
                    },
                    {
                      id: 'fb2',
                      question: 'HTML stands for HyperText ___ Language.',
                      correctAnswer: 'Markup',
                      points: 10,
                    },
                  ],
                  passingScore: 70,
                },
                estimatedDuration: 3,
              },
            ],
          },
          {
            title: 'Match Pairs',
            description: 'Example of match pairs quiz',
            estimatedDuration: 5,
            exercises: [
              {
                title: 'Quiz: Match Pairs',
                type: ExerciseType.quiz,
                content: {
                  quizType: 'match_pairs',
                  questions: [
                    {
                      id: 'mp1',
                      question:
                        'Match the programming language with its creator',
                      correctAnswer: {
                        Python: 'Guido van Rossum',
                        JavaScript: 'Brendan Eich',
                        Java: 'James Gosling',
                      },
                      points: 30,
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
        title: 'Coding Exercises',
        description: 'Example coding exercises',
        lessons: [
          {
            title: 'Python Coding Challenge',
            description: 'Simple Python coding challenge',
            estimatedDuration: 15,
            exercises: [
              {
                title: 'Coding: Sum Function',
                type: ExerciseType.coding,
                content: {
                  instructions:
                    'Create a function `add(a, b)` that returns the sum of two numbers.',
                  starterCode:
                    'def add(a, b):\n    # Write your code here\n    pass\n',
                  testCases: [
                    { input: 'add(1, 2)', expectedOutput: '3', hidden: false },
                    {
                      input: 'add(10, 20)',
                      expectedOutput: '30',
                      hidden: false,
                    },
                    { input: 'add(-5, 5)', expectedOutput: '0', hidden: true },
                  ],
                  language: 'python',
                },
                estimatedDuration: 10,
              },
              {
                title: 'Coding: FizzBuzz',
                type: ExerciseType.coding,
                content: {
                  instructions:
                    'Create a function `fizzbuzz(n)` that returns "Fizz" if n is divisible by 3, "Buzz" if divisible by 5, "FizzBuzz" if both, or the number as string.',
                  starterCode:
                    'def fizzbuzz(n):\n    # Write your code here\n    pass\n',
                  testCases: [
                    {
                      input: 'fizzbuzz(3)',
                      expectedOutput: 'Fizz',
                      hidden: false,
                    },
                    {
                      input: 'fizzbuzz(5)',
                      expectedOutput: 'Buzz',
                      hidden: false,
                    },
                    {
                      input: 'fizzbuzz(15)',
                      expectedOutput: 'FizzBuzz',
                      hidden: false,
                    },
                    { input: 'fizzbuzz(7)', expectedOutput: '7', hidden: true },
                  ],
                  language: 'python',
                },
                estimatedDuration: 15,
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
      // Update username if not set
      if (!existingUser.username) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { username: userData.username },
        });
        console.log(`   🔄 Updated username for ${userData.email}`);
      } else {
        console.log(`   ⏭️  User ${userData.email} already exists`);
      }
      userIdMap.set(userData.email, existingUser.id);
      continue;
    }

    const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
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
// PROGRESS SEEDS
// ============================================================================

async function seedProgressData(userIdMap: Map<string, string>): Promise<void> {
  console.log('\n📊 Seeding student progress...\n');

  // Get student IDs
  const student1Id = userIdMap.get('student@inntexia.com');
  const student2Id = userIdMap.get('student2@inntexia.com');
  const student3Id = userIdMap.get('student3@inntexia.com');

  if (!student1Id || !student2Id || !student3Id) {
    console.log('   ⚠️  Students not found, skipping progress seed');
    return;
  }

  // Get published courses with their lessons and exercises
  const pythonCourse = await prisma.course.findUnique({
    where: { slug: 'python-untuk-pemula' },
    include: {
      sections: {
        include: {
          lessons: {
            include: {
              exercises: true,
            },
          },
        },
      },
    },
  });

  const jsCourse = await prisma.course.findUnique({
    where: { slug: 'web-development-javascript' },
    include: {
      sections: {
        include: {
          lessons: {
            include: {
              exercises: true,
            },
          },
        },
      },
    },
  });

  const quizCourse = await prisma.course.findUnique({
    where: { slug: 'quiz-types-demo' },
    include: {
      sections: {
        include: {
          lessons: {
            include: {
              exercises: true,
            },
          },
        },
      },
    },
  });

  if (!pythonCourse || !jsCourse || !quizCourse) {
    console.log('   ⚠️  Courses not found, skipping progress seed');
    return;
  }

  // Helper to create progress
  const createProgress = async (
    userId: string,
    lessonId: string,
    exerciseIds: string[],
    completedCount: number,
    videoWatched?: number,
    materialScroll?: number,
  ) => {
    // Check if lesson progress already exists
    const existingLessonProgress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    });

    if (!existingLessonProgress) {
      await prisma.lessonProgress.create({
        data: {
          userId,
          lessonId,
          completed: completedCount >= exerciseIds.length,
          exercisesCompleted: completedCount,
          totalExercises: exerciseIds.length,
          completedAt: completedCount >= exerciseIds.length ? new Date() : null,
        },
      });
    }

    // Create exercise progress
    for (let i = 0; i < exerciseIds.length; i++) {
      const exerciseId = exerciseIds[i];
      const isCompleted = i < completedCount;

      const existingExerciseProgress = await prisma.exerciseProgress.findUnique(
        {
          where: {
            userId_exerciseId: {
              userId,
              exerciseId,
            },
          },
        },
      );

      if (!existingExerciseProgress) {
        await prisma.exerciseProgress.create({
          data: {
            userId,
            exerciseId,
            completed: isCompleted,
            watchedSeconds: videoWatched ?? (isCompleted ? 600 : 120),
            scrollDepth: materialScroll ?? (isCompleted ? 100 : 30),
            completedAt: isCompleted ? new Date() : null,
          },
        });
      }
    }
  };

  // Student 1: Completed Python course, started JS course
  console.log('   📈 Creating progress for student@inntexia.com...');

  // Python - all lessons completed
  for (const section of pythonCourse.sections) {
    for (const lesson of section.lessons) {
      const exerciseIds = lesson.exercises.map((e) => e.id);
      await createProgress(
        student1Id,
        lesson.id,
        exerciseIds,
        exerciseIds.length, // All completed
        600,
        100,
      );
    }
  }

  // JS - first section completed, second in progress
  const jsSection1 = jsCourse.sections[0];
  if (jsSection1) {
    for (const lesson of jsSection1.lessons) {
      const exerciseIds = lesson.exercises.map((e) => e.id);
      await createProgress(
        student1Id,
        lesson.id,
        exerciseIds,
        exerciseIds.length,
      );
    }
  }
  const jsSection2 = jsCourse.sections[1];
  if (jsSection2 && jsSection2.lessons[0]) {
    const lesson = jsSection2.lessons[0];
    const exerciseIds = lesson.exercises.map((e) => e.id);
    await createProgress(student1Id, lesson.id, exerciseIds, 1, 400, 50); // Partial
  }

  console.log('      ✅ Python: 100% | JS: ~75%');

  // Student 2: Started Python course, partial progress
  console.log('   📈 Creating progress for student2@inntexia.com...');

  const pythonSection1 = pythonCourse.sections[0];
  if (pythonSection1) {
    // First lesson complete
    const lesson1 = pythonSection1.lessons[0];
    if (lesson1) {
      const exerciseIds = lesson1.exercises.map((e) => e.id);
      await createProgress(
        student2Id,
        lesson1.id,
        exerciseIds,
        exerciseIds.length,
      );
    }
    // Second lesson partial
    const lesson2 = pythonSection1.lessons[1];
    if (lesson2) {
      const exerciseIds = lesson2.exercises.map((e) => e.id);
      await createProgress(student2Id, lesson2.id, exerciseIds, 1, 200, 40);
    }
  }

  console.log('      ✅ Python: ~40%');

  // Student 3: Completed Quiz Types Demo course
  console.log('   📈 Creating progress for student3@inntexia.com...');

  for (const section of quizCourse.sections) {
    for (const lesson of section.lessons) {
      const exerciseIds = lesson.exercises.map((e) => e.id);
      await createProgress(
        student3Id,
        lesson.id,
        exerciseIds,
        exerciseIds.length,
        0, // No video
        100,
      );
    }
  }

  // Also started Python
  if (pythonSection1 && pythonSection1.lessons[0]) {
    const lesson = pythonSection1.lessons[0];
    const exerciseIds = lesson.exercises.map((e) => e.id);
    await createProgress(student3Id, lesson.id, exerciseIds, 1, 300, 60);
  }

  console.log('      ✅ Quiz Demo: 100% | Python: ~15%');
}

// ============================================================================
// CLASS MANAGEMENT SEEDS
// ============================================================================

interface ClassSeedResult {
  classIds: Map<string, string>;
  enrollmentIds: Map<string, string>;
}

async function seedClassManagementData(
  userIdMap: Map<string, string>,
): Promise<ClassSeedResult> {
  console.log('\n🏫 Seeding class management...\n');

  const classIds = new Map<string, string>();
  const enrollmentIds = new Map<string, string>();

  // Get user IDs
  const instructorId = userIdMap.get('instructor@inntexia.com');
  const instructor2Id = userIdMap.get('instructor2@inntexia.com');
  const student1Id = userIdMap.get('student@inntexia.com');
  const student2Id = userIdMap.get('student2@inntexia.com');
  const student3Id = userIdMap.get('student3@inntexia.com');
  const staffId = userIdMap.get('staff@inntexia.com');

  if (
    !instructorId ||
    !instructor2Id ||
    !student1Id ||
    !student2Id ||
    !student3Id ||
    !staffId
  ) {
    console.log('   ⚠️  Required users not found, skipping class seed');
    return { classIds, enrollmentIds };
  }

  // Get courses
  const pythonCourse = await prisma.course.findUnique({
    where: { slug: 'python-untuk-pemula' },
    include: {
      sections: {
        include: {
          lessons: { orderBy: { orderIndex: 'asc' } },
        },
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  const jsCourse = await prisma.course.findUnique({
    where: { slug: 'web-development-javascript' },
    include: {
      sections: {
        include: {
          lessons: { orderBy: { orderIndex: 'asc' } },
        },
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  if (!pythonCourse || !jsCourse) {
    console.log('   ⚠️  Courses not found, skipping class seed');
    return { classIds, enrollmentIds };
  }

  // Get all lessons for courses
  const pythonLessons = pythonCourse.sections.flatMap((s) => s.lessons);
  // Note: JS lessons can be accessed via jsCourse.sections.flatMap((s) => s.lessons) when needed

  // ========== CLASS 1: Python Group Class (Active) ==========
  const existingPythonGroup = await prisma.class.findFirst({
    where: { name: 'Python Batch 1 - Group' },
  });

  if (!existingPythonGroup) {
    const pythonGroupClass = await prisma.class.create({
      data: {
        name: 'Python Batch 1 - Group',
        courseId: pythonCourse.id,
        instructorId: instructorId,
        type: ClassType.group,
        status: ClassStatus.active,
        totalMeetings: 10,
        meetingsCompleted: 4,
        meetingsScheduled: 10,
        lessonsUnlocked: 3,
        maxCapacity: 20,
        currentCapacity: 3,
        schedule: {
          days: ['Monday', 'Wednesday'],
          time: '19:00-21:00',
          timezone: 'Asia/Jakarta',
        },
        startDate: new Date('2025-12-01'),
        endDate: new Date('2026-02-01'),
        enrollmentDeadline: new Date('2025-12-01'),
      },
    });
    classIds.set('python-group', pythonGroupClass.id);
    console.log(`   ✅ Created class: Python Batch 1 - Group (active)`);

    // Enroll students
    const enrollments = [
      { studentId: student1Id, key: 'student1-python-group' },
      { studentId: student2Id, key: 'student2-python-group' },
      { studentId: student3Id, key: 'student3-python-group' },
    ];

    for (const { studentId, key } of enrollments) {
      const enrollment = await prisma.classEnrollment.create({
        data: {
          classId: pythonGroupClass.id,
          studentId,
          meetingCredits: 10,
          creditsUsed: 4,
          status: EnrollmentStatus.active,
        },
      });
      enrollmentIds.set(key, enrollment.id);
    }
    console.log(`      └─ Enrolled 3 students`);

    // Unlock first 3 lessons
    for (let i = 0; i < 3 && i < pythonLessons.length; i++) {
      await prisma.lessonUnlock.create({
        data: {
          classId: pythonGroupClass.id,
          lessonId: pythonLessons[i].id,
          unlockedBy: instructorId,
        },
      });
    }
    console.log(`      └─ Unlocked 3 lessons`);

    // Create attendance records for 4 meetings
    for (let meeting = 1; meeting <= 4; meeting++) {
      const meetingDate = new Date('2025-12-01');
      meetingDate.setDate(meetingDate.getDate() + (meeting - 1) * 3); // Every 3 days

      for (const { key } of enrollments) {
        const enrollmentId = enrollmentIds.get(key);
        if (!enrollmentId) continue;

        // Vary attendance status
        let status: AttendanceStatus;
        if (meeting === 3 && key === 'student2-python-group') {
          status = AttendanceStatus.absent;
        } else if (meeting === 2 && key === 'student3-python-group') {
          status = AttendanceStatus.late;
        } else {
          status = AttendanceStatus.present;
        }

        await prisma.classAttendance.create({
          data: {
            classId: pythonGroupClass.id,
            enrollmentId,
            meetingNumber: meeting,
            meetingDate,
            status,
            creditDeducted: status !== AttendanceStatus.absent,
            markedById: instructorId,
          },
        });
      }
    }
    console.log(`      └─ Created attendance for 4 meetings`);
  } else {
    classIds.set('python-group', existingPythonGroup.id);
    console.log(`   ⏭️  Class "Python Batch 1 - Group" already exists`);
  }

  // ========== CLASS 2: Python Private Class (Active) ==========
  const existingPythonPrivate = await prisma.class.findFirst({
    where: { name: 'Python Private - Jane' },
  });

  if (!existingPythonPrivate) {
    const pythonPrivateClass = await prisma.class.create({
      data: {
        name: 'Python Private - Jane',
        courseId: pythonCourse.id,
        instructorId: instructorId,
        type: ClassType.private,
        status: ClassStatus.active,
        totalMeetings: 20,
        meetingsCompleted: 8,
        meetingsScheduled: 20,
        lessonsUnlocked: 8,
        maxCapacity: 1,
        currentCapacity: 1,
        schedule: {
          days: ['Tuesday', 'Thursday'],
          time: '18:00-19:30',
          timezone: 'Asia/Jakarta',
        },
        startDate: new Date('2025-11-15'),
      },
    });
    classIds.set('python-private', pythonPrivateClass.id);
    console.log(`   ✅ Created class: Python Private - Jane (active)`);

    // Enroll student1
    const enrollment = await prisma.classEnrollment.create({
      data: {
        classId: pythonPrivateClass.id,
        studentId: student1Id,
        meetingCredits: 20,
        creditsUsed: 8,
        status: EnrollmentStatus.active,
      },
    });
    enrollmentIds.set('student1-python-private', enrollment.id);
    console.log(`      └─ Enrolled 1 student (private class)`);

    // Unlock lessons (can unlock more than meetings in private)
    const lessonsToUnlock = Math.min(8, pythonLessons.length);
    for (let i = 0; i < lessonsToUnlock; i++) {
      await prisma.lessonUnlock.create({
        data: {
          classId: pythonPrivateClass.id,
          lessonId: pythonLessons[i].id,
          unlockedBy: instructorId,
        },
      });
    }
    console.log(`      └─ Unlocked ${lessonsToUnlock} lessons`);

    // Attendance for 8 meetings - all present (private class)
    for (let meeting = 1; meeting <= 8; meeting++) {
      const meetingDate = new Date('2025-11-15');
      meetingDate.setDate(meetingDate.getDate() + (meeting - 1) * 3);

      await prisma.classAttendance.create({
        data: {
          classId: pythonPrivateClass.id,
          enrollmentId: enrollment.id,
          meetingNumber: meeting,
          meetingDate,
          status: AttendanceStatus.present,
          creditDeducted: true,
          markedById: instructorId,
        },
      });
    }
    console.log(`      └─ Created attendance for 8 meetings`);

    // Add credit adjustment (bonus credits example)
    await prisma.creditAdjustment.create({
      data: {
        enrollmentId: enrollment.id,
        adjustment: 2,
        creditsBefore: 20,
        creditsAfter: 22,
        reason: 'bonus',
        reasonDetail: 'Early bird bonus - 2 extra meetings',
        adjustedById: staffId,
      },
    });

    // Update enrollment to reflect adjustment
    await prisma.classEnrollment.update({
      where: { id: enrollment.id },
      data: { meetingCredits: 22 },
    });
    console.log(`      └─ Added credit adjustment (+2 bonus)`);
  } else {
    classIds.set('python-private', existingPythonPrivate.id);
    console.log(`   ⏭️  Class "Python Private - Jane" already exists`);
  }

  // ========== CLASS 3: JavaScript Group Class (Enrollment Open) ==========
  const existingJsGroup = await prisma.class.findFirst({
    where: { name: 'JavaScript Batch 1 - Group' },
  });

  if (!existingJsGroup) {
    const jsGroupClass = await prisma.class.create({
      data: {
        name: 'JavaScript Batch 1 - Group',
        courseId: jsCourse.id,
        instructorId: instructor2Id,
        type: ClassType.group,
        status: ClassStatus.enrollment_open,
        totalMeetings: 15,
        meetingsCompleted: 0,
        meetingsScheduled: 15,
        lessonsUnlocked: 0,
        maxCapacity: 15,
        currentCapacity: 2,
        schedule: {
          days: ['Saturday'],
          time: '09:00-12:00',
          timezone: 'Asia/Jakarta',
        },
        startDate: new Date('2026-01-10'),
        enrollmentDeadline: new Date('2026-01-05'),
      },
    });
    classIds.set('js-group', jsGroupClass.id);
    console.log(
      `   ✅ Created class: JavaScript Batch 1 - Group (enrollment_open)`,
    );

    // Enroll 2 students
    for (const [studentId, key] of [
      [student1Id, 'student1-js-group'],
      [student2Id, 'student2-js-group'],
    ] as const) {
      const enrollment = await prisma.classEnrollment.create({
        data: {
          classId: jsGroupClass.id,
          studentId,
          meetingCredits: 15,
          creditsUsed: 0,
          status: EnrollmentStatus.active,
        },
      });
      enrollmentIds.set(key, enrollment.id);
    }
    console.log(`      └─ Enrolled 2 students (waiting for more)`);
  } else {
    classIds.set('js-group', existingJsGroup.id);
    console.log(`   ⏭️  Class "JavaScript Batch 1 - Group" already exists`);
  }

  // ========== CLASS 4: Python Group Class (Completed) ==========
  const existingPythonCompleted = await prisma.class.findFirst({
    where: { name: 'Python Batch 0 - Completed' },
  });

  if (!existingPythonCompleted) {
    const pythonCompletedClass = await prisma.class.create({
      data: {
        name: 'Python Batch 0 - Completed',
        courseId: pythonCourse.id,
        instructorId: instructorId,
        type: ClassType.group,
        status: ClassStatus.completed,
        totalMeetings: 10,
        meetingsCompleted: 10,
        meetingsScheduled: 10,
        lessonsUnlocked: pythonLessons.length,
        maxCapacity: 10,
        currentCapacity: 1,
        schedule: {
          days: ['Monday', 'Wednesday'],
          time: '19:00-21:00',
          timezone: 'Asia/Jakarta',
        },
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-11-30'),
      },
    });
    classIds.set('python-completed', pythonCompletedClass.id);
    console.log(`   ✅ Created class: Python Batch 0 - Completed`);

    // Enroll student2 (completed the course)
    const enrollment = await prisma.classEnrollment.create({
      data: {
        classId: pythonCompletedClass.id,
        studentId: student2Id,
        meetingCredits: 10,
        creditsUsed: 10,
        status: EnrollmentStatus.completed,
        completedAt: new Date('2025-11-30'),
      },
    });
    enrollmentIds.set('student2-python-completed', enrollment.id);
    console.log(`      └─ 1 student completed the class`);

    // Unlock all lessons
    for (const lesson of pythonLessons) {
      await prisma.lessonUnlock.create({
        data: {
          classId: pythonCompletedClass.id,
          lessonId: lesson.id,
          unlockedBy: instructorId,
        },
      });
    }
    console.log(`      └─ All ${pythonLessons.length} lessons unlocked`);
  } else {
    classIds.set('python-completed', existingPythonCompleted.id);
    console.log(`   ⏭️  Class "Python Batch 0 - Completed" already exists`);
  }

  // ========== CLASS 5: Draft Class ==========
  const existingDraftClass = await prisma.class.findFirst({
    where: { name: 'Python Batch 2 - Draft' },
  });

  if (!existingDraftClass) {
    const draftClass = await prisma.class.create({
      data: {
        name: 'Python Batch 2 - Draft',
        courseId: pythonCourse.id,
        instructorId: instructorId,
        type: ClassType.group,
        status: ClassStatus.draft,
        totalMeetings: 10,
        meetingsCompleted: 0,
        meetingsScheduled: 0,
        lessonsUnlocked: 0,
        maxCapacity: 25,
        currentCapacity: 0,
        schedule: {
          days: ['Saturday', 'Sunday'],
          time: '10:00-12:00',
          timezone: 'Asia/Jakarta',
        },
      },
    });
    classIds.set('python-draft', draftClass.id);
    console.log(`   ✅ Created class: Python Batch 2 - Draft`);
  } else {
    classIds.set('python-draft', existingDraftClass.id);
    console.log(`   ⏭️  Class "Python Batch 2 - Draft" already exists`);
  }

  return { classIds, enrollmentIds };
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

  // Seed student progress
  await seedProgressData(userIdMap);

  // Seed class management data
  const { classIds } = await seedClassManagementData(userIdMap);

  console.log('\n' + '═'.repeat(50));
  console.log('\n🎉 Seed completed!\n');

  // Print credentials
  console.log('📋 Test Credentials (login with username or email):');
  console.log('─'.repeat(70));
  console.log(
    '   Role         | Username        | Email                      | Password',
  );
  console.log('─'.repeat(70));
  seedUsers.forEach((u) => {
    console.log(
      `   ${u.role.padEnd(12)} | ${u.username.padEnd(15)} | ${u.email.padEnd(26)} | ${u.password}`,
    );
  });
  console.log('─'.repeat(70));

  // Print courses summary
  console.log('\n📚 Courses Created:');
  console.log('─'.repeat(50));
  seedCourses.forEach((c) => {
    console.log(`   [${c.status.padEnd(9)}] ${c.title}`);
  });
  console.log('─'.repeat(50));

  // Print progress summary
  console.log('\n📊 Student Progress:');
  console.log('─'.repeat(50));
  console.log('   student@inntexia.com  : Python 100%, JS ~75%');
  console.log('   student2@inntexia.com : Python ~40%');
  console.log('   student3@inntexia.com : Quiz Demo 100%, Python ~15%');
  console.log('─'.repeat(50));

  // Print class management summary
  console.log('\n🏫 Classes Created:');
  console.log('─'.repeat(50));
  console.log(
    '   [active     ] Python Batch 1 - Group (3 students, 4/10 meetings)',
  );
  console.log(
    '   [active     ] Python Private - Jane (1 student, 8/20 meetings)',
  );
  console.log(
    '   [enrollment ] JavaScript Batch 1 - Group (2 students enrolled)',
  );
  console.log(
    '   [completed  ] Python Batch 0 - Completed (1 student graduated)',
  );
  console.log('   [draft      ] Python Batch 2 - Draft (not yet opened)');
  console.log('─'.repeat(50));

  // Print class IDs for API testing
  if (classIds.size > 0) {
    console.log('\n🔑 Class IDs for Testing:');
    console.log('─'.repeat(50));
    classIds.forEach((id, name) => {
      console.log(`   ${name.padEnd(20)} : ${id}`);
    });
    console.log('─'.repeat(50));
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
