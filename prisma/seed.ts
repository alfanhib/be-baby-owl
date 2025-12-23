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
  PaymentStatus,
  BadgeRarity,
  SubmissionStatus,
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
  {
    email: 'student4@inntexia.com',
    username: 'davidweb',
    password: 'Student123!',
    fullName: 'David Webdev',
    role: UserRole.student,
  },
  {
    email: 'student5@inntexia.com',
    username: 'emmacode',
    password: 'Student123!',
    fullName: 'Emma Programmer',
    role: UserRole.student,
  },
  {
    email: 'student6@inntexia.com',
    username: 'frankdev',
    password: 'Student123!',
    fullName: 'Frank Developer',
    role: UserRole.student,
  },
  {
    email: 'student7@inntexia.com',
    username: 'gracetech',
    password: 'Student123!',
    fullName: 'Grace Techie',
    role: UserRole.student,
  },
  {
    email: 'student8@inntexia.com',
    username: 'henrylearn',
    password: 'Student123!',
    fullName: 'Henry Learner',
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
  // React.js Development - Complete Course
  {
    title: 'React.js Development',
    slug: 'reactjs-development',
    description:
      'Kuasai React.js dari dasar hingga advanced. Belajar komponen, hooks, state management, dan deploy aplikasi React.',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
    category: 'Web Development',
    level: CourseLevel.intermediate,
    language: 'indonesian',
    estimatedDuration: 35,
    status: CourseStatus.published,
    sections: [
      {
        title: 'Pengenalan React',
        description: 'Memahami konsep dasar React dan ekosistemnya',
        lessons: [
          {
            title: 'Apa itu React.js?',
            description: 'Pengenalan library React dan keunggulannya',
            estimatedDuration: 20,
            exercises: [
              {
                title: 'Video: Pengenalan React',
                type: ExerciseType.video,
                content: {
                  youtubeId: 'w7ejDZ8SWv8',
                  duration: 720,
                },
                estimatedDuration: 12,
              },
              {
                title: 'Materi: Sejarah dan Filosofi React',
                type: ExerciseType.material,
                content: {
                  body: '# Sejarah React\n\nReact dikembangkan oleh Facebook pada tahun 2011 dan dirilis ke publik pada tahun 2013.\n\n## Filosofi React\n\n1. **Declarative**: Kamu mendeskripsikan UI yang kamu inginkan, React yang akan handle update.\n2. **Component-Based**: Membangun UI dari komponen-komponen kecil yang reusable.\n3. **Learn Once, Write Anywhere**: Skill React bisa digunakan untuk web, mobile (React Native), dan lainnya.',
                },
                estimatedDuration: 8,
              },
            ],
          },
          {
            title: 'Setup Development Environment',
            description: 'Menyiapkan lingkungan pengembangan React',
            estimatedDuration: 25,
            exercises: [
              {
                title: 'Video: Setup Project dengan Vite',
                type: ExerciseType.video,
                content: {
                  youtubeId: 'SWYqp7iY_Tc',
                  duration: 900,
                },
                estimatedDuration: 15,
              },
              {
                title: 'Quiz: React Setup',
                type: ExerciseType.quiz,
                content: {
                  quizType: 'multiple_choice',
                  questions: [
                    {
                      id: 'q1',
                      question:
                        'Tool apa yang direkomendasikan untuk membuat project React?',
                      options: [
                        'Create React App',
                        'Vite',
                        'Webpack manual',
                        'Parcel',
                      ],
                      correctAnswer: 'Vite',
                      points: 10,
                    },
                    {
                      id: 'q2',
                      question:
                        'Ekstensi file untuk komponen React dengan JSX adalah?',
                      options: ['.js atau .jsx', '.ts saja', '.html', '.react'],
                      correctAnswer: '.js atau .jsx',
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
        title: 'Komponen dan Props',
        description: 'Belajar membuat komponen dan passing data dengan props',
        lessons: [
          {
            title: 'Functional Components',
            description: 'Membuat komponen dengan function',
            estimatedDuration: 30,
            exercises: [
              {
                title: 'Video: Membuat Functional Component',
                type: ExerciseType.video,
                content: {
                  youtubeId: 'Y6aYx_KKM7A',
                  duration: 1080,
                },
                estimatedDuration: 18,
              },
              {
                title: 'Coding: Buat Komponen Greeting',
                type: ExerciseType.coding,
                content: {
                  instructions:
                    'Buat komponen `Greeting` yang menerima prop `name` dan menampilkan "Hello, {name}!"',
                  starterCode:
                    '// Buat komponen Greeting di sini\n\nfunction Greeting(props) {\n  // Tulis kode kamu\n}\n\nexport default Greeting;',
                  testCases: [
                    {
                      input: '<Greeting name="John" />',
                      expectedOutput: 'Hello, John!',
                      hidden: false,
                    },
                    {
                      input: '<Greeting name="Alice" />',
                      expectedOutput: 'Hello, Alice!',
                      hidden: true,
                    },
                  ],
                  language: 'javascript',
                },
                estimatedDuration: 10,
              },
            ],
          },
          {
            title: 'Props dan PropTypes',
            description: 'Passing data antar komponen dan validasi props',
            estimatedDuration: 25,
            exercises: [
              {
                title: 'Materi: Memahami Props',
                type: ExerciseType.material,
                content: {
                  body: '# Props di React\n\nProps adalah cara untuk passing data dari parent ke child component.\n\n```jsx\n// Parent component\n<UserCard name="John" age={25} isActive={true} />\n\n// Child component\nfunction UserCard({ name, age, isActive }) {\n  return (\n    <div>\n      <h2>{name}</h2>\n      <p>Age: {age}</p>\n      <p>Status: {isActive ? "Active" : "Inactive"}</p>\n    </div>\n  );\n}\n```\n\n## PropTypes\n\nGunakan PropTypes untuk validasi tipe props:\n\n```jsx\nimport PropTypes from "prop-types";\n\nUserCard.propTypes = {\n  name: PropTypes.string.isRequired,\n  age: PropTypes.number,\n  isActive: PropTypes.bool\n};\n```',
                },
                estimatedDuration: 15,
              },
              {
                title: 'Quiz: Props',
                type: ExerciseType.quiz,
                content: {
                  quizType: 'fill_blanks',
                  questions: [
                    {
                      id: 'fb1',
                      question:
                        'Untuk destructuring props dalam function parameter, kita gunakan tanda ___.',
                      correctAnswer: '{}',
                      points: 10,
                    },
                    {
                      id: 'fb2',
                      question:
                        'Props di React bersifat ___ (tidak bisa diubah oleh child).',
                      correctAnswer: 'immutable',
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
        title: 'State dan Hooks',
        description: 'Mengelola state dengan React Hooks',
        lessons: [
          {
            title: 'useState Hook',
            description: 'Mengelola local state dengan useState',
            estimatedDuration: 35,
            exercises: [
              {
                title: 'Video: useState Hook Deep Dive',
                type: ExerciseType.video,
                content: {
                  youtubeId: 'O6P86uwfdR0',
                  duration: 1200,
                },
                estimatedDuration: 20,
              },
              {
                title: 'Coding: Counter Component',
                type: ExerciseType.coding,
                content: {
                  instructions:
                    'Buat komponen `Counter` dengan button increment (+1), decrement (-1), dan reset (ke 0).',
                  starterCode:
                    'import { useState } from "react";\n\nfunction Counter() {\n  // Tulis kode kamu di sini\n  \n  return (\n    <div>\n      {/* Tampilkan count dan buttons */}\n    </div>\n  );\n}\n\nexport default Counter;',
                  testCases: [
                    {
                      input: 'increment 3x',
                      expectedOutput: '3',
                      hidden: false,
                    },
                    {
                      input: 'decrement 2x from 3',
                      expectedOutput: '1',
                      hidden: false,
                    },
                    { input: 'reset', expectedOutput: '0', hidden: true },
                  ],
                  language: 'javascript',
                },
                estimatedDuration: 15,
              },
            ],
          },
          {
            title: 'useEffect Hook',
            description: 'Handling side effects dengan useEffect',
            estimatedDuration: 40,
            exercises: [
              {
                title: 'Video: useEffect Explained',
                type: ExerciseType.video,
                content: {
                  youtubeId: '0ZJgIjIuY7U',
                  duration: 1500,
                },
                estimatedDuration: 25,
              },
              {
                title: 'Materi: useEffect Patterns',
                type: ExerciseType.material,
                content: {
                  body: '# useEffect Patterns\n\n## 1. Run on Every Render\n```jsx\nuseEffect(() => {\n  console.log("Runs on every render");\n});\n```\n\n## 2. Run Once (on Mount)\n```jsx\nuseEffect(() => {\n  console.log("Runs only once");\n}, []);\n```\n\n## 3. Run When Dependency Changes\n```jsx\nuseEffect(() => {\n  console.log("count changed:", count);\n}, [count]);\n```\n\n## 4. Cleanup Function\n```jsx\nuseEffect(() => {\n  const timer = setInterval(() => {}, 1000);\n  \n  return () => {\n    clearInterval(timer); // Cleanup\n  };\n}, []);\n```',
                },
                estimatedDuration: 10,
              },
              {
                title: 'Quiz: useEffect',
                type: ExerciseType.quiz,
                content: {
                  quizType: 'multiple_choice',
                  questions: [
                    {
                      id: 'q1',
                      question:
                        'Kapan useEffect dengan dependency array kosong [] dijalankan?',
                      options: [
                        'Setiap render',
                        'Hanya saat mount',
                        'Hanya saat unmount',
                        'Tidak pernah',
                      ],
                      correctAnswer: 'Hanya saat mount',
                      points: 10,
                    },
                    {
                      id: 'q2',
                      question: 'Apa fungsi return dalam useEffect?',
                      options: [
                        'Return value',
                        'Cleanup function',
                        'Error handler',
                        'Conditional render',
                      ],
                      correctAnswer: 'Cleanup function',
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
        title: 'Project: Todo App',
        description: 'Membangun aplikasi Todo lengkap dengan React',
        lessons: [
          {
            title: 'Todo App - Setup & UI',
            description: 'Membuat struktur project dan UI komponen',
            estimatedDuration: 45,
            exercises: [
              {
                title: 'Video: Building Todo App Part 1',
                type: ExerciseType.video,
                content: {
                  youtubeId: 'pCA4qpQDZD8',
                  duration: 1800,
                },
                estimatedDuration: 30,
              },
              {
                title: 'Assignment: Todo App Part 1',
                type: ExerciseType.assignment,
                content: {
                  instructions:
                    'Buat komponen TodoList dan TodoItem. Submit screenshot atau link repository.',
                  requirements: [
                    'Komponen TodoList yang menampilkan daftar todo',
                    'Komponen TodoItem untuk setiap item todo',
                    'Styling dasar dengan CSS',
                  ],
                  maxSubmissions: 3,
                  allowedFileTypes: ['image/png', 'image/jpeg', 'text/plain'],
                },
                estimatedDuration: 30,
              },
            ],
          },
          {
            title: 'Todo App - CRUD Operations',
            description: 'Implementasi Create, Read, Update, Delete',
            estimatedDuration: 50,
            exercises: [
              {
                title: 'Video: Building Todo App Part 2',
                type: ExerciseType.video,
                content: {
                  youtubeId: 'Rh3tobg7hEo',
                  duration: 2100,
                },
                estimatedDuration: 35,
              },
              {
                title: 'Coding: Delete Todo Function',
                type: ExerciseType.coding,
                content: {
                  instructions:
                    'Implementasikan fungsi `deleteTodo` yang menghapus todo berdasarkan id.',
                  starterCode:
                    'const [todos, setTodos] = useState([\n  { id: 1, text: "Learn React", completed: false },\n  { id: 2, text: "Build Todo App", completed: false }\n]);\n\nfunction deleteTodo(id) {\n  // Implementasi hapus todo\n}\n',
                  testCases: [
                    {
                      input: 'deleteTodo(1)',
                      expectedOutput: 'todos.length === 1',
                      hidden: false,
                    },
                    {
                      input: 'deleteTodo(2)',
                      expectedOutput: 'todos.length === 0',
                      hidden: true,
                    },
                  ],
                  language: 'javascript',
                },
                estimatedDuration: 15,
              },
            ],
          },
        ],
      },
    ],
  },
  // UI/UX Design Fundamentals
  {
    title: 'UI/UX Design Fundamentals',
    slug: 'ui-ux-design-fundamentals',
    description:
      'Pelajari prinsip-prinsip desain UI/UX yang baik. Dari wireframing hingga prototyping dengan Figma.',
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5',
    category: 'Design',
    level: CourseLevel.beginner,
    language: 'indonesian',
    estimatedDuration: 25,
    status: CourseStatus.published,
    sections: [
      {
        title: 'Pengenalan UI/UX',
        description: 'Memahami perbedaan UI dan UX serta pentingnya desain',
        lessons: [
          {
            title: 'UI vs UX: Apa Bedanya?',
            description:
              'Memahami perbedaan antara User Interface dan User Experience',
            estimatedDuration: 20,
            exercises: [
              {
                title: 'Materi: Definisi UI dan UX',
                type: ExerciseType.material,
                content: {
                  body: '# UI vs UX\n\n## User Interface (UI)\nUI adalah **tampilan visual** dari sebuah produk digital. Ini mencakup:\n- Warna dan typography\n- Buttons dan icons\n- Layout dan spacing\n- Animasi dan transisi\n\n## User Experience (UX)\nUX adalah **keseluruhan pengalaman** pengguna saat berinteraksi dengan produk. Ini mencakup:\n- Ease of use\n- Accessibility\n- User journey\n- Problem solving\n\n## Analogi Sederhana\n🏠 Jika UI adalah **cat dan dekorasi rumah**, maka UX adalah **tata letak ruangan dan bagaimana mudahnya hidup di rumah tersebut**.',
                },
                estimatedDuration: 10,
              },
              {
                title: 'Quiz: UI vs UX',
                type: ExerciseType.quiz,
                content: {
                  quizType: 'true_false',
                  questions: [
                    {
                      id: 'tf1',
                      question: 'UI Design hanya fokus pada tampilan visual.',
                      options: ['True', 'False'],
                      correctAnswer: 'True',
                      points: 10,
                    },
                    {
                      id: 'tf2',
                      question:
                        'UX Designer tidak perlu memahami psikologi pengguna.',
                      options: ['True', 'False'],
                      correctAnswer: 'False',
                      points: 10,
                    },
                    {
                      id: 'tf3',
                      question:
                        'Produk dengan UI bagus pasti memiliki UX yang baik.',
                      options: ['True', 'False'],
                      correctAnswer: 'False',
                      points: 10,
                    },
                  ],
                  passingScore: 70,
                },
                estimatedDuration: 5,
              },
            ],
          },
          {
            title: 'Design Thinking Process',
            description: 'Mengenal metodologi Design Thinking',
            estimatedDuration: 30,
            exercises: [
              {
                title: 'Video: 5 Tahap Design Thinking',
                type: ExerciseType.video,
                content: {
                  youtubeId: '_r0VX-aU_T8',
                  duration: 1200,
                },
                estimatedDuration: 20,
              },
              {
                title: 'Quiz: Design Thinking',
                type: ExerciseType.quiz,
                content: {
                  quizType: 'match_pairs',
                  questions: [
                    {
                      id: 'mp1',
                      question:
                        'Cocokkan tahap Design Thinking dengan aktivitasnya',
                      correctAnswer: {
                        Empathize: 'Memahami kebutuhan pengguna',
                        Define: 'Merumuskan masalah',
                        Ideate: 'Brainstorming solusi',
                        Prototype: 'Membuat model awal',
                        Test: 'Mengujikan ke pengguna',
                      },
                      points: 50,
                    },
                  ],
                  passingScore: 70,
                },
                estimatedDuration: 10,
              },
            ],
          },
        ],
      },
      {
        title: 'Prinsip Desain Visual',
        description: 'Belajar prinsip-prinsip fundamental desain visual',
        lessons: [
          {
            title: 'Color Theory',
            description: 'Memahami teori warna dan penggunaannya',
            estimatedDuration: 25,
            exercises: [
              {
                title: 'Materi: Color Theory Basics',
                type: ExerciseType.material,
                content: {
                  body: '# Teori Warna\n\n## Color Wheel\n- **Primary Colors**: Merah, Kuning, Biru\n- **Secondary Colors**: Oranye, Hijau, Ungu\n- **Tertiary Colors**: Kombinasi primary dan secondary\n\n## Color Schemes\n1. **Complementary**: Warna berlawanan (merah-hijau)\n2. **Analogous**: Warna berdekatan (biru-hijau-cyan)\n3. **Triadic**: 3 warna seimbang (merah-kuning-biru)\n\n## Color Psychology\n- 🔴 **Merah**: Energi, urgency, passion\n- 🔵 **Biru**: Trust, calm, professional\n- 🟢 **Hijau**: Nature, growth, health\n- 🟡 **Kuning**: Optimism, attention, warmth\n- 🟣 **Ungu**: Luxury, creativity, mystery',
                },
                estimatedDuration: 15,
              },
              {
                title: 'Quiz: Color Theory',
                type: ExerciseType.quiz,
                content: {
                  quizType: 'multiple_choice',
                  questions: [
                    {
                      id: 'q1',
                      question:
                        'Warna apa yang sering digunakan untuk tombol CTA karena menarik perhatian?',
                      options: ['Biru', 'Abu-abu', 'Merah/Oranye', 'Hitam'],
                      correctAnswer: 'Merah/Oranye',
                      points: 10,
                    },
                    {
                      id: 'q2',
                      question: 'Complementary color dari biru adalah?',
                      options: ['Hijau', 'Ungu', 'Oranye', 'Merah'],
                      correctAnswer: 'Oranye',
                      points: 10,
                    },
                  ],
                  passingScore: 70,
                },
                estimatedDuration: 5,
              },
            ],
          },
          {
            title: 'Typography',
            description: 'Seni memilih dan menggunakan font',
            estimatedDuration: 20,
            exercises: [
              {
                title: 'Video: Typography Fundamentals',
                type: ExerciseType.video,
                content: {
                  youtubeId: 'sByzHoiYFX0',
                  duration: 900,
                },
                estimatedDuration: 15,
              },
              {
                title: 'Quiz: Typography',
                type: ExerciseType.quiz,
                content: {
                  quizType: 'fill_blanks',
                  questions: [
                    {
                      id: 'fb1',
                      question:
                        'Font sans-serif cocok untuk konten ___ karena lebih mudah dibaca.',
                      correctAnswer: 'digital',
                      points: 10,
                    },
                    {
                      id: 'fb2',
                      question: 'Jarak antar baris teks disebut ___.',
                      correctAnswer: 'line-height',
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
        title: 'Figma Basics',
        description: 'Belajar menggunakan Figma untuk desain UI',
        lessons: [
          {
            title: 'Mengenal Interface Figma',
            description: 'Tour interface dan tools dasar Figma',
            estimatedDuration: 30,
            exercises: [
              {
                title: 'Video: Figma Interface Tour',
                type: ExerciseType.video,
                content: {
                  youtubeId: 'FTFaQWZBqQ8',
                  duration: 1500,
                },
                estimatedDuration: 25,
              },
              {
                title: 'Assignment: Buat Akun Figma',
                type: ExerciseType.assignment,
                content: {
                  instructions:
                    'Buat akun Figma gratis dan screenshot halaman dashboard kamu.',
                  requirements: [
                    'Daftar di figma.com',
                    'Buat project baru',
                    'Screenshot dashboard',
                  ],
                  maxSubmissions: 1,
                  allowedFileTypes: ['image/png', 'image/jpeg'],
                },
                estimatedDuration: 10,
              },
            ],
          },
          {
            title: 'Membuat Wireframe',
            description: 'Membuat wireframe sederhana dengan Figma',
            estimatedDuration: 40,
            exercises: [
              {
                title: 'Video: Wireframing di Figma',
                type: ExerciseType.video,
                content: {
                  youtubeId: 'D4NyQ5iOMF0',
                  duration: 1800,
                },
                estimatedDuration: 30,
              },
              {
                title: 'Assignment: Wireframe Mobile App',
                type: ExerciseType.assignment,
                content: {
                  instructions:
                    'Buat wireframe untuk 3 screen mobile app: Home, Detail, dan Profile.',
                  requirements: [
                    'Gunakan frame iPhone 14',
                    'Minimal 3 screen',
                    'Gunakan shapes dan text',
                    'Export sebagai PNG atau share link Figma',
                  ],
                  maxSubmissions: 3,
                  allowedFileTypes: ['image/png', 'text/plain'],
                },
                estimatedDuration: 45,
              },
            ],
          },
        ],
      },
    ],
  },
  // English for Professionals
  {
    title: 'English for Professionals',
    slug: 'english-for-professionals',
    description:
      'Tingkatkan kemampuan bahasa Inggris untuk karir profesional. Business English, email writing, dan presentation skills.',
    coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173',
    category: 'Language',
    level: CourseLevel.intermediate,
    language: 'english',
    estimatedDuration: 30,
    status: CourseStatus.published,
    sections: [
      {
        title: 'Business Email Writing',
        description: 'Menulis email profesional dalam bahasa Inggris',
        lessons: [
          {
            title: 'Email Structure & Etiquette',
            description: 'Struktur email profesional yang baik',
            estimatedDuration: 25,
            exercises: [
              {
                title: 'Materi: Email Structure',
                type: ExerciseType.material,
                content: {
                  body: '# Professional Email Structure\n\n## 1. Subject Line\n- Be specific and concise\n- ✅ "Meeting Request: Q4 Budget Review - Dec 15"\n- ❌ "Meeting"\n\n## 2. Greeting\n- Formal: "Dear Mr./Ms. [Last Name],"\n- Semi-formal: "Hello [First Name],"\n- Internal: "Hi [Name],"\n\n## 3. Opening Line\n- "I hope this email finds you well."\n- "Thank you for your email regarding..."\n- "I am writing to inquire about..."\n\n## 4. Body\n- Keep paragraphs short (2-3 sentences)\n- Use bullet points for lists\n- One topic per email\n\n## 5. Closing\n- "Please let me know if you have any questions."\n- "I look forward to hearing from you."\n\n## 6. Sign-off\n- Formal: "Best regards," / "Sincerely,"\n- Semi-formal: "Kind regards," / "Best,"',
                },
                estimatedDuration: 15,
              },
              {
                title: 'Quiz: Email Etiquette',
                type: ExerciseType.quiz,
                content: {
                  quizType: 'multiple_choice',
                  questions: [
                    {
                      id: 'q1',
                      question: 'Which subject line is most professional?',
                      options: [
                        'URGENT!!!',
                        'Question about project',
                        'Request for Feedback: Marketing Proposal Draft',
                        'hey',
                      ],
                      correctAnswer:
                        'Request for Feedback: Marketing Proposal Draft',
                      points: 10,
                    },
                    {
                      id: 'q2',
                      question: 'When should you use "Dear Sir/Madam"?',
                      options: [
                        'When you know the person well',
                        "When you don't know the recipient's name",
                        'Never in business emails',
                        'For internal emails only',
                      ],
                      correctAnswer: "When you don't know the recipient's name",
                      points: 10,
                    },
                  ],
                  passingScore: 70,
                },
                estimatedDuration: 5,
              },
            ],
          },
          {
            title: 'Common Email Scenarios',
            description: 'Templates untuk berbagai situasi email',
            estimatedDuration: 30,
            exercises: [
              {
                title: 'Video: Writing Different Types of Emails',
                type: ExerciseType.video,
                content: {
                  youtubeId: 'SBmLzgm5rZE',
                  duration: 1200,
                },
                estimatedDuration: 20,
              },
              {
                title: 'Assignment: Write a Request Email',
                type: ExerciseType.assignment,
                content: {
                  instructions:
                    'Write a professional email requesting a meeting with your manager to discuss your Q4 performance review. Include all proper email components.',
                  requirements: [
                    'Clear subject line',
                    'Professional greeting',
                    'Purpose of the meeting',
                    'Proposed time slots',
                    'Professional closing',
                  ],
                  maxSubmissions: 2,
                  allowedFileTypes: ['text/plain', 'application/pdf'],
                },
                estimatedDuration: 20,
              },
            ],
          },
        ],
      },
      {
        title: 'Presentation Skills',
        description: 'Memberikan presentasi profesional dalam bahasa Inggris',
        lessons: [
          {
            title: 'Opening & Closing a Presentation',
            description: 'Teknik membuka dan menutup presentasi dengan kuat',
            estimatedDuration: 25,
            exercises: [
              {
                title: 'Video: Powerful Openings',
                type: ExerciseType.video,
                content: {
                  youtubeId: 'MnIPpUiTcRc',
                  duration: 900,
                },
                estimatedDuration: 15,
              },
              {
                title: 'Materi: Opening Techniques',
                type: ExerciseType.material,
                content: {
                  body: '# Powerful Presentation Openings\n\n## 1. Start with a Question\n"Have you ever wondered why...?"\n\n## 2. Share a Surprising Statistic\n"Did you know that 70% of...?"\n\n## 3. Tell a Story\n"Last month, one of our customers..."\n\n## 4. Use a Quote\n"As Steve Jobs once said..."\n\n## 5. State a Bold Claim\n"By the end of this presentation, you\'ll be able to..."\n\n---\n\n# Strong Closings\n\n## 1. Summarize Key Points\n"To recap, we\'ve covered three main areas..."\n\n## 2. Call to Action\n"I encourage you to implement these strategies starting tomorrow."\n\n## 3. End with Impact\n"Remember, the future belongs to those who prepare for it today."',
                },
                estimatedDuration: 10,
              },
            ],
          },
          {
            title: 'Handling Q&A Sessions',
            description: 'Teknik menjawab pertanyaan dengan percaya diri',
            estimatedDuration: 20,
            exercises: [
              {
                title: 'Video: Q&A Best Practices',
                type: ExerciseType.video,
                content: {
                  youtubeId: 'JGI85nE5Ngw',
                  duration: 720,
                },
                estimatedDuration: 12,
              },
              {
                title: 'Quiz: Q&A Responses',
                type: ExerciseType.quiz,
                content: {
                  quizType: 'multiple_choice',
                  questions: [
                    {
                      id: 'q1',
                      question:
                        "What should you do if you don't know the answer to a question?",
                      options: [
                        'Make up an answer',
                        'Say "I don\'t know" and move on',
                        'Acknowledge it and offer to follow up later',
                        'Ignore the question',
                      ],
                      correctAnswer:
                        'Acknowledge it and offer to follow up later',
                      points: 10,
                    },
                    {
                      id: 'q2',
                      question:
                        'A good technique before answering a difficult question is to:',
                      options: [
                        'Answer immediately',
                        'Paraphrase the question to ensure understanding',
                        'Ask the audience to answer',
                        'Skip to the next question',
                      ],
                      correctAnswer:
                        'Paraphrase the question to ensure understanding',
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
  // Digital Marketing
  {
    title: 'Digital Marketing Essentials',
    slug: 'digital-marketing-essentials',
    description:
      'Pelajari strategi digital marketing yang efektif. SEO, Social Media Marketing, dan Google Ads.',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
    category: 'Marketing',
    level: CourseLevel.beginner,
    language: 'indonesian',
    estimatedDuration: 20,
    status: CourseStatus.draft,
    sections: [
      {
        title: 'Pengenalan Digital Marketing',
        description: 'Memahami landscape digital marketing',
        lessons: [
          {
            title: 'Apa itu Digital Marketing?',
            description: 'Overview dunia digital marketing',
            estimatedDuration: 20,
            exercises: [
              {
                title: 'Video: Digital Marketing Overview',
                type: ExerciseType.video,
                content: {
                  youtubeId: 'bixR-KIJKYM',
                  duration: 900,
                },
                estimatedDuration: 15,
              },
              {
                title: 'Quiz: Digital Marketing Basics',
                type: ExerciseType.quiz,
                content: {
                  quizType: 'multiple_choice',
                  questions: [
                    {
                      id: 'q1',
                      question:
                        'Manakah yang BUKAN termasuk digital marketing channel?',
                      options: [
                        'SEO',
                        'Email Marketing',
                        'Billboard',
                        'Social Media',
                      ],
                      correctAnswer: 'Billboard',
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
        title: 'Search Engine Optimization',
        description: 'Belajar SEO untuk meningkatkan visibility',
        lessons: [
          {
            title: 'SEO Fundamentals',
            description: 'Dasar-dasar SEO yang perlu diketahui',
            estimatedDuration: 30,
            exercises: [
              {
                title: 'Materi: SEO Basics',
                type: ExerciseType.material,
                content: {
                  body: '# SEO Fundamentals\n\n## What is SEO?\nSEO (Search Engine Optimization) adalah proses mengoptimalkan website agar mendapat ranking lebih tinggi di hasil pencarian.\n\n## 3 Pillars of SEO\n\n### 1. Technical SEO\n- Site speed\n- Mobile-friendliness\n- SSL certificate\n- XML sitemap\n\n### 2. On-Page SEO\n- Keyword research\n- Title tags & meta descriptions\n- Header tags (H1, H2, H3)\n- Content quality\n- Internal linking\n\n### 3. Off-Page SEO\n- Backlinks\n- Social signals\n- Brand mentions\n- Guest posting',
                },
                estimatedDuration: 15,
              },
              {
                title: 'Quiz: SEO Basics',
                type: ExerciseType.quiz,
                content: {
                  quizType: 'true_false',
                  questions: [
                    {
                      id: 'tf1',
                      question:
                        'Keyword stuffing adalah praktik SEO yang baik.',
                      options: ['True', 'False'],
                      correctAnswer: 'False',
                      points: 10,
                    },
                    {
                      id: 'tf2',
                      question:
                        'Backlink dari website berkualitas tinggi membantu SEO.',
                      options: ['True', 'False'],
                      correctAnswer: 'True',
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
  const student4Id = userIdMap.get('student4@inntexia.com');
  const student5Id = userIdMap.get('student5@inntexia.com');
  const student6Id = userIdMap.get('student6@inntexia.com');
  const student7Id = userIdMap.get('student7@inntexia.com');
  const student8Id = userIdMap.get('student8@inntexia.com');
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

    // Enroll students (including new students)
    const enrollments = [
      { studentId: student1Id, key: 'student1-python-group' },
      { studentId: student2Id, key: 'student2-python-group' },
      { studentId: student3Id, key: 'student3-python-group' },
      ...(student4Id
        ? [{ studentId: student4Id, key: 'student4-python-group' }]
        : []),
      ...(student5Id
        ? [{ studentId: student5Id, key: 'student5-python-group' }]
        : []),
      ...(student6Id
        ? [{ studentId: student6Id, key: 'student6-python-group' }]
        : []),
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
    console.log(`      └─ Enrolled ${enrollments.length} students`);

    // Update class capacity
    await prisma.class.update({
      where: { id: pythonGroupClass.id },
      data: { currentCapacity: enrollments.length },
    });

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

    // Enroll students (including new students)
    const jsEnrollments: Array<{ studentId: string; key: string }> = [
      { studentId: student1Id, key: 'student1-js-group' },
      { studentId: student2Id, key: 'student2-js-group' },
    ];
    if (student7Id)
      jsEnrollments.push({ studentId: student7Id, key: 'student7-js-group' });
    if (student8Id)
      jsEnrollments.push({ studentId: student8Id, key: 'student8-js-group' });
    if (student4Id)
      jsEnrollments.push({ studentId: student4Id, key: 'student4-js-group' });

    for (const { studentId, key } of jsEnrollments) {
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

    // Update class capacity
    await prisma.class.update({
      where: { id: jsGroupClass.id },
      data: { currentCapacity: jsEnrollments.length },
    });

    console.log(`      └─ Enrolled ${jsEnrollments.length} students`);
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
// PAYMENT SEEDS
// ============================================================================

interface SeedPayment {
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  courseSlug: string;
  packageType: string;
  amount: number;
  paymentMethod: string;
  paymentRef: string;
  status: PaymentStatus;
  notes?: string;
  daysAgo: number; // Days before today
}

const seedPayments: SeedPayment[] = [
  // Verified payments (completed transactions)
  {
    studentName: 'Jane Student',
    studentEmail: 'student@inntexia.com',
    studentPhone: '+6281234567890',
    courseSlug: 'python-untuk-pemula',
    packageType: '20 Meetings',
    amount: 2500000,
    paymentMethod: 'bank_transfer',
    paymentRef: 'BCA-TRF-20251201-001',
    status: PaymentStatus.verified,
    notes: 'Transfer BCA, verified via mobile banking',
    daysAgo: 30,
  },
  {
    studentName: 'Bob Learner',
    studentEmail: 'student2@inntexia.com',
    studentPhone: '+6281234567891',
    courseSlug: 'python-untuk-pemula',
    packageType: '10 Meetings',
    amount: 1500000,
    paymentMethod: 'e_wallet',
    paymentRef: 'GOPAY-20251205-002',
    status: PaymentStatus.verified,
    notes: 'GoPay transfer',
    daysAgo: 25,
  },
  {
    studentName: 'Alice Coder',
    studentEmail: 'student3@inntexia.com',
    studentPhone: '+6281234567892',
    courseSlug: 'quiz-types-demo',
    packageType: '10 Meetings',
    amount: 1500000,
    paymentMethod: 'bank_transfer',
    paymentRef: 'BNI-TRF-20251208-003',
    status: PaymentStatus.verified,
    notes: 'BNI transfer',
    daysAgo: 20,
  },
  {
    studentName: 'Jane Student',
    studentEmail: 'student@inntexia.com',
    studentPhone: '+6281234567890',
    courseSlug: 'web-development-javascript',
    packageType: '15 Meetings',
    amount: 2000000,
    paymentMethod: 'bank_transfer',
    paymentRef: 'BCA-TRF-20251210-004',
    status: PaymentStatus.verified,
    notes: 'Second course enrollment',
    daysAgo: 15,
  },
  {
    studentName: 'Bob Learner',
    studentEmail: 'student2@inntexia.com',
    studentPhone: '+6281234567891',
    courseSlug: 'web-development-javascript',
    packageType: '15 Meetings',
    amount: 2000000,
    paymentMethod: 'credit_card',
    paymentRef: 'CC-VISA-20251212-005',
    status: PaymentStatus.verified,
    notes: 'Visa credit card payment',
    daysAgo: 10,
  },

  // Pending payments (awaiting verification)
  {
    studentName: 'Dimas Pratama',
    studentEmail: 'dimas.p@gmail.com',
    studentPhone: '+6281234567893',
    courseSlug: 'python-untuk-pemula',
    packageType: '10 Meetings',
    amount: 1500000,
    paymentMethod: 'bank_transfer',
    paymentRef: 'MANDIRI-TRF-20251215-006',
    status: PaymentStatus.pending,
    notes: 'Waiting for proof upload',
    daysAgo: 5,
  },
  {
    studentName: 'Siti Aminah',
    studentEmail: 'siti.aminah@yahoo.com',
    studentPhone: '+6281234567894',
    courseSlug: 'web-development-javascript',
    packageType: '15 Meetings',
    amount: 2000000,
    paymentMethod: 'e_wallet',
    paymentRef: 'OVO-20251216-007',
    status: PaymentStatus.pending,
    notes: 'OVO payment, checking transfer',
    daysAgo: 4,
  },
  {
    studentName: 'Eko Wijaya',
    studentEmail: 'eko.wijaya@hotmail.com',
    studentPhone: '+6281234567895',
    courseSlug: 'python-untuk-pemula',
    packageType: '30 Meetings',
    amount: 3500000,
    paymentMethod: 'bank_transfer',
    paymentRef: 'BRI-TRF-20251217-008',
    status: PaymentStatus.pending,
    notes: 'Full package, premium student',
    daysAgo: 3,
  },
  {
    studentName: 'Rina Wulandari',
    studentEmail: 'rina.w@gmail.com',
    studentPhone: '+6281234567896',
    courseSlug: 'quiz-types-demo',
    packageType: '10 Meetings',
    amount: 1500000,
    paymentMethod: 'cash',
    paymentRef: 'CASH-20251218-009',
    status: PaymentStatus.pending,
    notes: 'Cash payment at office',
    daysAgo: 2,
  },
  {
    studentName: 'Budi Santoso',
    studentEmail: 'budi.santoso@company.co.id',
    studentPhone: '+6281234567897',
    courseSlug: 'python-untuk-pemula',
    packageType: '50 Meetings',
    amount: 5000000,
    paymentMethod: 'bank_transfer',
    paymentRef: 'BCA-TRF-20251218-010',
    status: PaymentStatus.pending,
    notes: 'Corporate training - full course',
    daysAgo: 1,
  },

  // Refunded payment
  {
    studentName: 'Ahmad Fauzi',
    studentEmail: 'ahmad.f@gmail.com',
    studentPhone: '+6281234567898',
    courseSlug: 'python-untuk-pemula',
    packageType: '10 Meetings',
    amount: 1500000,
    paymentMethod: 'bank_transfer',
    paymentRef: 'BCA-TRF-20251101-011',
    status: PaymentStatus.refunded,
    notes: 'Refunded - schedule conflict, student requested cancellation',
    daysAgo: 45,
  },
];

async function seedPaymentsData(
  userIdMap: Map<string, string>,
): Promise<Map<string, string>> {
  console.log('\n💳 Seeding payments...\n');

  const paymentIds = new Map<string, string>();
  const staffId = userIdMap.get('staff@inntexia.com');

  if (!staffId) {
    console.log('   ⚠️  Staff not found, skipping payment seed');
    return paymentIds;
  }

  // Get courses for courseId lookup
  const courses = await prisma.course.findMany({
    select: { id: true, slug: true },
  });
  const courseMap = new Map(courses.map((c) => [c.slug, c.id]));

  let verifiedCount = 0;
  let pendingCount = 0;
  let refundedCount = 0;
  let totalAmount = 0;

  for (const paymentData of seedPayments) {
    // Check if payment already exists by reference
    const existingPayment = await prisma.payment.findFirst({
      where: { paymentRef: paymentData.paymentRef },
    });

    if (existingPayment) {
      paymentIds.set(paymentData.paymentRef, existingPayment.id);
      continue;
    }

    const courseId = courseMap.get(paymentData.courseSlug) ?? null;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - paymentData.daysAgo);

    const payment = await prisma.payment.create({
      data: {
        studentName: paymentData.studentName,
        studentEmail: paymentData.studentEmail,
        studentPhone: paymentData.studentPhone,
        courseId,
        packageType: paymentData.packageType,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        paymentRef: paymentData.paymentRef,
        status: paymentData.status,
        notes: paymentData.notes,
        verifiedById:
          paymentData.status === PaymentStatus.verified ? staffId : null,
        verifiedAt:
          paymentData.status === PaymentStatus.verified
            ? new Date(createdAt.getTime() + 24 * 60 * 60 * 1000) // 1 day after creation
            : null,
        createdAt,
      },
    });

    paymentIds.set(paymentData.paymentRef, payment.id);

    // Track stats
    totalAmount += paymentData.amount;
    if (paymentData.status === PaymentStatus.verified) verifiedCount++;
    else if (paymentData.status === PaymentStatus.pending) pendingCount++;
    else if (paymentData.status === PaymentStatus.refunded) refundedCount++;
  }

  console.log(`   ✅ Created ${seedPayments.length} payment records`);
  console.log(`      └─ Verified: ${verifiedCount}`);
  console.log(`      └─ Pending: ${pendingCount}`);
  console.log(`      └─ Refunded: ${refundedCount}`);
  console.log(
    `      └─ Total amount: Rp ${totalAmount.toLocaleString('id-ID')}`,
  );

  return paymentIds;
}

// ============================================================================
// GAMIFICATION SEEDS
// ============================================================================

interface SeedBadge {
  name: string;
  description: string;
  imageUrl: string;
  rarity: BadgeRarity;
  criteria: Prisma.InputJsonValue;
}

const seedBadges: SeedBadge[] = [
  {
    name: 'Welcome Aboard',
    description: 'Login untuk pertama kalinya',
    imageUrl: '/badges/welcome.png',
    rarity: BadgeRarity.common,
    criteria: { type: 'login', count: 1 },
  },
  {
    name: 'First Steps',
    description: 'Selesaikan lesson pertama',
    imageUrl: '/badges/first-lesson.png',
    rarity: BadgeRarity.common,
    criteria: { type: 'lesson_complete', count: 1 },
  },
  {
    name: 'Quick Learner',
    description: 'Selesaikan 5 lessons',
    imageUrl: '/badges/quick-learner.png',
    rarity: BadgeRarity.rare,
    criteria: { type: 'lesson_complete', count: 5 },
  },
  {
    name: 'Quiz Starter',
    description: 'Selesaikan quiz pertama',
    imageUrl: '/badges/quiz-starter.png',
    rarity: BadgeRarity.common,
    criteria: { type: 'quiz_complete', count: 1 },
  },
  {
    name: 'Perfect Score',
    description: 'Dapatkan nilai 100% di quiz',
    imageUrl: '/badges/perfect-score.png',
    rarity: BadgeRarity.rare,
    criteria: { type: 'quiz_perfect', count: 1 },
  },
  {
    name: 'On Fire',
    description: 'Maintain 3-day streak',
    imageUrl: '/badges/streak-3.png',
    rarity: BadgeRarity.common,
    criteria: { type: 'streak', days: 3 },
  },
  {
    name: 'Week Warrior',
    description: 'Maintain 7-day streak',
    imageUrl: '/badges/streak-7.png',
    rarity: BadgeRarity.rare,
    criteria: { type: 'streak', days: 7 },
  },
  {
    name: 'Month Master',
    description: 'Maintain 30-day streak',
    imageUrl: '/badges/streak-30.png',
    rarity: BadgeRarity.epic,
    criteria: { type: 'streak', days: 30 },
  },
  {
    name: 'Graduate',
    description: 'Selesaikan course pertama',
    imageUrl: '/badges/graduate.png',
    rarity: BadgeRarity.rare,
    criteria: { type: 'course_complete', count: 1 },
  },
  {
    name: 'Coding Hero',
    description: 'Selesaikan 10 coding exercises',
    imageUrl: '/badges/coding-hero.png',
    rarity: BadgeRarity.epic,
    criteria: { type: 'coding_complete', count: 10 },
  },
  {
    name: 'Early Bird',
    description: 'Belajar sebelum jam 7 pagi',
    imageUrl: '/badges/early-bird.png',
    rarity: BadgeRarity.common,
    criteria: { type: 'time_based', hour_before: 7 },
  },
  {
    name: 'Night Owl',
    description: 'Belajar setelah jam 10 malam',
    imageUrl: '/badges/night-owl.png',
    rarity: BadgeRarity.common,
    criteria: { type: 'time_based', hour_after: 22 },
  },
  {
    name: 'Badge Collector',
    description: 'Kumpulkan 10 badges',
    imageUrl: '/badges/collector.png',
    rarity: BadgeRarity.legendary,
    criteria: { type: 'badge_count', count: 10 },
  },
];

async function seedGamificationData(
  userIdMap: Map<string, string>,
): Promise<void> {
  console.log('\n🎮 Seeding gamification data...\n');

  // Seed Badges
  console.log('   📛 Seeding badges...');
  const badgeMap = new Map<string, string>();

  for (const badgeData of seedBadges) {
    const existingBadge = await prisma.badge.findFirst({
      where: { name: badgeData.name },
    });

    if (existingBadge) {
      badgeMap.set(badgeData.name, existingBadge.id);
      continue;
    }

    const badge = await prisma.badge.create({
      data: {
        name: badgeData.name,
        description: badgeData.description,
        imageUrl: badgeData.imageUrl,
        rarity: badgeData.rarity,
        criteria: badgeData.criteria,
      },
    });
    badgeMap.set(badgeData.name, badge.id);
  }
  console.log(`      ✅ Created ${seedBadges.length} badges`);

  // Get student IDs
  const student1Id = userIdMap.get('student@inntexia.com');
  const student2Id = userIdMap.get('student2@inntexia.com');
  const student3Id = userIdMap.get('student3@inntexia.com');

  if (!student1Id || !student2Id || !student3Id) {
    console.log('   ⚠️  Students not found, skipping user level seed');
    return;
  }

  // Seed User Levels
  console.log('   📊 Seeding user levels...');
  const userLevelData = [
    {
      userId: student1Id,
      currentLevel: 5,
      totalXp: 1850,
      currentStreak: 12,
    },
    {
      userId: student2Id,
      currentLevel: 2,
      totalXp: 380,
      currentStreak: 3,
    },
    {
      userId: student3Id,
      currentLevel: 3,
      totalXp: 620,
      currentStreak: 0,
    },
  ];

  for (const levelData of userLevelData) {
    const existingLevel = await prisma.userLevel.findUnique({
      where: { userId: levelData.userId },
    });

    if (!existingLevel) {
      await prisma.userLevel.create({
        data: {
          userId: levelData.userId,
          currentLevel: levelData.currentLevel,
          totalXp: levelData.totalXp,
          currentStreak: levelData.currentStreak,
          lastActivityDate: new Date(),
        },
      });
    }
  }
  console.log(`      ✅ Created user levels for 3 students`);

  // Seed XP Transactions
  console.log('   💰 Seeding XP transactions...');
  const xpTransactions = [
    // Student 1 - lots of activity
    { userId: student1Id, amount: 10, reason: 'login', daysAgo: 0 },
    { userId: student1Id, amount: 25, reason: 'lesson_complete', daysAgo: 1 },
    { userId: student1Id, amount: 50, reason: 'quiz_complete', daysAgo: 1 },
    { userId: student1Id, amount: 100, reason: 'badge_earned', daysAgo: 2 },
    { userId: student1Id, amount: 25, reason: 'lesson_complete', daysAgo: 3 },
    { userId: student1Id, amount: 30, reason: 'streak_bonus', daysAgo: 3 },
    { userId: student1Id, amount: 25, reason: 'lesson_complete', daysAgo: 4 },
    { userId: student1Id, amount: 25, reason: 'lesson_complete', daysAgo: 5 },
    { userId: student1Id, amount: 75, reason: 'streak_bonus', daysAgo: 7 },
    { userId: student1Id, amount: 200, reason: 'course_complete', daysAgo: 10 },

    // Student 2 - moderate activity
    { userId: student2Id, amount: 10, reason: 'login', daysAgo: 0 },
    { userId: student2Id, amount: 25, reason: 'lesson_complete', daysAgo: 2 },
    { userId: student2Id, amount: 30, reason: 'quiz_complete', daysAgo: 3 },
    { userId: student2Id, amount: 30, reason: 'streak_bonus', daysAgo: 5 },

    // Student 3 - quiz focus
    { userId: student3Id, amount: 10, reason: 'login', daysAgo: 1 },
    { userId: student3Id, amount: 100, reason: 'badge_earned', daysAgo: 3 },
    { userId: student3Id, amount: 50, reason: 'quiz_complete', daysAgo: 3 },
    { userId: student3Id, amount: 50, reason: 'quiz_complete', daysAgo: 4 },
    { userId: student3Id, amount: 50, reason: 'quiz_complete', daysAgo: 5 },
  ];

  for (const tx of xpTransactions) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - tx.daysAgo);

    // Check if similar transaction exists
    const existingTx = await prisma.xpTransaction.findFirst({
      where: {
        userId: tx.userId,
        reason: tx.reason,
        createdAt: {
          gte: new Date(createdAt.setHours(0, 0, 0, 0)),
          lt: new Date(createdAt.setHours(23, 59, 59, 999)),
        },
      },
    });

    if (!existingTx) {
      await prisma.xpTransaction.create({
        data: {
          userId: tx.userId,
          amount: tx.amount,
          reason: tx.reason,
          createdAt,
        },
      });
    }
  }
  console.log(`      ✅ Created ${xpTransactions.length} XP transactions`);

  // Seed User Badges
  console.log('   🏅 Assigning badges to users...');
  const userBadges = [
    // Student 1 - many badges
    { userId: student1Id, badgeName: 'Welcome Aboard', daysAgo: 30 },
    { userId: student1Id, badgeName: 'First Steps', daysAgo: 28 },
    { userId: student1Id, badgeName: 'Quiz Starter', daysAgo: 25 },
    { userId: student1Id, badgeName: 'Quick Learner', daysAgo: 20 },
    { userId: student1Id, badgeName: 'Perfect Score', daysAgo: 15 },
    { userId: student1Id, badgeName: 'On Fire', daysAgo: 18 },
    { userId: student1Id, badgeName: 'Week Warrior', daysAgo: 12 },
    { userId: student1Id, badgeName: 'Graduate', daysAgo: 10 },

    // Student 2 - starter badges
    { userId: student2Id, badgeName: 'Welcome Aboard', daysAgo: 15 },
    { userId: student2Id, badgeName: 'First Steps', daysAgo: 12 },
    { userId: student2Id, badgeName: 'On Fire', daysAgo: 5 },

    // Student 3 - quiz focused
    { userId: student3Id, badgeName: 'Welcome Aboard', daysAgo: 10 },
    { userId: student3Id, badgeName: 'Quiz Starter', daysAgo: 8 },
    { userId: student3Id, badgeName: 'Perfect Score', daysAgo: 5 },
  ];

  for (const ub of userBadges) {
    const badgeId = badgeMap.get(ub.badgeName);
    if (!badgeId) continue;

    const existingUB = await prisma.userBadge.findFirst({
      where: {
        userId: ub.userId,
        badgeId,
      },
    });

    if (!existingUB) {
      const earnedAt = new Date();
      earnedAt.setDate(earnedAt.getDate() - ub.daysAgo);

      await prisma.userBadge.create({
        data: {
          userId: ub.userId,
          badgeId,
          earnedAt,
        },
      });
    }
  }
  console.log(`      ✅ Assigned badges to users`);
}

// ============================================================================
// ASSESSMENT SEEDS (Submissions)
// ============================================================================

async function seedAssessmentData(
  userIdMap: Map<string, string>,
): Promise<void> {
  console.log('\n📝 Seeding assessment data...\n');

  const student1Id = userIdMap.get('student@inntexia.com');
  const student2Id = userIdMap.get('student2@inntexia.com');
  const student3Id = userIdMap.get('student3@inntexia.com');
  const instructorId = userIdMap.get('instructor@inntexia.com');

  if (!student1Id || !student2Id || !student3Id || !instructorId) {
    console.log('   ⚠️  Required users not found, skipping assessment seed');
    return;
  }

  // Get assignment exercises
  const assignmentExercises = await prisma.exercise.findMany({
    where: { type: ExerciseType.coding },
    take: 5,
  });

  if (assignmentExercises.length === 0) {
    console.log('   ⚠️  No coding exercises found, skipping submission seed');
    return;
  }

  const submissions = [
    // Student 1 - graded submissions
    {
      studentId: student1Id,
      exerciseIdx: 0,
      status: SubmissionStatus.graded,
      grade: 95,
      comment: 'Here is my solution!',
      daysAgo: 5,
    },
    {
      studentId: student1Id,
      exerciseIdx: 1,
      status: SubmissionStatus.graded,
      grade: 88,
      comment: 'Second attempt with improvements',
      daysAgo: 3,
    },

    // Student 2 - pending & returned
    {
      studentId: student2Id,
      exerciseIdx: 0,
      status: SubmissionStatus.pending,
      comment: 'Please review my code',
      daysAgo: 2,
    },
    {
      studentId: student2Id,
      exerciseIdx: 1,
      status: SubmissionStatus.returned,
      comment: 'I tried my best',
      daysAgo: 4,
    },

    // Student 3 - mix of statuses
    {
      studentId: student3Id,
      exerciseIdx: 0,
      status: SubmissionStatus.graded,
      grade: 100,
      comment: 'All test cases should pass now',
      daysAgo: 6,
    },
    {
      studentId: student3Id,
      exerciseIdx: 1,
      status: SubmissionStatus.pending,
      comment: 'Submission for FizzBuzz',
      daysAgo: 1,
    },
  ];

  let createdCount = 0;
  for (const sub of submissions) {
    const exercise = assignmentExercises[sub.exerciseIdx];
    if (!exercise) continue;

    const existingSub = await prisma.assignmentSubmission.findFirst({
      where: {
        studentId: sub.studentId,
        exerciseId: exercise.id,
      },
    });

    if (!existingSub) {
      const submittedAt = new Date();
      submittedAt.setDate(submittedAt.getDate() - sub.daysAgo);

      await prisma.assignmentSubmission.create({
        data: {
          studentId: sub.studentId,
          exerciseId: exercise.id,
          type: 'text',
          textContent: `# Solution for ${exercise.title}\n\ndef solution():\n    # Implementation here\n    pass`,
          comment: sub.comment,
          status: sub.status,
          grade: sub.grade,
          maxGrade: 100,
          submittedAt,
          gradedAt: sub.status === SubmissionStatus.graded ? new Date() : null,
          gradedById:
            sub.status === SubmissionStatus.graded ? instructorId : null,
        },
      });
      createdCount++;
    }
  }

  console.log(`   ✅ Created ${createdCount} assignment submissions`);
  console.log(`      └─ Graded: 3`);
  console.log(`      └─ Pending: 2`);
  console.log(`      └─ Returned: 1`);
}

// ============================================================================
// NOTIFICATION SEEDS
// ============================================================================

async function seedNotificationData(
  userIdMap: Map<string, string>,
): Promise<void> {
  console.log('\n🔔 Seeding notification data...\n');

  const student1Id = userIdMap.get('student@inntexia.com');
  const student2Id = userIdMap.get('student2@inntexia.com');
  const instructorId = userIdMap.get('instructor@inntexia.com');
  const staffId = userIdMap.get('staff@inntexia.com');

  if (!student1Id || !student2Id || !instructorId || !staffId) {
    console.log('   ⚠️  Required users not found, skipping notification seed');
    return;
  }

  const notifications = [
    // Student 1 notifications
    {
      userId: student1Id,
      title: 'New Lesson Unlocked',
      message: 'Variabel di Python is now available!',
      type: 'lesson_unlock',
      read: true,
      daysAgo: 3,
    },
    {
      userId: student1Id,
      title: 'Assignment Graded',
      message:
        'Your submission for "Coding: Sum Function" has been graded. Score: 95',
      type: 'assignment_graded',
      read: true,
      daysAgo: 2,
    },
    {
      userId: student1Id,
      title: 'Badge Earned!',
      message: 'Congratulations! You earned the "Week Warrior" badge.',
      type: 'badge_earned',
      read: false,
      daysAgo: 1,
    },
    {
      userId: student1Id,
      title: 'Upcoming Class',
      message: 'Python Batch 1 - Group class starts in 1 hour.',
      type: 'class_reminder',
      read: false,
      daysAgo: 0,
    },

    // Student 2 notifications
    {
      userId: student2Id,
      title: 'Welcome to Inntexia!',
      message: 'Start your learning journey today.',
      type: 'system',
      read: true,
      daysAgo: 15,
    },
    {
      userId: student2Id,
      title: 'Assignment Returned',
      message: 'Your submission needs revision. Check the feedback.',
      type: 'assignment_returned',
      read: false,
      daysAgo: 4,
    },
    {
      userId: student2Id,
      title: 'Streak Alert',
      message: "Don't break your 3-day streak! Learn something today.",
      type: 'streak_reminder',
      read: false,
      daysAgo: 0,
    },

    // Instructor notifications
    {
      userId: instructorId,
      title: 'New Submission',
      message: 'Bob Learner submitted "Coding: Sum Function".',
      type: 'new_submission',
      read: false,
      daysAgo: 2,
    },
    {
      userId: instructorId,
      title: 'New Submission',
      message: 'Alice Coder submitted "Coding: FizzBuzz".',
      type: 'new_submission',
      read: false,
      daysAgo: 1,
    },
    {
      userId: instructorId,
      title: 'Class Reminder',
      message: 'Python Batch 1 - Group class starts in 1 hour.',
      type: 'class_reminder',
      read: false,
      daysAgo: 0,
    },

    // Staff notifications
    {
      userId: staffId,
      title: 'New Payment',
      message: 'Budi Santoso submitted payment for Python course.',
      type: 'payment_received',
      read: false,
      daysAgo: 1,
    },
    {
      userId: staffId,
      title: 'Pending Verifications',
      message: '5 payments are awaiting verification.',
      type: 'payment_pending',
      read: false,
      daysAgo: 0,
    },
  ];

  let createdCount = 0;
  for (const notif of notifications) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - notif.daysAgo);

    // Check if similar notification exists
    const existingNotif = await prisma.notification.findFirst({
      where: {
        userId: notif.userId,
        title: notif.title,
        message: notif.message,
      },
    });

    if (!existingNotif) {
      await prisma.notification.create({
        data: {
          userId: notif.userId,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          read: notif.read,
          createdAt,
        },
      });
      createdCount++;
    }
  }

  console.log(`   ✅ Created ${createdCount} notifications`);
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

  // Seed payments data
  const paymentIds = await seedPaymentsData(userIdMap);

  // Seed gamification data
  await seedGamificationData(userIdMap);

  // Seed assessment data (submissions)
  await seedAssessmentData(userIdMap);

  // Seed notification data
  await seedNotificationData(userIdMap);

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
  console.log('─'.repeat(60));
  seedCourses.forEach((c) => {
    const sectionCount = c.sections.length;
    const lessonCount = c.sections.reduce(
      (acc, s) => acc + s.lessons.length,
      0,
    );
    const exerciseCount = c.sections.reduce(
      (acc, s) => acc + s.lessons.reduce((a, l) => a + l.exercises.length, 0),
      0,
    );
    console.log(
      `   [${c.status.padEnd(9)}] ${c.title.padEnd(30)} ${sectionCount}s/${lessonCount}l/${exerciseCount}e`,
    );
  });
  console.log('─'.repeat(60));

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

  // Print payment summary
  console.log('\n💳 Payments Created:');
  console.log('─'.repeat(50));
  console.log('   [verified ] 5 payments - Rp 9,500,000');
  console.log(
    '   [pending  ] 5 payments - Rp 13,500,000 (awaiting verification)',
  );
  console.log('   [refunded ] 1 payment  - Rp 1,500,000');
  console.log('   Total: 11 payments - Rp 24,500,000');
  console.log('─'.repeat(50));

  // Print sample payment IDs for API testing
  if (paymentIds.size > 0) {
    console.log('\n🔑 Sample Payment Refs for Testing:');
    console.log('─'.repeat(50));
    let count = 0;
    paymentIds.forEach((id, ref) => {
      if (count < 5) {
        console.log(`   ${ref.padEnd(28)} : ${id}`);
        count++;
      }
    });
    console.log('   ... and more');
    console.log('─'.repeat(50));
  }

  // Print gamification summary
  console.log('\n🎮 Gamification Data:');
  console.log('─'.repeat(50));
  console.log(`   Badges: ${seedBadges.length} badges created`);
  console.log('   User Levels:');
  console.log('      student@inntexia.com  : Level 5 (1850 XP, 12-day streak)');
  console.log('      student2@inntexia.com : Level 2 (380 XP, 3-day streak)');
  console.log('      student3@inntexia.com : Level 3 (620 XP)');
  console.log('   Badges Earned:');
  console.log('      student@inntexia.com  : 8 badges (Graduate badge!)');
  console.log('      student2@inntexia.com : 3 badges');
  console.log('      student3@inntexia.com : 3 badges (Perfect Score!)');
  console.log('   XP Transactions: 19 transactions logged');
  console.log('─'.repeat(50));

  // Print assessment summary
  console.log('\n📝 Assessment Data:');
  console.log('─'.repeat(50));
  console.log('   Assignment Submissions:');
  console.log('      [graded   ] 3 submissions (scores: 95, 88, 100)');
  console.log('      [submitted] 2 submissions (awaiting grading)');
  console.log('      [returned ] 1 submission (needs revision)');
  console.log('─'.repeat(50));

  // Print notification summary
  console.log('\n🔔 Notification Data:');
  console.log('─'.repeat(50));
  console.log('   student@inntexia.com  : 4 notifications (2 unread)');
  console.log('   student2@inntexia.com : 3 notifications (2 unread)');
  console.log('   instructor            : 3 notifications (3 unread)');
  console.log('   staff                 : 2 notifications (2 unread)');
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
