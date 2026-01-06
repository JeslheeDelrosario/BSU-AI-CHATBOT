--
-- PostgreSQL database dump
--

\restrict VXx4jIHQg7VytUTuqwBdhfW7YDuBF7E8DiiH8jY7L4x9JuIqXF06jg6PQOLmuVi

-- Dumped from database version 15.15 (Debian 15.15-1.pgdg13+1)
-- Dumped by pg_dump version 15.15 (Debian 15.15-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: tisa_admin
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO tisa_admin;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: tisa_admin
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AIInteractionType; Type: TYPE; Schema: public; Owner: tisa_admin
--

CREATE TYPE public."AIInteractionType" AS ENUM (
    'QUESTION',
    'EXPLANATION',
    'EXAMPLE',
    'HINT',
    'FEEDBACK',
    'TRANSLATION',
    'SUMMARY'
);


ALTER TYPE public."AIInteractionType" OWNER TO tisa_admin;

--
-- Name: AchievementType; Type: TYPE; Schema: public; Owner: tisa_admin
--

CREATE TYPE public."AchievementType" AS ENUM (
    'COURSE_COMPLETION',
    'STREAK',
    'PERFECT_SCORE',
    'EARLY_BIRD',
    'NIGHT_OWL',
    'HELPFUL_PEER',
    'MILESTONE'
);


ALTER TYPE public."AchievementType" OWNER TO tisa_admin;

--
-- Name: AssignmentType; Type: TYPE; Schema: public; Owner: tisa_admin
--

CREATE TYPE public."AssignmentType" AS ENUM (
    'ESSAY',
    'MULTIPLE_CHOICE',
    'SHORT_ANSWER',
    'PROJECT',
    'CODING',
    'PRESENTATION'
);


ALTER TYPE public."AssignmentType" OWNER TO tisa_admin;

--
-- Name: CourseLevel; Type: TYPE; Schema: public; Owner: tisa_admin
--

CREATE TYPE public."CourseLevel" AS ENUM (
    'BEGINNER',
    'INTERMEDIATE',
    'ADVANCED',
    'EXPERT'
);


ALTER TYPE public."CourseLevel" OWNER TO tisa_admin;

--
-- Name: CourseStatus; Type: TYPE; Schema: public; Owner: tisa_admin
--

CREATE TYPE public."CourseStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
);


ALTER TYPE public."CourseStatus" OWNER TO tisa_admin;

--
-- Name: EnrollmentStatus; Type: TYPE; Schema: public; Owner: tisa_admin
--

CREATE TYPE public."EnrollmentStatus" AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'DROPPED',
    'PAUSED'
);


ALTER TYPE public."EnrollmentStatus" OWNER TO tisa_admin;

--
-- Name: LearningStyle; Type: TYPE; Schema: public; Owner: tisa_admin
--

CREATE TYPE public."LearningStyle" AS ENUM (
    'VISUAL',
    'AUDITORY',
    'KINESTHETIC',
    'READING_WRITING',
    'MIXED'
);


ALTER TYPE public."LearningStyle" OWNER TO tisa_admin;

--
-- Name: LessonType; Type: TYPE; Schema: public; Owner: tisa_admin
--

CREATE TYPE public."LessonType" AS ENUM (
    'VIDEO',
    'TEXT',
    'AUDIO',
    'INTERACTIVE',
    'QUIZ',
    'ASSIGNMENT'
);


ALTER TYPE public."LessonType" OWNER TO tisa_admin;

--
-- Name: SubmissionStatus; Type: TYPE; Schema: public; Owner: tisa_admin
--

CREATE TYPE public."SubmissionStatus" AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'GRADED',
    'RETURNED'
);


ALTER TYPE public."SubmissionStatus" OWNER TO tisa_admin;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: tisa_admin
--

CREATE TYPE public."UserRole" AS ENUM (
    'STUDENT',
    'TEACHER',
    'PARENT',
    'ADMIN',
    'CONTENT_CREATOR'
);


ALTER TYPE public."UserRole" OWNER TO tisa_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AIInteraction; Type: TABLE; Schema: public; Owner: tisa_admin
--

CREATE TABLE public."AIInteraction" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."AIInteractionType" NOT NULL,
    context text,
    "userMessage" text NOT NULL,
    "aiResponse" text NOT NULL,
    helpful boolean,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AIInteraction" OWNER TO tisa_admin;

--
-- Name: AccessibilitySettings; Type: TABLE; Schema: public; Owner: tisa_admin
--

CREATE TABLE public."AccessibilitySettings" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "fontSize" integer DEFAULT 16 NOT NULL,
    "fontFamily" text DEFAULT 'Arial'::text NOT NULL,
    "highContrast" boolean DEFAULT false NOT NULL,
    "colorScheme" text DEFAULT 'default'::text NOT NULL,
    "reducedMotion" boolean DEFAULT false NOT NULL,
    "textToSpeechEnabled" boolean DEFAULT false NOT NULL,
    "ttsSpeed" double precision DEFAULT 1.0 NOT NULL,
    "ttsVoice" text DEFAULT 'default'::text NOT NULL,
    "speechToTextEnabled" boolean DEFAULT false NOT NULL,
    "keyboardOnly" boolean DEFAULT false NOT NULL,
    "captionsEnabled" boolean DEFAULT true NOT NULL,
    "transcriptsEnabled" boolean DEFAULT true NOT NULL,
    "signLanguageEnabled" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AccessibilitySettings" OWNER TO tisa_admin;

--
-- Name: Achievement; Type: TABLE; Schema: public; Owner: tisa_admin
--

CREATE TABLE public."Achievement" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."AchievementType" NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    "earnedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Achievement" OWNER TO tisa_admin;

--
-- Name: Assessment; Type: TABLE; Schema: public; Owner: tisa_admin
--

CREATE TABLE public."Assessment" (
    id text NOT NULL,
    "courseId" text NOT NULL,
    "lessonId" text,
    title text NOT NULL,
    description text,
    "timeLimit" integer,
    "passingScore" double precision NOT NULL,
    "maxAttempts" integer,
    questions text NOT NULL,
    "isPublished" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Assessment" OWNER TO tisa_admin;

--
-- Name: AssessmentResult; Type: TABLE; Schema: public; Owner: tisa_admin
--

CREATE TABLE public."AssessmentResult" (
    id text NOT NULL,
    "assessmentId" text NOT NULL,
    "userId" text NOT NULL,
    score double precision NOT NULL,
    answers text NOT NULL,
    "timeSpent" integer NOT NULL,
    passed boolean NOT NULL,
    attempt integer DEFAULT 1 NOT NULL,
    "completedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AssessmentResult" OWNER TO tisa_admin;

--
-- Name: Assignment; Type: TABLE; Schema: public; Owner: tisa_admin
--

CREATE TABLE public."Assignment" (
    id text NOT NULL,
    "courseId" text NOT NULL,
    "lessonId" text,
    title text NOT NULL,
    description text NOT NULL,
    type public."AssignmentType" NOT NULL,
    "maxScore" double precision NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "allowLateSubmission" boolean DEFAULT false NOT NULL,
    instructions text NOT NULL,
    rubric text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Assignment" OWNER TO tisa_admin;

--
-- Name: ChatSession; Type: TABLE; Schema: public; Owner: tisa_admin
--

CREATE TABLE public."ChatSession" (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    messages jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ChatSession" OWNER TO tisa_admin;

--
-- Name: Course; Type: TABLE; Schema: public; Owner: tisa_admin
--

CREATE TABLE public."Course" (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    thumbnail text,
    level public."CourseLevel" NOT NULL,
    status public."CourseStatus" DEFAULT 'DRAFT'::public."CourseStatus" NOT NULL,
    duration integer,
    price double precision DEFAULT 0,
    tags text[],
    "creatorId" text NOT NULL,
    "teacherId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Course" OWNER TO tisa_admin;

--
-- Name: CourseReview; Type: TABLE; Schema: public; Owner: tisa_admin
--

CREATE TABLE public."CourseReview" (
    id text NOT NULL,
    "courseId" text NOT NULL,
    "userId" text NOT NULL,
    rating integer NOT NULL,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CourseReview" OWNER TO tisa_admin;

--
-- Name: CurriculumEntry; Type: TABLE; Schema: public; Owner: tisa_admin
--

CREATE TABLE public."CurriculumEntry" (
    id text NOT NULL,
    "programId" text NOT NULL,
    "yearLevel" integer NOT NULL,
    semester integer NOT NULL,
    "courseCode" text NOT NULL,
    "subjectName" text NOT NULL,
    units integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    prerequisites text[] DEFAULT ARRAY[]::text[]
);


ALTER TABLE public."CurriculumEntry" OWNER TO tisa_admin;

--
-- Name: Enrollment; Type: TABLE; Schema: public; Owner: tisa_admin
--

CREATE TABLE public."Enrollment" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "courseId" text NOT NULL,
    status public."EnrollmentStatus" DEFAULT 'ACTIVE'::public."EnrollmentStatus" NOT NULL,
    progress double precision DEFAULT 0 NOT NULL,
    "enrolledAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "lastAccessedAt" timestamp(3) without time zone
);


ALTER TABLE public."Enrollment" OWNER TO tisa_admin;

--
-- Name: Faculty; Type: TABLE; Schema: public; Owner: tisa_admin
--

CREATE TABLE public."Faculty" (
    id text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text,
    "position" text NOT NULL,
    college text DEFAULT 'College of Science'::text NOT NULL
);


ALTER TABLE public."Faculty" OWNER TO tisa_admin;

--
-- Name: FacultySubject; Type: TABLE; Schema: public; Owner: tisa_admin
--

CREATE TABLE public."FacultySubject" (
    id text NOT NULL,
    "facultyId" text NOT NULL,
    "subjectId" text NOT NULL
);


ALTER TABLE public."FacultySubject" OWNER TO tisa_admin;

--
-- Name: GroupMessage; Type: TABLE; Schema: public; Owner: tisa_admin
--

CREATE TABLE public."GroupMessage" (
    id text NOT NULL,
    "groupId" text NOT NULL,
    "userId" text NOT NULL,
    content text NOT NULL,
    attachments text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."GroupMessage" OWNER TO tisa_admin;

--
-- Name: Lesson; Type: TABLE; Schema: public; Owner: tisa_admin
--

CREATE TABLE public."Lesson" (
    id text NOT NULL,
    "courseId" text NOT NULL,
    title text NOT NULL,
    description text,
    type public."LessonType" NOT NULL,
    content text NOT NULL,
    "videoUrl" text,
    "audioUrl" text,
    transcript text,
    duration integer,
    "order" integer NOT NULL,
    "isPublished" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Lesson" OWNER TO tisa_admin;

--
-- Name: Message; Type: TABLE; Schema: public; Owner: tisa_admin
--

CREATE TABLE public."Message" (
    id text NOT NULL,
    "senderId" text NOT NULL,
    "receiverId" text NOT NULL,
    subject text,
    content text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Message" OWNER TO tisa_admin;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: tisa_admin
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL,
    link text,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Notification" OWNER TO tisa_admin;

--
-- Name: Progress; Type: TABLE; Schema: public; Owner: tisa_admin
--

CREATE TABLE public."Progress" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "lessonId" text NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    "timeSpent" integer DEFAULT 0 NOT NULL,
    "lastPosition" integer,
    attempts integer DEFAULT 0 NOT NULL,
    score double precision,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Progress" OWNER TO tisa_admin;

--
-- Name: Resource; Type: TABLE; Schema: public; Owner: tisa_admin
--

CREATE TABLE public."Resource" (
    id text NOT NULL,
    "lessonId" text NOT NULL,
    title text NOT NULL,
    type text NOT NULL,
    url text NOT NULL,
    size integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Resource" OWNER TO tisa_admin;

--
-- Name: StudyGroup; Type: TABLE; Schema: public; Owner: tisa_admin
--

CREATE TABLE public."StudyGroup" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "courseId" text,
    "maxMembers" integer DEFAULT 10 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."StudyGroup" OWNER TO tisa_admin;

--
-- Name: StudyGroupMember; Type: TABLE; Schema: public; Owner: tisa_admin
--

CREATE TABLE public."StudyGroupMember" (
    id text NOT NULL,
    "groupId" text NOT NULL,
    "userId" text NOT NULL,
    role text DEFAULT 'member'::text NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."StudyGroupMember" OWNER TO tisa_admin;

--
-- Name: Subject; Type: TABLE; Schema: public; Owner: tisa_admin
--

CREATE TABLE public."Subject" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."Subject" OWNER TO tisa_admin;

--
-- Name: Submission; Type: TABLE; Schema: public; Owner: tisa_admin
--

CREATE TABLE public."Submission" (
    id text NOT NULL,
    "assignmentId" text NOT NULL,
    "userId" text NOT NULL,
    content text NOT NULL,
    attachments text[],
    status public."SubmissionStatus" DEFAULT 'DRAFT'::public."SubmissionStatus" NOT NULL,
    score double precision,
    feedback text,
    "gradedBy" text,
    "gradedAt" timestamp(3) without time zone,
    "submittedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Submission" OWNER TO tisa_admin;

--
-- Name: UniversityProgram; Type: TABLE; Schema: public; Owner: tisa_admin
--

CREATE TABLE public."UniversityProgram" (
    id text NOT NULL,
    title text NOT NULL,
    abbreviation text,
    college text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UniversityProgram" OWNER TO tisa_admin;

--
-- Name: User; Type: TABLE; Schema: public; Owner: tisa_admin
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    role public."UserRole" DEFAULT 'STUDENT'::public."UserRole" NOT NULL,
    avatar text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "learningStyle" public."LearningStyle",
    "gradeLevel" text,
    "dateOfBirth" timestamp(3) without time zone,
    "parentId" text
);


ALTER TABLE public."User" OWNER TO tisa_admin;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: tisa_admin
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO tisa_admin;

--
-- Data for Name: AIInteraction; Type: TABLE DATA; Schema: public; Owner: tisa_admin
--

COPY public."AIInteraction" (id, "userId", type, context, "userMessage", "aiResponse", helpful, "createdAt") FROM stdin;
81edd83c-1ac0-4d05-9cb8-ac01f4d7f37a	33770ace-9706-4c86-aa82-d1c796ea0c60	QUESTION	Course: 0733e96a-60ff-4d5e-8079-5ce03d50b628	Can you explain what a variable is in simple terms?	Of course! A variable is like a container or box that can hold different values. Think of it like a backpack - you can put different things in it at different times. In math, we use letters like x, y, or z to represent these containers. For example, if x = 5, then x is our variable and 5 is the value it currently holds.	t	2025-11-20 18:27:31.525
6ffa79da-8210-452c-8d6a-057cd88c5eea	33770ace-9706-4c86-aa82-d1c796ea0c60	HINT	Course: 0733e96a-60ff-4d5e-8079-5ce03d50b628	I'm stuck on solving 2x + 3 = 11	Great question! Here's a hint: Start by getting all the numbers on one side and the variable on the other. What would you subtract from both sides first to isolate the term with x?	t	2025-11-20 18:27:31.528
f3be116e-72e0-4dc6-bb1b-a829363552a1	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	\N	who si the dean in college of science?	**Bulacan State University ΓÇô College of Science**\n\nHere are the official undergraduate programs as of 2025:\n\nΓÇó Bachelor of Science in Mathematics with Specialization in Applied Statistics  \nΓÇó Bachelor of Science in Mathematics with Specialization in Business Applications  \nΓÇó Bachelor of Science in Mathematics with Specialization in Computer Science  \nΓÇó BS Biology  \nΓÇó BS Environmental Science  \nΓÇó BS Food Technology  \nΓÇó BS Medical Technology / Medical Laboratory Science  \n\nWhich program interests you? I can provide details on curriculum, admission, or career paths.	\N	2025-11-20 18:47:51.218
cbb5bfc0-e8f9-40eb-a02e-f47af9b76bf3	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	who si the dean in college of science?	**Bulacan State University ΓÇô College of Science**\n\nHere are the official undergraduate programs as of 2025:\n\nΓÇó Bachelor of Science in Mathematics with Specialization in Applied Statistics  \nΓÇó Bachelor of Science in Mathematics with Specialization in Business Applications  \nΓÇó Bachelor of Science in Mathematics with Specialization in Computer Science  \nΓÇó BS Biology  \nΓÇó BS Environmental Science  \nΓÇó BS Food Technology  \nΓÇó BS Medical Technology / Medical Laboratory Science  \n\nWhich program interests you? I can provide details on curriculum, admission, or career paths.	\N	2025-11-20 20:19:59.366
005a582e-46bf-423e-8517-70c1ea6bc747	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Program: Bachelor of Science in Mathematics with Specialization in Computer Science (BSM CS).\nCurriculum:\nΓÇó MAT 102 (Fundamentals of Computing), Year 1, Sem 1, Units 3, Prerequisites: -\nΓÇó MAT 103 (Calculus I), Year 1, Sem 1, Units 5, Prerequisites: -\nΓÇó MMW 101 (Mathematics in the Modern World), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó PCM 101 (Purposive Communication), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó PAL 101 (Panitikan at Lipunan), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó MCS 102a (Computer Programming I), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó PE 10 (PATHFIT 1), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó NSTP 10 (National Service Training Program 1), Year 1, Sem 1, Units 3, Prerequisites: None\nFaculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	"What are the 1st sem subjects for BSM CS?	For the Bachelor of Science in Mathematics with Specialization in Computer Science (BSM CS), the subjects for the 1st semester are as follows:\n\n1. MAT 102 (Fundamentals of Computing) - 3 Units\n2. MAT 103 (Calculus I) - 5 Units\n3. MMW 101 (Mathematics in the Modern World) - 3 Units\n4. PCM 101 (Purposive Communication) - 3 Units\n5. PAL 101 (Panitikan at Lipunan) - 3 Units\n6. MCS 102a (Computer Programming I) - 3 Units\n7. PE 10 (PATHFIT 1) - 3 Units\n8. NSTP 10 (National Service Training Program 1) - 3 Units\n\nThese courses are designed to provide a strong foundational knowledge in mathematics and computing, essential for your specialization.	\N	2025-11-20 20:22:20.119
378992ef-619b-4da5-9d16-6c541ca72934	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	who si the dean in college of science?	The Dean of the College of Science is Thelma V. Pagtalunan.	\N	2025-11-20 20:29:19.228
0d876c22-637d-48dc-bcc2-eeee819f1cfa	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	who is the associate dean?	Acording to my Data The Dean of the College of Science is Thelma V. Pagtalunan.	\N	2025-11-20 20:31:40.158
494dcd5a-cb0b-4abf-a231-e2fb4053bfc0	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	who si the dean in college of science?	The Deans of the College of Science are: Thelma V. Pagtalunan.	\N	2025-11-20 20:42:07.605
0d5fe077-494f-409d-ba23-d605606115d9	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	who is the associate dean?	The Deans of the College of Science are: Thelma V. Pagtalunan.	\N	2025-11-20 20:42:15.903
d83b61c2-24f3-4033-9f57-ff1f7fcffc89	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	who is the associate dean?	The Deans of the College of Science are: Thelma V. Pagtalunan.	\N	2025-11-20 20:43:36.77
3aa3e156-364a-4cf2-8e98-f3ad1c76e196	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	who is the college of science dean?	The Deans of the College of Science are: Thelma V. Pagtalunan.	\N	2025-11-20 20:59:48.739
5eb8b3c9-9bad-452e-8306-4bf74ff52631	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	what are the courses in college of science?	**Bulacan State University ΓÇô College of Science**\n\nHere are the official undergraduate programs as of 2025:\n\nΓÇó Bachelor of Science in Mathematics with Specialization in Applied Statistics  \nΓÇó Bachelor of Science in Mathematics with Specialization in Business Applications  \nΓÇó Bachelor of Science in Mathematics with Specialization in Computer Science  \nΓÇó BS Biology  \nΓÇó BS Environmental Science  \nΓÇó BS Food Technology  \nΓÇó BS Medical Technology / Medical Laboratory Science  \n\nWhich program interests you? I can provide details on curriculum, admission, or career paths.	\N	2025-11-20 21:00:09.55
6bfdff62-301d-4d1e-9ab9-d264051c7e6b	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	what are the courses in college of science?	**Bulacan State University ΓÇô College of Science**\n\nHere are the official undergraduate programs as of 2025:\n\nΓÇó Bachelor of Science in Mathematics with Specialization in Applied Statistics  \nΓÇó Bachelor of Science in Mathematics with Specialization in Business Applications  \nΓÇó Bachelor of Science in Mathematics with Specialization in Computer Science  \nΓÇó BS Biology  \nΓÇó BS Environmental Science  \nΓÇó BS Food Technology  \nΓÇó BS Medical Technology / Medical Laboratory Science  \n\nWhich program interests you? I can provide details on curriculum, admission, or career paths.	\N	2025-11-20 21:15:11.94
a8b9e9d4-b9d4-4147-a8b5-2654820aed22	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	who is the college of science dean?	The Deans of the College of Science are: Thelma V. Pagtalunan.	\N	2025-11-20 21:15:18.305
fc38e8dd-816d-4e0e-93ec-061e65ff04e4	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	what is love?	Love is a complex and multifaceted emotion that can encompass a range of feelings, from deep affection and care to passion and attachment. It can manifest in various forms, including romantic love, familial love, platonic love, and self-love. Philosophers, psychologists, and poets have long explored the nature of love, emphasizing its significance in human relationships and experiences. \n\nIn essence, love often involves a combination of emotional connection, commitment, and a desire for the well-being of others. It plays a crucial role in forming bonds, fostering empathy, and creating a sense of belonging among individuals.	\N	2025-11-20 21:17:32.49
1b205eb1-5f95-42d0-8ed7-2fb101b5d1d9	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	what are the courses in cs?	**Bulacan State University ΓÇô College of Science**\n\n      Here are the official undergraduate programs as of 2025:\n\n      ΓÇó Bachelor of Science in Mathematics with Specialization in Applied Statistics  \n      ΓÇó Bachelor of Science in Mathematics with Specialization in Business Applications  \n      ΓÇó Bachelor of Science in Mathematics with Specialization in Computer Science  \n      ΓÇó BS Biology  \n      ΓÇó BS Environmental Science  \n      ΓÇó BS Food Technology  \n      ΓÇó BS Medical Technology / Medical Laboratory Science  \n\n      Which program interests you? I can provide details on curriculum, admission, or career paths.	\N	2025-11-20 21:17:42.786
5c671631-e6f3-4433-b0df-578472cb6964	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	what are the courses in college of science?	**Bulacan State University ΓÇô College of Science**\n\n      Here are the official undergraduate programs as of 2025:\n\n      ΓÇó Bachelor of Science in Mathematics with Specialization in Applied Statistics  \n      ΓÇó Bachelor of Science in Mathematics with Specialization in Business Applications  \n      ΓÇó Bachelor of Science in Mathematics with Specialization in Computer Science  \n      ΓÇó BS Biology  \n      ΓÇó BS Environmental Science  \n      ΓÇó BS Food Technology  \n      ΓÇó BS Medical Technology / Medical Laboratory Science  \n\n      Which program interests you? I can provide details on curriculum, admission, or career paths.	\N	2025-11-20 21:18:00.84
362ed982-5b2a-4987-adee-e421719eb8b2	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	who is the college of science dean?	The Deans of the College of Science are: Thelma V. Pagtalunan.	\N	2025-11-20 21:18:15.457
e581c2e2-802d-40a4-9c27-11e46d7ab6c7	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	who is the associate dean?	The Deans of the College of Science are: Thelma V. Pagtalunan.	\N	2025-11-20 21:18:34.279
b4920cd6-186d-461e-bdff-a2c8686b82fa	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	who is the associate dean?	The Deans of the College of Science are: Thelma V. Pagtalunan.	\N	2025-11-20 21:22:14.195
35584f36-f130-402f-ae6f-b3b95094aaac	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	who is the associate dean?	The Associate Deans of the College of Science are: Benedict M. Estrella.	\N	2025-11-20 21:22:56.544
56d0831e-f1ed-4097-a964-d0e5a9b1c6cf	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	who is the dean?	The Deans of the College of Science are: Thelma V. Pagtalunan.	\N	2025-11-20 21:23:05.627
3e95a895-222c-45ff-8d35-825580831816	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Program: Bachelor of Science in Mathematics with Specialization in Computer Science (BSM CS).\nCurriculum:\nΓÇó MAT 102 (Fundamentals of Computing), Year 1, Sem 1, Units 3, Prerequisites: -\nΓÇó MAT 103 (Calculus I), Year 1, Sem 1, Units 5, Prerequisites: -\nΓÇó MMW 101 (Mathematics in the Modern World), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó PCM 101 (Purposive Communication), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó PAL 101 (Panitikan at Lipunan), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó MCS 102a (Computer Programming I), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó PE 10 (PATHFIT 1), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó NSTP 10 (National Service Training Program 1), Year 1, Sem 1, Units 3, Prerequisites: None\nFaculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	what are the subjects in 1st sem in bsm cs?	Here are the 1st semester subjects for Computer Science:\nΓÇó MAT 102 - Fundamentals of Computing (Prerequisites: -)\nΓÇó MAT 103 - Calculus I (Prerequisites: -)\nΓÇó MMW 101 - Mathematics in the Modern World\nΓÇó PCM 101 - Purposive Communication\nΓÇó PAL 101 - Panitikan at Lipunan\nΓÇó MCS 102a - Computer Programming I\nΓÇó PE 10 - PATHFIT 1\nΓÇó NSTP 10 - National Service Training Program 1	\N	2025-11-20 21:23:58.952
9fe117af-836b-4f5a-8015-26bbc435b447	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Program: Bachelor of Science in Mathematics with Specializations in Applied Statistics (BSM AS).\nFaculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	What are the 1st sem subjects for BSM AS?	Here are the 1st semester subjects for Computer Science:\nΓÇó MAT 102 - Fundamentals of Computing (Prerequisites: -)\nΓÇó MAT 103 - Calculus I (Prerequisites: -)\nΓÇó MMW 101 - Mathematics in the Modern World\nΓÇó PCM 101 - Purposive Communication\nΓÇó PAL 101 - Panitikan at Lipunan\nΓÇó MCS 102a - Computer Programming I\nΓÇó PE 10 - PATHFIT 1\nΓÇó NSTP 10 - National Service Training Program 1	\N	2025-11-20 21:31:39.756
b987e36f-82f0-482d-92f2-b4b56fb493b9	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Program: Bachelor of Science in Mathematics with Specializations in Applied Statistics (BSM AS).\nFaculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	What are the 1st sem subjects for BSM AS?	The specific subjects for the first semester of the Bachelor of Science in Mathematics with Specialization in Applied Statistics (BSM AS) may vary by academic year. However, students typically take foundational courses in mathematics, statistics, and general education during their first semester. \n\nFor the most accurate and updated information regarding the specific subjects for your first semester, I recommend checking the official academic catalog or contacting the faculty members directly. \n\nRemember, these are the official programs offered by BSU College of Science as of 2025:\n\n- Bachelor of Science in Mathematics with Specialization in Applied Statistics\n- Bachelor of Science in Mathematics with Specialization in Business Applications\n- Bachelor of Science in Mathematics with Specialization in Computer Science\n- Bachelor of Science in Biology\n- Bachelor of Science in Environmental Science\n- Bachelor of Science in Food Technology\n- Bachelor of Science in Medical Technology / Medical Laboratory Science	\N	2025-11-20 21:32:57.988
1f85f203-5004-4196-82d6-0e7221579c38	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\nΓÇó Professor, Science: Arcel Galvez\nΓÇó Instructor: Rosario M. Ponado\nΓÇó Faculty (Part-Time), Mathematics: Michelle S. Agustin\n	sino ang dean?	The Deans of the College of Science is Thelma V. Pagtalunan.	\N	2025-11-21 02:00:58.07
f2e466ba-58e4-4089-92b9-1ee7f93e1b3f	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Program: Bachelor of Science in Mathematics with Specialization in Computer Science (BSM CS).\nCurriculum:\nΓÇó MAT 102 (Fundamentals of Computing), Year 1, Sem 1, Units 3, Prerequisites: -\nΓÇó MAT 103 (Calculus I), Year 1, Sem 1, Units 5, Prerequisites: -\nΓÇó MMW 101 (Mathematics in the Modern World), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó PCM 101 (Purposive Communication), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó PAL 101 (Panitikan at Lipunan), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó MCS 102a (Computer Programming I), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó PE 10 (PATHFIT 1), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó NSTP 10 (National Service Training Program 1), Year 1, Sem 1, Units 3, Prerequisites: None\nFaculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	what are the subjects in 1st sem 1st year in bsm cs?	For the Bachelor of Science in Mathematics with Specialization in Computer Science (BSM CS), the subjects for the 1st semester of Year 1 are as follows:\n\nMAT 102 (Fundamentals of Computing) - 3 Units\nMAT 103 (Calculus I) - 5 Units\nMCS 102a (Computer Programming I) - 3 Units\nMMW 101 (Mathematics in the Modern World) - 3 Units\nNSTP 10 (National Service Training Program 1) - 3 Units\nPAL 101 (Panitikan at Lipunan) - 3 Units\nPCM 101 (Purposive Communication) - 3 Units\nPE 10 (PATHFIT 1) - 3 Units\n\nThese courses are designed to provide a strong foundational knowledge in the program.	\N	2025-11-20 21:33:25.315
2cedd296-3cc3-40ce-b752-ea1c7ee00cd8	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Program: Bachelor of Science in Mathematics with Specialization in Computer Science (BSM CS).\nCurriculum:\nΓÇó MAT 102 (Fundamentals of Computing), Year 1, Sem 1, Units 3, Prerequisites: -\nΓÇó MAT 103 (Calculus I), Year 1, Sem 1, Units 5, Prerequisites: -\nΓÇó MMW 101 (Mathematics in the Modern World), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó PCM 101 (Purposive Communication), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó PAL 101 (Panitikan at Lipunan), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó MCS 102a (Computer Programming I), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó PE 10 (PATHFIT 1), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó NSTP 10 (National Service Training Program 1), Year 1, Sem 1, Units 3, Prerequisites: None\nFaculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	what are the subjects in 1st sem 1st year in bsm cs?	Here are the 1st semester subjects for Computer Science:\nΓÇó MAT 102 - Fundamentals of Computing (Prerequisites: -)\nΓÇó MAT 103 - Calculus I (Prerequisites: -)\nΓÇó MMW 101 - Mathematics in the Modern World\nΓÇó PCM 101 - Purposive Communication\nΓÇó PAL 101 - Panitikan at Lipunan\nΓÇó MCS 102a - Computer Programming I\nΓÇó PE 10 - PATHFIT 1\nΓÇó NSTP 10 - National Service Training Program 1	\N	2025-11-20 21:35:52.117
6fc50419-6e09-4e26-9055-df00f55253a5	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Program: Bachelor of Science in Mathematics with Specialization in Computer Science (BSM CS).\nCurriculum:\nΓÇó MAT 102 (Fundamentals of Computing), Year 1, Sem 1, Units 3, Prerequisites: -\nΓÇó MAT 103 (Calculus I), Year 1, Sem 1, Units 5, Prerequisites: -\nΓÇó MMW 101 (Mathematics in the Modern World), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó PCM 101 (Purposive Communication), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó PAL 101 (Panitikan at Lipunan), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó MCS 102a (Computer Programming I), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó PE 10 (PATHFIT 1), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó NSTP 10 (National Service Training Program 1), Year 1, Sem 1, Units 3, Prerequisites: None\nFaculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	what are the subjects in 1st sem 1st year in bsm cs?	Here are the 1st semester subjects for Computer Science:\nΓÇó MAT 102 - Fundamentals of Computing (Prerequisites: -)\nΓÇó MAT 103 - Calculus I (Prerequisites: -)\nΓÇó MMW 101 - Mathematics in the Modern World\nΓÇó PCM 101 - Purposive Communication\nΓÇó PAL 101 - Panitikan at Lipunan\nΓÇó MCS 102a - Computer Programming I\nΓÇó PE 10 - PATHFIT 1\nΓÇó NSTP 10 - National Service Training Program 1	\N	2025-11-20 21:36:40.971
ffa653e2-b655-4adb-9b51-722f8501dc9b	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Program: Bachelor of Science in Mathematics with Specialization in Computer Science (BSM CS).\nCurriculum:\nΓÇó MAT 102 (Fundamentals of Computing), Year 1, Sem 1, Units 3, Prerequisites: -\nΓÇó MAT 103 (Calculus I), Year 1, Sem 1, Units 5, Prerequisites: -\nΓÇó MMW 101 (Mathematics in the Modern World), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó PCM 101 (Purposive Communication), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó PAL 101 (Panitikan at Lipunan), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó MCS 102a (Computer Programming I), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó PE 10 (PATHFIT 1), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó NSTP 10 (National Service Training Program 1), Year 1, Sem 1, Units 3, Prerequisites: None\nFaculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	what are the subjects in 1st sem 1st year in bsm cs?	For the Bachelor of Science in Mathematics with Specialization in Computer Science (BSM CS), the subjects for the 1st semester of Year 1 are as follows:\n\nMAT 102 (Fundamentals of Computing) - 3 Units\nMAT 103 (Calculus I) - 5 Units\nMCS 102a (Computer Programming I) - 3 Units\nMMW 101 (Mathematics in the Modern World) - 3 Units\nNSTP 10 (National Service Training Program 1) - 3 Units\nPAL 101 (Panitikan at Lipunan) - 3 Units\nPCM 101 (Purposive Communication) - 3 Units\nPE 10 (PATHFIT 1) - 3 Units\n\nThese courses are designed to provide a strong foundational knowledge in the program.	\N	2025-11-20 21:39:22.442
6556bd34-20a2-47e1-9e69-093cd23a3f6e	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Program: Bachelor of Science in Mathematics with Specializations in Business Applications (BSM BA).\nFaculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	what are the subjects in 1st sem 1st year in bsm ba?	Sorry, I could not find the subjects for Bachelor of Science in Mathematics with Specializations in Business Applications Year 1, Semester 1.	\N	2025-11-20 21:39:29.765
90b1b502-3836-41d2-a8b2-08ec8d55f401	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	who is the associate dean?	The Associate Deans of the College of Science is Benedict M. Estrella.	\N	2025-11-20 21:39:58.662
76b78c6c-13d2-4c24-8722-bd13a218b58e	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	what are the courses in college of science?	**Bulacan State University ΓÇô College of Science**\n\n      Here are the official undergraduate programs as of 2025:\n\n      ΓÇó Bachelor of Science in Mathematics with Specialization in Applied Statistics  \n      ΓÇó Bachelor of Science in Mathematics with Specialization in Business Applications  \n      ΓÇó Bachelor of Science in Mathematics with Specialization in Computer Science  \n      ΓÇó BS Biology  \n      ΓÇó BS Environmental Science  \n      ΓÇó BS Food Technology  \n      ΓÇó BS Medical Technology / Medical Laboratory Science  \n\n      Which program interests you? I can provide details on curriculum, admission, or career paths.	\N	2025-11-20 21:40:13.344
2b2368d1-acc6-4392-8c48-f75ea3ea4e91	a7dac806-3132-44f6-b4fc-b0cd5a116952	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	who is the dean?	The Deans of the College of Science is Thelma V. Pagtalunan.	\N	2025-11-20 21:41:35.191
9d7d6149-8b34-4a3e-b3dc-17eff42b99e0	a7dac806-3132-44f6-b4fc-b0cd5a116952	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\n	courses	These are the official programs offered by BSU College of Science as of 2025:\n\n- Bachelor of Science in Mathematics with Specialization in Applied Statistics\n- Bachelor of Science in Mathematics with Specialization in Business Applications\n- Bachelor of Science in Mathematics with Specialization in Computer Science\n- Bachelor of Science in Biology\n- Bachelor of Science in Environmental Science\n- Bachelor of Science in Food Technology\n- Bachelor of Science in Medical Technology / Medical Laboratory Science\n\nIf you have any questions about specific programs or need further information, feel free to ask!	\N	2025-11-20 21:41:47.35
4e3e6e82-d82e-437d-9219-211429db277e	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\nΓÇó Professor, Science: Arcel Galvez\n	Who is sir arcel?	The AI service is temporarily unavailable. Please try again later.	\N	2025-11-21 00:20:30.447
9a848162-380c-409a-9941-714634b7e90d	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\nΓÇó Professor, Science: Arcel Galvez\n	Who is sir arcel	Sir Arcel Galvez is a Professor in the College of Science at Bulacan State University. He is part of the faculty that contributes to the academic development and guidance of students within the college. If you have specific questions about his courses or research, it would be best to reach out to him directly or consult the college's official resources.	\N	2025-11-21 00:22:29.163
0e7bda6f-41d4-4d90-8aa6-fa6678471f64	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\nΓÇó Professor, Science: Arcel Galvez\nΓÇó Instructor: Rosario M. Ponado\n	hello	Hello! How can I assist you today? If you have any questions about the programs or offerings at the College of Science, feel free to ask!	\N	2025-11-21 00:37:18.558
a6271df4-99bc-437b-b4a8-8ecfddede2f9	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\nΓÇó Professor, Science: Arcel Galvez\nΓÇó Instructor: Rosario M. Ponado\n	who is sir arcel	Sir Arcel Galvez is a faculty member at Bulacan State University ΓÇô College of Science. He holds the position of Professor in the Science department, contributing to the academic development and instruction of students within the college. If you have specific questions about his courses or areas of expertise, feel free to ask!	\N	2025-11-21 00:46:04.083
0fae3f38-a0a7-4ad3-9366-7af3c98e5656	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\nΓÇó Professor, Science: Arcel Galvez\nΓÇó Instructor: Rosario M. Ponado\nΓÇó Faculty (Part-Time), Mathematics: Michelle S. Agustin\n	who is ma'am michelle?	Ma'am Michelle S. Agustin is a part-time faculty member in the Mathematics department at Bulacan State University's College of Science. She contributes to the educational development of students in the field of Mathematics. If you have any specific questions about her courses or her expertise, feel free to ask!	\N	2025-11-21 00:48:37.377
e03e65b0-0485-4dc6-8464-a1048aa5ddf3	a7dac806-3132-44f6-b4fc-b0cd5a116952	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\nΓÇó Professor, Science: Arcel Galvez\nΓÇó Instructor: Rosario M. Ponado\nΓÇó Faculty (Part-Time), Mathematics: Michelle S. Agustin\n	how to request petition in bulacan state	To request a petition at Bulacan State University, you typically need to follow these steps:\n\n1. **Identify the Type of Petition**: Determine whether your petition is academic (e.g., grade appeal, leave of absence) or administrative (e.g., enrollment issues).\n\n2. **Prepare Required Documents**: Gather any necessary documentation that supports your petition. This may include forms, written statements, and relevant evidence.\n\n3. **Consult the Appropriate Office**: Visit or contact the office relevant to your petition (e.g., RegistrarΓÇÖs Office, Office of Student Affairs) to get specific guidelines and forms needed for your request.\n\n4. **Fill Out the Petition Form**: Complete the petition form accurately, providing all required information.\n\n5. **Submit Your Petition**: Submit your completed petition along with supporting documents to the appropriate office. Keep a copy for your records.\n\n6. **Follow Up**: Check back with the office for updates on your petition status.\n\nMake sure to check the official university website or contact the administrative office for any specific procedures or updates.	\N	2025-11-21 00:55:03.729
3a4e7345-be0b-46e7-9639-05a527ce46ce	a7dac806-3132-44f6-b4fc-b0cd5a116952	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\nΓÇó Professor, Science: Arcel Galvez\nΓÇó Instructor: Rosario M. Ponado\nΓÇó Faculty (Part-Time), Mathematics: Michelle S. Agustin\n	how to request petition classes in college of science?	**Bulacan State University ΓÇô College of Science**\n\n      Here are the official undergraduate programs as of 2025:\n\n      ΓÇó Bachelor of Science in Mathematics with Specialization in Applied Statistics  \n      ΓÇó Bachelor of Science in Mathematics with Specialization in Business Applications  \n      ΓÇó Bachelor of Science in Mathematics with Specialization in Computer Science  \n      ΓÇó BS Biology  \n      ΓÇó BS Environmental Science  \n      ΓÇó BS Food Technology  \n      ΓÇó BS Medical Technology / Medical Laboratory Science  \n\n      Which program interests you? I can provide details on curriculum, admission, or career paths.	\N	2025-11-21 00:55:56.695
af1e10d3-d6ea-4fef-b91d-a5adb0681eef	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Program: Bachelor of Science in Mathematics with Specialization in Computer Science (BSM CS).\nCurriculum:\nΓÇó MAT 102 (Fundamentals of Computing), Year 1, Sem 1, Units 3, Prerequisites: -\nΓÇó MAT 103 (Calculus I), Year 1, Sem 1, Units 5, Prerequisites: -\nΓÇó MMW 101 (Mathematics in the Modern World), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó PCM 101 (Purposive Communication), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó PAL 101 (Panitikan at Lipunan), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó MCS 102a (Computer Programming I), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó PE 10 (PATHFIT 1), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó NSTP 10 (National Service Training Program 1), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó PCM101 (Purposive communication), Year 1, Sem 1, Units 5, Prerequisites: None\nFaculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\nΓÇó Professor, Science: Arcel Galvez\nΓÇó Instructor: Rosario M. Ponado\nΓÇó Faculty (Part-Time), Mathematics: Michelle S. Agustin\n	what is the subject in the 1st sem 1st year of BSM CS ?	For the Bachelor of Science in Mathematics with Specialization in Computer Science (BSM CS), the subjects for the 1st semester of Year 1 are as follows:\n\nMAT 102 (Fundamentals of Computing) - 3 Units\nMAT 103 (Calculus I) - 5 Units\nMCS 102a (Computer Programming I) - 3 Units\nMMW 101 (Mathematics in the Modern World) - 3 Units\nNSTP 10 (National Service Training Program 1) - 3 Units\nPAL 101 (Panitikan at Lipunan) - 3 Units\nPCM 101 (Purposive Communication) - 3 Units\nPCM101 (Purposive communication) - 5 Units\nPE 10 (PATHFIT 1) - 3 Units\n\nThese courses are designed to provide a strong foundational knowledge in the program.	\N	2025-11-21 02:00:44.723
b315659a-0337-44d5-8836-7bd23e8fcfe9	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\nΓÇó Professor, Science: Arcel Galvez\nΓÇó Instructor: Rosario M. Ponado\nΓÇó Faculty (Part-Time), Mathematics: Michelle S. Agustin\n	sino ang associate dean?	The Associate Deans of the College of Science is Benedict M. Estrella.	\N	2025-11-21 02:01:19.2
46f3d06c-1e9f-434b-98f4-1c90531e5813	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\nΓÇó Professor, Science: Arcel Galvez\nΓÇó Instructor: Rosario M. Ponado\nΓÇó Faculty (Part-Time), Mathematics: Michelle S. Agustin\n	what program is mat 102?	MAT 102 typically refers to a specific mathematics course, which may vary by institution. At Bulacan State University, courses like MAT 102 could be part of the curriculum for programs related to mathematics. \n\nIf you are looking for undergraduate programs in the College of Science, here is the official list:\n\n### Official Undergraduate Programs ΓÇô College of Science:\n- Bachelor of Science in Mathematics with Specialization in Applied Statistics\n- Bachelor of Science in Mathematics with Specialization in Business Applications\n- Bachelor of Science in Mathematics with Specialization in Computer Science\n- Bachelor of Science in Biology\n- Bachelor of Science in Environmental Science\n- Bachelor of Science in Food Technology\n- Bachelor of Science in Medical Technology / Medical Laboratory Science\n\nThese are the official programs offered by BSU College of Science as of 2025. For more specific details about MAT 102, I recommend checking your course syllabus or consulting with your instructor.	\N	2025-11-21 02:05:47.642
ad790656-cbc5-4350-bd42-38465afbdec6	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\nΓÇó Professor, Science: Arcel Galvez\nΓÇó Instructor: Rosario M. Ponado\nΓÇó Faculty (Part-Time), Mathematics: Michelle S. Agustin\n	what is love?	Love is a complex and multifaceted emotion that can encompass a range of feelings, behaviors, and beliefs associated with strong feelings of affection, warmth, and attachment. It can manifest in various forms, including romantic love, familial love, platonic love, and self-love. \n\nPhilosophers, psychologists, and poets have all attempted to define love, often emphasizing its importance in human relationships and its role in promoting connection, empathy, and understanding. Love can inspire individuals to act selflessly and can also be a source of joy and fulfillment.\n\nUltimately, love is a deeply personal experience that can vary significantly from one person to another, and its expression can be influenced by cultural, social, and individual factors.	\N	2025-11-21 02:06:10.338
4414f4cf-be5b-4fbd-adf5-702da406f26e	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\nΓÇó Professor, Science: Arcel Galvez\nΓÇó Instructor: Rosario M. Ponado\nΓÇó Faculty (Part-Time), Mathematics: Michelle S. Agustin\n	ano ang pag mamahal?	Ang pag-ibig o pagmamahal ay isang malalim at masalimuot na damdamin na nag-uugnay sa mga tao. Ito ay maaaring ipakita sa iba't ibang anyo, tulad ng pagmamahal sa pamilya, kaibigan, o romantikong relasyon. Kasama sa mga aspeto ng pagmamahal ang pag-unawa, respeto, at suporta sa isa't isa.\n\nSa konteksto ng mga relasyon, ang pagmamahal ay kadalasang nagdadala ng kaligayahan at kasiyahan, ngunit maaari rin itong magdulot ng hamon at pagsubok. Mahalaga ang komunikasyon at pagtanggap sa isa't isa upang mapanatili ang isang malusog na ugnayan.\n\nKung ikaw ay may mga karagdagang tanong o nais malaman ang higit pa tungkol sa mga emosyon at relasyon, huwag mag-atubiling magtanong!	\N	2025-11-21 02:06:30.238
437f7305-2815-4d9d-b19f-ea4c10f7f28d	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\nΓÇó Professor, Science: Arcel Galvez\nΓÇó Instructor: Rosario M. Ponado\nΓÇó Faculty (Part-Time), Mathematics: Michelle S. Agustin\n	what is the pre requesit of calculus 1 	The prerequisite for Calculus 1 typically includes a solid understanding of high school algebra and trigonometry. Students should be comfortable with functions, graphs, and basic mathematical operations. It's important to have a good grasp of these concepts to succeed in Calculus 1, as it builds on these foundational skills. \n\nIf you need specific advice on preparing for Calculus 1 or related courses, feel free to ask!	\N	2025-11-21 02:59:27.899
753f23a5-f165-4c96-8fa3-9b21df64cd48	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\nΓÇó Professor, Science: Arcel Galvez\nΓÇó Instructor: Rosario M. Ponado\nΓÇó Faculty (Part-Time), Mathematics: Michelle S. Agustin\n	what is the pre requisit of Calculus II	The prerequisite for Calculus II typically includes the successful completion of Calculus I. This foundational course usually covers limits, derivatives, and basic integration techniques, which are essential for understanding the concepts presented in Calculus II, such as advanced integration techniques, sequences, and series. \n\nFor the most accurate and specific information regarding prerequisites for Calculus II at Bulacan State University, I recommend checking with your academic advisor or the official course catalog.	\N	2025-11-21 03:03:25.303
3a4e1b16-99d7-4bef-8e5c-4ea15ec4b779	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\nΓÇó Professor, Science: Arcel Galvez\nΓÇó Instructor: Rosario M. Ponado\nΓÇó Faculty (Part-Time), Mathematics: Michelle S. Agustin\n	what is calculus I	Calculus I, often referred to as Differential Calculus, is a foundational course in calculus that focuses on the concepts of limits, derivatives, and the applications of these concepts. \n\nKey topics typically covered in Calculus I include:\n\n- **Limits**: Understanding the behavior of functions as they approach specific points or infinity.\n- **Derivatives**: Learning how to calculate the rate of change of a function and interpreting this in various contexts, such as motion and optimization.\n- **Rules of Differentiation**: Applying rules such as the product, quotient, and chain rules to find derivatives of complex functions.\n- **Applications of Derivatives**: Exploring how derivatives are used to solve problems involving rates of change, tangents to curves, and optimization problems.\n\nThis course is crucial for students pursuing degrees in fields such as mathematics, physics, engineering, and the sciences, as it provides essential tools for analyzing change and motion.	\N	2025-11-21 03:13:19.806
de20e3c6-4b27-42c2-ac47-22bb5b4e24e0	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\nΓÇó Professor, Science: Arcel Galvez\nΓÇó Instructor: Rosario M. Ponado\nΓÇó Faculty (Part-Time), Mathematics: Michelle S. Agustin\n	who is the dean now of college of science?	The Deans of the College of Science is Thelma V. Pagtalunan.	\N	2025-11-21 05:00:58.673
745d0a53-6f78-43d1-bad1-3f71e41ed0d2	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Program: Bachelor of Science in Mathematics with Specialization in Computer Science (BSM CS).\nCurriculum:\nΓÇó MMW 101 (Mathematics in the Modern World), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó PCM 101 (Purposive Communication), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó PAL 101 (Panitikan at Lipunan), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó MCS 102a (Computer Programming I), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó PE 10 (PATHFIT 1), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó NSTP 10 (National Service Training Program 1), Year 1, Sem 1, Units 3, Prerequisites: None\nΓÇó PCM101 (Purposive communication), Year 1, Sem 1, Units 5, Prerequisites: None\nΓÇó MAT 102 (Fundamentals of Computing), Year 1, Sem 1, Units 3, Prerequisites: -\nΓÇó MAT 105 (Calculus II), Year 2, Sem 1, Units 5, Prerequisites: MAT 103\nΓÇó RPH301 (Readings of Philippines History), Year 3, Sem 1, Units 3, Prerequisites: None\nFaculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\nΓÇó Professor, Science: Arcel Galvez\nΓÇó Instructor: Rosario M. Ponado\nΓÇó Faculty (Part-Time), Mathematics: Michelle S. Agustin\n	what are the subjects of BSM CS 1st year , 1st sem?	For the Bachelor of Science in Mathematics with Specialization in Computer Science (BSM CS), the subjects for the 1st semester of Year 1 are as follows:\n\nMAT 102 (Fundamentals of Computing) - 3 Units\nMCS 102a (Computer Programming I) - 3 Units\nMMW 101 (Mathematics in the Modern World) - 3 Units\nNSTP 10 (National Service Training Program 1) - 3 Units\nPAL 101 (Panitikan at Lipunan) - 3 Units\nPCM 101 (Purposive Communication) - 3 Units\nPCM101 (Purposive communication) - 5 Units\nPE 10 (PATHFIT 1) - 3 Units\n\nThese courses are designed to provide a strong foundational knowledge in the program.	\N	2025-11-21 05:04:19.663
17ab0264-cb91-4fba-9c09-b19f5dc783fc	a7dac806-3132-44f6-b4fc-b0cd5a116952	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\nΓÇó Professor, Science: Arcel Galvez\nΓÇó Instructor: Rosario M. Ponado\nΓÇó Faculty (Part-Time), Mathematics: Michelle S. Agustin\n	what is love?	Love is a complex and multifaceted emotion that encompasses a range of feelings, from deep affection and care for someone to a strong attraction. It can manifest in various forms, including romantic love, familial love, platonic love, and self-love. \n\nPhilosophers and psychologists have studied love extensively, suggesting it involves emotional attachment, intimacy, passion, and commitment. Love can inspire joy and fulfillment but may also lead to challenges and heartache. Ultimately, it plays a significant role in human relationships and personal well-being. \n\nIf you're looking for a more specific aspect of love or how it relates to a particular context, feel free to ask!	\N	2025-11-23 16:11:33.951
a8a1b9c3-029c-448f-9472-f0716b127e74	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\nΓÇó Professor, Science: Arcel Galvez\nΓÇó Instructor: Rosario M. Ponado\nΓÇó Faculty (Part-Time), Mathematics: Michelle S. Agustin\n	what is the prerequisite of MAT 105?	The prerequisite for MAT 105 is typically MAT 104 (or an equivalent course), which ensures that students have the necessary foundational knowledge in mathematics before progressing to MAT 105. However, for the most accurate and updated information, please consult the official course catalog or academic advisor at Bulacan State University.	\N	2025-11-27 09:53:20.777
4c665c97-0b13-4d77-875a-44393ae310e4	243c5c87-92da-40f7-b985-e950b1f320d2	QUESTION	Faculty Members:\nΓÇó Dean: Thelma V. Pagtalunan\nΓÇó Associate Dean: Benedict M. Estrella\nΓÇó Professor, Science: Arcel Galvez\nΓÇó Instructor: Rosario M. Ponado\nΓÇó Faculty (Part-Time), Mathematics: Michelle S. Agustin\nΓÇó Professor: John Jeslhee Del Rosario\n	who si the professor in the cs?	The professor in the College of Science at Bulacan State University is **John Jeslhee Del Rosario**. If you have any more questions or need further information, feel free to ask!	\N	2025-11-27 10:06:32.301
\.


--
-- Data for Name: AccessibilitySettings; Type: TABLE DATA; Schema: public; Owner: tisa_admin
--

COPY public."AccessibilitySettings" (id, "userId", "fontSize", "fontFamily", "highContrast", "colorScheme", "reducedMotion", "textToSpeechEnabled", "ttsSpeed", "ttsVoice", "speechToTextEnabled", "keyboardOnly", "captionsEnabled", "transcriptsEnabled", "signLanguageEnabled", "createdAt", "updatedAt") FROM stdin;
e76487a1-f63a-47cb-a6aa-998fa00b0d46	33770ace-9706-4c86-aa82-d1c796ea0c60	18	OpenDyslexic	f	dyslexia	f	t	1.2	default	f	f	t	t	f	2025-11-20 18:27:31.495	2025-11-20 18:27:31.495
85cf3308-118c-4247-9b39-f40567a08bd7	a7dac806-3132-44f6-b4fc-b0cd5a116952	16	Arial	f	default	f	f	1	default	f	f	t	t	f	2025-11-20 21:41:11.737	2025-11-20 21:41:11.737
\.


--
-- Data for Name: Achievement; Type: TABLE DATA; Schema: public; Owner: tisa_admin
--

COPY public."Achievement" (id, "userId", type, title, description, icon, points, "earnedAt") FROM stdin;
7b370ccb-7a01-4a7a-8472-dc783beaf56f	33770ace-9706-4c86-aa82-d1c796ea0c60	COURSE_COMPLETION	First Lesson Complete!	Completed your first lesson in Introduction to Algebra	≡ƒÄ»	10	2025-11-20 18:27:31.53
\.


--
-- Data for Name: Assessment; Type: TABLE DATA; Schema: public; Owner: tisa_admin
--

COPY public."Assessment" (id, "courseId", "lessonId", title, description, "timeLimit", "passingScore", "maxAttempts", questions, "isPublished", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AssessmentResult; Type: TABLE DATA; Schema: public; Owner: tisa_admin
--

COPY public."AssessmentResult" (id, "assessmentId", "userId", score, answers, "timeSpent", passed, attempt, "completedAt") FROM stdin;
\.


--
-- Data for Name: Assignment; Type: TABLE DATA; Schema: public; Owner: tisa_admin
--

COPY public."Assignment" (id, "courseId", "lessonId", title, description, type, "maxScore", "dueDate", "allowLateSubmission", instructions, rubric, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ChatSession; Type: TABLE DATA; Schema: public; Owner: tisa_admin
--

COPY public."ChatSession" (id, "userId", title, messages, "createdAt", "updatedAt") FROM stdin;
4ae028a5-5930-4d43-908c-87a57a745021	243c5c87-92da-40f7-b985-e950b1f320d2	New Chat	[]	2025-11-20 18:47:38.192	2025-11-20 18:47:38.192
9d6490a4-06fe-4c8a-b244-b8ddca1e9ccf	a7dac806-3132-44f6-b4fc-b0cd5a116952	who is the dean	[{"role": "user", "content": "who is the dean?"}, {"role": "ai", "content": "The Deans of the College of Science is Thelma V. Pagtalunan."}, {"role": "user", "content": "courses"}, {"role": "ai", "content": "These are the official programs offered by BSU College of Science as of 2025:\\n\\n- Bachelor of Science in Mathematics with Specialization in Applied Statistics\\n- Bachelor of Science in Mathematics with Specialization in Business Applications\\n- Bachelor of Science in Mathematics with Specialization in Computer Science\\n- Bachelor of Science in Biology\\n- Bachelor of Science in Environmental Science\\n- Bachelor of Science in Food Technology\\n- Bachelor of Science in Medical Technology / Medical Laboratory Science\\n\\nIf you have any questions about specific programs or need further information, feel free to ask!"}, {"role": "user", "content": "how to request petition in bulacan state"}, {"role": "ai", "content": "To request a petition at Bulacan State University, you typically need to follow these steps:\\n\\n1. **Identify the Type of Petition**: Determine whether your petition is academic (e.g., grade appeal, leave of absence) or administrative (e.g., enrollment issues).\\n\\n2. **Prepare Required Documents**: Gather any necessary documentation that supports your petition. This may include forms, written statements, and relevant evidence.\\n\\n3. **Consult the Appropriate Office**: Visit or contact the office relevant to your petition (e.g., RegistrarΓÇÖs Office, Office of Student Affairs) to get specific guidelines and forms needed for your request.\\n\\n4. **Fill Out the Petition Form**: Complete the petition form accurately, providing all required information.\\n\\n5. **Submit Your Petition**: Submit your completed petition along with supporting documents to the appropriate office. Keep a copy for your records.\\n\\n6. **Follow Up**: Check back with the office for updates on your petition status.\\n\\nMake sure to check the official university website or contact the administrative office for any specific procedures or updates."}, {"role": "user", "content": "how to request petition classes in college of science?"}, {"role": "ai", "content": "**Bulacan State University ΓÇô College of Science**\\n\\n      Here are the official undergraduate programs as of 2025:\\n\\n      ΓÇó Bachelor of Science in Mathematics with Specialization in Applied Statistics  \\n      ΓÇó Bachelor of Science in Mathematics with Specialization in Business Applications  \\n      ΓÇó Bachelor of Science in Mathematics with Specialization in Computer Science  \\n      ΓÇó BS Biology  \\n      ΓÇó BS Environmental Science  \\n      ΓÇó BS Food Technology  \\n      ΓÇó BS Medical Technology / Medical Laboratory Science  \\n\\n      Which program interests you? I can provide details on curriculum, admission, or career paths."}]	2025-11-20 21:41:23.643	2025-11-21 00:55:56.715
132d7214-3d1f-4522-a3aa-74dc72d15efb	243c5c87-92da-40f7-b985-e950b1f320d2	who is the dean now of college of scienc...	[{"role": "user", "content": "who is the dean now of college of science?"}, {"role": "ai", "content": "The Deans of the College of Science is Thelma V. Pagtalunan."}, {"role": "user", "content": "what are the subjects of BSM CS 1st year , 1st sem?"}, {"role": "ai", "content": "For the Bachelor of Science in Mathematics with Specialization in Computer Science (BSM CS), the subjects for the 1st semester of Year 1 are as follows:\\n\\nMAT 102 (Fundamentals of Computing) - 3 Units\\nMCS 102a (Computer Programming I) - 3 Units\\nMMW 101 (Mathematics in the Modern World) - 3 Units\\nNSTP 10 (National Service Training Program 1) - 3 Units\\nPAL 101 (Panitikan at Lipunan) - 3 Units\\nPCM 101 (Purposive Communication) - 3 Units\\nPCM101 (Purposive communication) - 5 Units\\nPE 10 (PATHFIT 1) - 3 Units\\n\\nThese courses are designed to provide a strong foundational knowledge in the program."}, {"role": "user", "content": "what is the prerequisite of MAT 105?"}, {"role": "ai", "content": "The prerequisite for MAT 105 is typically MAT 104 (or an equivalent course), which ensures that students have the necessary foundational knowledge in mathematics before progressing to MAT 105. However, for the most accurate and updated information, please consult the official course catalog or academic advisor at Bulacan State University."}, {"role": "user", "content": "who si the professor in the cs?"}, {"role": "ai", "content": "The professor in the College of Science at Bulacan State University is **John Jeslhee Del Rosario**. If you have any more questions or need further information, feel free to ask!"}]	2025-11-21 05:00:37.026	2025-11-27 10:06:32.317
\.


--
-- Data for Name: Course; Type: TABLE DATA; Schema: public; Owner: tisa_admin
--

COPY public."Course" (id, title, description, thumbnail, level, status, duration, price, tags, "creatorId", "teacherId", "createdAt", "updatedAt") FROM stdin;
0733e96a-60ff-4d5e-8079-5ce03d50b628	Introduction to Algebra	Learn fundamental algebraic concepts with AI-powered personalized learning paths. Perfect for beginners!	\N	BEGINNER	PUBLISHED	480	0	{Math,Algebra,Beginner,STEM}	4119bf91-9744-4419-abb1-5052174767f4	4119bf91-9744-4419-abb1-5052174767f4	2025-11-20 18:27:31.502	2025-11-20 18:27:31.502
4f222cf3-f807-4645-929d-0936d859e5d5	Biology Basics: Cell Structure	Explore the fascinating world of cells with interactive 3D models and AI tutor support	\N	BEGINNER	PUBLISHED	360	0	{Science,Biology,Cells,"Life Science"}	4119bf91-9744-4419-abb1-5052174767f4	4119bf91-9744-4419-abb1-5052174767f4	2025-11-20 18:27:31.51	2025-11-20 18:27:31.51
\.


--
-- Data for Name: CourseReview; Type: TABLE DATA; Schema: public; Owner: tisa_admin
--

COPY public."CourseReview" (id, "courseId", "userId", rating, comment, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CurriculumEntry; Type: TABLE DATA; Schema: public; Owner: tisa_admin
--

COPY public."CurriculumEntry" (id, "programId", "yearLevel", semester, "courseCode", "subjectName", units, "createdAt", "updatedAt", prerequisites) FROM stdin;
cmi7ulqj80007u8j00axp4ruw	de89ee6b-3f70-41fa-b249-fec0e21f219c	1	1	MMW 101	Mathematics in the Modern World	3	2025-11-20 19:52:38.035	2025-11-20 19:52:38.035	{}
cmi7um0370009u8j01kraxrz4	de89ee6b-3f70-41fa-b249-fec0e21f219c	1	1	PCM 101	Purposive Communication	3	2025-11-20 19:52:50.419	2025-11-20 19:52:50.419	{}
cmi7umcak000bu8j0eyxl2wlo	de89ee6b-3f70-41fa-b249-fec0e21f219c	1	1	PAL 101	Panitikan at Lipunan	3	2025-11-20 19:53:06.236	2025-11-20 19:53:06.236	{}
cmi7ukr5e0005u8j0oh4mam05	de89ee6b-3f70-41fa-b249-fec0e21f219c	1	1	MCS 102a	Computer Programming I	3	2025-11-20 19:51:52.177	2025-11-20 19:53:14.813	{}
cmi7un5se000du8j0opxta2m2	de89ee6b-3f70-41fa-b249-fec0e21f219c	1	1	PE 10	PATHFIT 1	3	2025-11-20 19:53:44.461	2025-11-20 19:53:44.461	{}
cmi7unezx000fu8j0kvofe3ho	de89ee6b-3f70-41fa-b249-fec0e21f219c	1	1	NSTP 10	National Service Training Program 1	3	2025-11-20 19:53:56.397	2025-11-20 19:53:56.397	{}
cmi859vsh00012dyqjyd0clp7	de89ee6b-3f70-41fa-b249-fec0e21f219c	1	1	PCM101	Purposive communication	5	2025-11-21 00:51:20.751	2025-11-21 00:52:00.815	{}
cmi7uirpd0001u8j0m8107i7a	de89ee6b-3f70-41fa-b249-fec0e21f219c	1	1	MAT 102	Fundamentals of Computing	3	2025-11-20 19:50:19.582	2025-11-21 03:00:38.439	{-}
cmi7uk3u30003u8j0go7re9qt	de89ee6b-3f70-41fa-b249-fec0e21f219c	2	1	MAT 105	Calculus II	5	2025-11-20 19:51:21.962	2025-11-21 03:02:41.169	{"MAT 103"}
cmi8aflzc00032dyqjgrdpt4x	de89ee6b-3f70-41fa-b249-fec0e21f219c	3	1	RPH301	Readings of Philippines History	3	2025-11-21 03:15:46.055	2025-11-21 03:15:46.055	{}
cmi8agxzf00052dyqbdikacmv	3d2525e8-6005-48a2-8300-10803091a87f	1	1	MAT 103	Calculus I	5	2025-11-21 03:16:48.266	2025-11-21 03:16:48.266	{}
\.


--
-- Data for Name: Enrollment; Type: TABLE DATA; Schema: public; Owner: tisa_admin
--

COPY public."Enrollment" (id, "userId", "courseId", status, progress, "enrolledAt", "completedAt", "lastAccessedAt") FROM stdin;
47b42fa2-4504-4a8f-91a8-24e5310b4431	33770ace-9706-4c86-aa82-d1c796ea0c60	0733e96a-60ff-4d5e-8079-5ce03d50b628	ACTIVE	33.33	2025-11-20 18:27:31.515	\N	2025-11-20 18:27:31.513
dac8f2b6-0de1-42b0-94fd-073a1141046e	ec4fc173-cbd4-4d9b-86bf-a24556e7581e	0733e96a-60ff-4d5e-8079-5ce03d50b628	ACTIVE	0	2025-11-20 18:27:31.519	\N	\N
f9a6f79f-1366-4209-8a96-81d5bc2c9e26	33770ace-9706-4c86-aa82-d1c796ea0c60	4f222cf3-f807-4645-929d-0936d859e5d5	ACTIVE	50	2025-11-20 18:27:31.522	\N	2025-11-20 18:27:31.52
e9fa900d-a6f6-4369-9fe8-41ac870d8d6b	a7dac806-3132-44f6-b4fc-b0cd5a116952	4f222cf3-f807-4645-929d-0936d859e5d5	ACTIVE	0	2025-11-21 03:21:01.351	\N	\N
\.


--
-- Data for Name: Faculty; Type: TABLE DATA; Schema: public; Owner: tisa_admin
--

COPY public."Faculty" (id, "firstName", "lastName", email, "position", college) FROM stdin;
fb1e3a2b-91ef-4ff4-9905-75c14d21fbae	Thelma V.	Pagtalunan	thelmavpagtalunan@tisa.com	Dean	College of Science
005b00c3-8d85-4560-95cb-efd6aaa66db8	Benedict M.	Estrella	estrella@tisa.com	Associate Dean	College of Science
3c980d96-7816-4598-be15-1917adba6087	Arcel	Galvez	arcelgalvez@tisa.com	Professor, Science	College of Science
835bb507-04e4-4ee1-94c9-ef2ac23a0028	Rosario M.	Ponado	rosarioponado@tisa.com	Instructor	College of Science
55595eca-8f17-4746-a4d3-b64166878c10	Michelle S.	Agustin	sample@tisa.com	Faculty (Part-Time), Mathematics	College of Science
ac86fba2-4c53-4972-aba8-45df8e062c6d	John Jeslhee	Del Rosario	jeslheedelrosario@gmail.com	Professor, Science	College of Science
\.


--
-- Data for Name: FacultySubject; Type: TABLE DATA; Schema: public; Owner: tisa_admin
--

COPY public."FacultySubject" (id, "facultyId", "subjectId") FROM stdin;
\.


--
-- Data for Name: GroupMessage; Type: TABLE DATA; Schema: public; Owner: tisa_admin
--

COPY public."GroupMessage" (id, "groupId", "userId", content, attachments, "createdAt") FROM stdin;
\.


--
-- Data for Name: Lesson; Type: TABLE DATA; Schema: public; Owner: tisa_admin
--

COPY public."Lesson" (id, "courseId", title, description, type, content, "videoUrl", "audioUrl", transcript, duration, "order", "isPublished", "createdAt", "updatedAt") FROM stdin;
a690ee06-f1e5-46c4-92f9-6400bffb9c19	0733e96a-60ff-4d5e-8079-5ce03d50b628	Welcome to Algebra	Introduction to algebraic thinking and basic concepts	VIDEO	{"videoId":"intro-algebra-001","description":"Learn what algebra is and why it matters","keyPoints":["Variables and constants","Expressions","Equations"]}	https://example.com/videos/intro-algebra.mp4	\N	Welcome to Introduction to Algebra. In this lesson, we will explore what algebra is...	15	1	t	2025-11-20 18:27:31.502	2025-11-20 18:27:31.502
bb0807d6-f454-4f7c-a905-0e9b9242981d	0733e96a-60ff-4d5e-8079-5ce03d50b628	Variables and Expressions	Understanding variables, constants, and algebraic expressions	INTERACTIVE	{"exercises":[{"question":"What is a variable?","type":"multiple-choice"},{"question":"Simplify: 2x + 3x","type":"short-answer"}]}	\N	\N	\N	20	2	t	2025-11-20 18:27:31.502	2025-11-20 18:27:31.502
f6e7ef51-0ca0-40e2-ab56-db1bb2189f65	0733e96a-60ff-4d5e-8079-5ce03d50b628	Solving Simple Equations	Learn to solve one-step and two-step equations	VIDEO	{"videoId":"solving-equations-001","examples":["x + 5 = 12","2x = 10","3x - 4 = 11"]}	https://example.com/videos/solving-equations.mp4	\N	Now lets learn how to solve simple equations step by step...	25	3	t	2025-11-20 18:27:31.502	2025-11-20 18:27:31.502
e57d5118-cadd-47d0-a0a0-6c883a6390f5	4f222cf3-f807-4645-929d-0936d859e5d5	Introduction to Cells	What are cells and why are they important?	VIDEO	{"videoId":"intro-cells-001","description":"Discover the building blocks of life"}	https://example.com/videos/intro-cells.mp4	\N	Cells are the basic unit of life. Every living organism is made of cells...	18	1	t	2025-11-20 18:27:31.51	2025-11-20 18:27:31.51
76ad942e-fccb-4b8b-bcf3-2842c62e4663	4f222cf3-f807-4645-929d-0936d859e5d5	Cell Parts and Functions	Learn about organelles and their roles	INTERACTIVE	{"interactiveModel":"3d-cell-model","organelles":["nucleus","mitochondria","cell membrane","cytoplasm"]}	\N	\N	\N	30	2	t	2025-11-20 18:27:31.51	2025-11-20 18:27:31.51
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: tisa_admin
--

COPY public."Message" (id, "senderId", "receiverId", subject, content, "isRead", "createdAt") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: tisa_admin
--

COPY public."Notification" (id, "userId", title, message, type, link, "isRead", "createdAt") FROM stdin;
3296f86d-1ad5-4197-bcb1-8a422aa62c0e	33770ace-9706-4c86-aa82-d1c796ea0c60	Welcome to AI Inclusive Learning!	Start your learning journey with personalized AI-powered education	info	/dashboard	f	2025-11-20 18:27:31.541
5a53464d-ce5d-4142-9b24-f63d5b3f55d2	33770ace-9706-4c86-aa82-d1c796ea0c60	New Lesson Available	Check out "Solving Simple Equations" in your Algebra course	success	/courses/0733e96a-60ff-4d5e-8079-5ce03d50b628	f	2025-11-20 18:27:31.544
\.


--
-- Data for Name: Progress; Type: TABLE DATA; Schema: public; Owner: tisa_admin
--

COPY public."Progress" (id, "userId", "lessonId", completed, "timeSpent", "lastPosition", attempts, score, "startedAt", "completedAt", "updatedAt") FROM stdin;
14e0a391-9075-485a-9267-78d7a76c2ae3	a7dac806-3132-44f6-b4fc-b0cd5a116952	e57d5118-cadd-47d0-a0a0-6c883a6390f5	f	0	\N	0	\N	2025-11-21 03:21:55.676	\N	2025-11-21 03:21:55.676
\.


--
-- Data for Name: Resource; Type: TABLE DATA; Schema: public; Owner: tisa_admin
--

COPY public."Resource" (id, "lessonId", title, type, url, size, "createdAt") FROM stdin;
\.


--
-- Data for Name: StudyGroup; Type: TABLE DATA; Schema: public; Owner: tisa_admin
--

COPY public."StudyGroup" (id, name, description, "courseId", "maxMembers", "createdAt", "updatedAt") FROM stdin;
1961fbe9-f126-4f92-b4ff-efc636f429ed	Algebra Study Buddies	A group for students learning algebra together	0733e96a-60ff-4d5e-8079-5ce03d50b628	10	2025-11-20 18:27:31.533	2025-11-20 18:27:31.533
\.


--
-- Data for Name: StudyGroupMember; Type: TABLE DATA; Schema: public; Owner: tisa_admin
--

COPY public."StudyGroupMember" (id, "groupId", "userId", role, "joinedAt") FROM stdin;
0e145191-ad5c-46d9-937b-be73c867c2e4	1961fbe9-f126-4f92-b4ff-efc636f429ed	33770ace-9706-4c86-aa82-d1c796ea0c60	admin	2025-11-20 18:27:31.533
984f2322-f497-4ab1-9aab-e416deb8d261	1961fbe9-f126-4f92-b4ff-efc636f429ed	ec4fc173-cbd4-4d9b-86bf-a24556e7581e	member	2025-11-20 18:27:31.533
\.


--
-- Data for Name: Subject; Type: TABLE DATA; Schema: public; Owner: tisa_admin
--

COPY public."Subject" (id, code, name) FROM stdin;
\.


--
-- Data for Name: Submission; Type: TABLE DATA; Schema: public; Owner: tisa_admin
--

COPY public."Submission" (id, "assignmentId", "userId", content, attachments, status, score, feedback, "gradedBy", "gradedAt", "submittedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: UniversityProgram; Type: TABLE DATA; Schema: public; Owner: tisa_admin
--

COPY public."UniversityProgram" (id, title, abbreviation, college, "isActive", "order", "createdAt", "updatedAt") FROM stdin;
de89ee6b-3f70-41fa-b249-fec0e21f219c	Bachelor of Science in Mathematics with Specialization in Computer Science	BSM CS	College of Science	t	1	2025-11-20 18:54:12.91	2025-11-20 18:54:12.91
3d2525e8-6005-48a2-8300-10803091a87f	Bachelor of Science in Mathematics with Specializations in Applied Statistics	BSM AS	College of Science	t	2	2025-11-20 18:58:40.021	2025-11-20 18:58:40.021
e8e06f59-654f-4545-bfab-9dfb6dda37c1	Bachelor of Science in Mathematics with Specializations in Business Applications	BSM BA	College of Science	t	3	2025-11-20 18:58:53.962	2025-11-20 18:58:53.962
145ed5b9-262c-482c-80d3-84f151996834	Bachelor of Science in Biology	BS BIO	College of Science	t	4	2025-11-20 18:59:09.927	2025-11-20 18:59:09.927
2e3e27b9-08b4-4a8d-a5d2-04069c539d2d	Bachelor of Science in Environmental Science	BS ENVI SCI	College of Science	t	5	2025-11-20 18:59:24.306	2025-11-20 18:59:24.306
2f9f0345-f28a-43b6-a983-f88ba71eec59	Bachelor of Science in Food Technology	BS FT	College of Science	t	6	2025-11-20 18:59:42.026	2025-11-20 18:59:42.026
e1207e05-c595-4eac-8b49-21f278c6ba3b	Bachelor of Science in Medical Technology	BS MT	College of Science	t	7	2025-11-20 18:59:54.161	2025-11-20 18:59:54.161
ce4eedb0-73e2-45b6-bce6-e3fdc246e979	Bachelor of Science in Medical Laboratory Science	BS MED LAB SCI	College of Science	t	8	2025-11-20 19:00:09.771	2025-11-20 19:00:09.771
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: tisa_admin
--

COPY public."User" (id, email, password, "firstName", "lastName", role, avatar, "isActive", "createdAt", "updatedAt", "learningStyle", "gradeLevel", "dateOfBirth", "parentId") FROM stdin;
243c5c87-92da-40f7-b985-e950b1f320d2	admin@ailearning.com	$2a$10$iup5UI6EXtny0r4QLVGDQewLQsmFnet2W9/Z3BZRPiiulu8hFMPZW	Admin	User	ADMIN	\N	t	2025-11-20 18:27:31.348	2025-11-20 18:27:31.348	\N	\N	\N	\N
4119bf91-9744-4419-abb1-5052174767f4	teacher@ailearning.com	$2a$10$oT3fuiWi9gb6xv7vz.XzFu4F9rUVpSuc1hlnosLL6hVkIDKoJaVaS	Sarah	Johnson	TEACHER	\N	t	2025-11-20 18:27:31.422	2025-11-20 18:27:31.422	\N	\N	\N	\N
33770ace-9706-4c86-aa82-d1c796ea0c60	student1@ailearning.com	$2a$10$nUrT2Fd4ffdcO14DFpkseOlOzBaJVQjLvuw.cZHpxk6qXgDI.67zG	Alex	Martinez	STUDENT	\N	t	2025-11-20 18:27:31.486	2025-11-20 18:27:31.486	VISUAL	10	\N	\N
ec4fc173-cbd4-4d9b-86bf-a24556e7581e	student2@ailearning.com	$2a$10$nUrT2Fd4ffdcO14DFpkseOlOzBaJVQjLvuw.cZHpxk6qXgDI.67zG	Jordan	Lee	STUDENT	\N	t	2025-11-20 18:27:31.491	2025-11-20 18:27:31.491	AUDITORY	11	\N	\N
a7dac806-3132-44f6-b4fc-b0cd5a116952	jan@gmail.com	$2a$10$lV4DCwYbdj23fpWmcPUu9.x/GBalUqdg2q7yFoKeITENiDeduzZfa	janje	je	STUDENT	\N	t	2025-11-20 21:41:11.732	2025-11-20 21:41:11.732	\N	\N	\N	\N
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: tisa_admin
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
c91d459e-66ed-4bba-9059-0c57a92b0f1b	61bdbaec1782485efd11d54fd39a873082f132bd893d02569a3699055a92cf97	2025-11-20 18:27:28.373625+00	20251115121411_init	\N	\N	2025-11-20 18:27:28.170591+00	1
c82f1189-fd17-4239-b907-6c57589582df	fcbb5022506affd88a636cb0681d490442c8a0a6c09e4df5136cdffd825138bf	2025-11-20 18:27:28.389943+00	20251117084756_add_university_programs	\N	\N	2025-11-20 18:27:28.375305+00	1
d3704e94-01a1-4f63-ab5f-57fae1682f30	67b73f5754dc8dd25e69009e6df52e9017c2acfd76393d0bb8d4b39b68af6e24	2025-11-20 18:27:28.405381+00	20251119113758_add_chat_history	\N	\N	2025-11-20 18:27:28.391589+00	1
f5f1edc9-b8ac-44e9-8396-71ee27ee2628	bb97ce72040c4ac9a8da55e805e5897c0983fc75d75f2bd3943455d4da4515a6	2025-11-20 18:27:28.412487+00	20251119160744_add_chat_history_per_user	\N	\N	2025-11-20 18:27:28.407309+00	1
25641e98-7883-4329-b3e3-b32c0a8df201	c63b596ad950bbea59d7ed9621765943c79f433f4cd321ccadf21a52a303bafb	2025-11-20 18:27:28.421993+00	20251119163741_add_private_chat_model	\N	\N	2025-11-20 18:27:28.414913+00	1
1d60d0a1-6401-44a5-8a95-95f0535f9fe3	b8583067a9e7445eeee5e085885bb138441790ce4eb988343e0e23d264bb39fd	2025-11-20 18:27:28.427847+00	20251119182617_add_multi_chat_support	\N	\N	2025-11-20 18:27:28.423579+00	1
12583d8f-18c8-4931-a210-23d8ec86fd7a	33d416c34052c08ada9341e58f36001d0227844dae616b4938edb13f2b086fbf	2025-11-20 18:27:29.301853+00	20251120182729_add_faculty_model	\N	\N	2025-11-20 18:27:29.274589+00	1
83865302-5061-46ab-85a9-b773cb70e0f8	ae3dda7f7f4dd84adf80d3e92ff4b4a7a88e18b7a7600a86665d593589459b81	2025-11-20 19:40:47.572512+00	20251120194047_curriculum_entry	\N	\N	2025-11-20 19:40:47.553973+00	1
16cfb1ad-6a87-4bb0-b86f-73c57ac4aa84	d7a37fea0cd926587ab936c7701b8a17476be902141e7392532ab710339177d2	2025-11-20 19:44:54.536481+00	20251120194454_add_curriculum_entry	\N	\N	2025-11-20 19:44:54.528891+00	1
7d9c9b05-9172-4d32-bb0c-491aa0202ac4	4a65f2b8d322c7fa837debeadebcc7521bb31ed53b6c0f0201e109604bb36f6c	2025-11-20 20:11:52.433345+00	20251120201152_add_college_with_default	\N	\N	2025-11-20 20:11:52.425317+00	1
\.


--
-- Name: AIInteraction AIInteraction_pkey; Type: CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."AIInteraction"
    ADD CONSTRAINT "AIInteraction_pkey" PRIMARY KEY (id);


--
-- Name: AccessibilitySettings AccessibilitySettings_pkey; Type: CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."AccessibilitySettings"
    ADD CONSTRAINT "AccessibilitySettings_pkey" PRIMARY KEY (id);


--
-- Name: Achievement Achievement_pkey; Type: CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."Achievement"
    ADD CONSTRAINT "Achievement_pkey" PRIMARY KEY (id);


--
-- Name: AssessmentResult AssessmentResult_pkey; Type: CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."AssessmentResult"
    ADD CONSTRAINT "AssessmentResult_pkey" PRIMARY KEY (id);


--
-- Name: Assessment Assessment_pkey; Type: CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."Assessment"
    ADD CONSTRAINT "Assessment_pkey" PRIMARY KEY (id);


--
-- Name: Assignment Assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "Assignment_pkey" PRIMARY KEY (id);


--
-- Name: ChatSession ChatSession_pkey; Type: CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."ChatSession"
    ADD CONSTRAINT "ChatSession_pkey" PRIMARY KEY (id);


--
-- Name: CourseReview CourseReview_pkey; Type: CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."CourseReview"
    ADD CONSTRAINT "CourseReview_pkey" PRIMARY KEY (id);


--
-- Name: Course Course_pkey; Type: CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_pkey" PRIMARY KEY (id);


--
-- Name: CurriculumEntry CurriculumEntry_pkey; Type: CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."CurriculumEntry"
    ADD CONSTRAINT "CurriculumEntry_pkey" PRIMARY KEY (id);


--
-- Name: Enrollment Enrollment_pkey; Type: CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_pkey" PRIMARY KEY (id);


--
-- Name: FacultySubject FacultySubject_pkey; Type: CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."FacultySubject"
    ADD CONSTRAINT "FacultySubject_pkey" PRIMARY KEY (id);


--
-- Name: Faculty Faculty_pkey; Type: CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."Faculty"
    ADD CONSTRAINT "Faculty_pkey" PRIMARY KEY (id);


--
-- Name: GroupMessage GroupMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."GroupMessage"
    ADD CONSTRAINT "GroupMessage_pkey" PRIMARY KEY (id);


--
-- Name: Lesson Lesson_pkey; Type: CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."Lesson"
    ADD CONSTRAINT "Lesson_pkey" PRIMARY KEY (id);


--
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Progress Progress_pkey; Type: CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."Progress"
    ADD CONSTRAINT "Progress_pkey" PRIMARY KEY (id);


--
-- Name: Resource Resource_pkey; Type: CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."Resource"
    ADD CONSTRAINT "Resource_pkey" PRIMARY KEY (id);


--
-- Name: StudyGroupMember StudyGroupMember_pkey; Type: CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."StudyGroupMember"
    ADD CONSTRAINT "StudyGroupMember_pkey" PRIMARY KEY (id);


--
-- Name: StudyGroup StudyGroup_pkey; Type: CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."StudyGroup"
    ADD CONSTRAINT "StudyGroup_pkey" PRIMARY KEY (id);


--
-- Name: Subject Subject_pkey; Type: CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."Subject"
    ADD CONSTRAINT "Subject_pkey" PRIMARY KEY (id);


--
-- Name: Submission Submission_pkey; Type: CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."Submission"
    ADD CONSTRAINT "Submission_pkey" PRIMARY KEY (id);


--
-- Name: UniversityProgram UniversityProgram_pkey; Type: CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."UniversityProgram"
    ADD CONSTRAINT "UniversityProgram_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AIInteraction_createdAt_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "AIInteraction_createdAt_idx" ON public."AIInteraction" USING btree ("createdAt");


--
-- Name: AIInteraction_userId_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "AIInteraction_userId_idx" ON public."AIInteraction" USING btree ("userId");


--
-- Name: AccessibilitySettings_userId_key; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE UNIQUE INDEX "AccessibilitySettings_userId_key" ON public."AccessibilitySettings" USING btree ("userId");


--
-- Name: Achievement_userId_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "Achievement_userId_idx" ON public."Achievement" USING btree ("userId");


--
-- Name: AssessmentResult_assessmentId_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "AssessmentResult_assessmentId_idx" ON public."AssessmentResult" USING btree ("assessmentId");


--
-- Name: AssessmentResult_userId_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "AssessmentResult_userId_idx" ON public."AssessmentResult" USING btree ("userId");


--
-- Name: Assessment_courseId_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "Assessment_courseId_idx" ON public."Assessment" USING btree ("courseId");


--
-- Name: Assignment_courseId_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "Assignment_courseId_idx" ON public."Assignment" USING btree ("courseId");


--
-- Name: ChatSession_updatedAt_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "ChatSession_updatedAt_idx" ON public."ChatSession" USING btree ("updatedAt");


--
-- Name: ChatSession_userId_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "ChatSession_userId_idx" ON public."ChatSession" USING btree ("userId");


--
-- Name: CourseReview_courseId_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "CourseReview_courseId_idx" ON public."CourseReview" USING btree ("courseId");


--
-- Name: CourseReview_courseId_userId_key; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE UNIQUE INDEX "CourseReview_courseId_userId_key" ON public."CourseReview" USING btree ("courseId", "userId");


--
-- Name: CourseReview_userId_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "CourseReview_userId_idx" ON public."CourseReview" USING btree ("userId");


--
-- Name: Course_creatorId_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "Course_creatorId_idx" ON public."Course" USING btree ("creatorId");


--
-- Name: Course_status_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "Course_status_idx" ON public."Course" USING btree (status);


--
-- Name: Course_teacherId_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "Course_teacherId_idx" ON public."Course" USING btree ("teacherId");


--
-- Name: Enrollment_courseId_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "Enrollment_courseId_idx" ON public."Enrollment" USING btree ("courseId");


--
-- Name: Enrollment_userId_courseId_key; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE UNIQUE INDEX "Enrollment_userId_courseId_key" ON public."Enrollment" USING btree ("userId", "courseId");


--
-- Name: Enrollment_userId_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "Enrollment_userId_idx" ON public."Enrollment" USING btree ("userId");


--
-- Name: GroupMessage_createdAt_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "GroupMessage_createdAt_idx" ON public."GroupMessage" USING btree ("createdAt");


--
-- Name: GroupMessage_groupId_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "GroupMessage_groupId_idx" ON public."GroupMessage" USING btree ("groupId");


--
-- Name: Lesson_courseId_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "Lesson_courseId_idx" ON public."Lesson" USING btree ("courseId");


--
-- Name: Lesson_order_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "Lesson_order_idx" ON public."Lesson" USING btree ("order");


--
-- Name: Message_createdAt_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "Message_createdAt_idx" ON public."Message" USING btree ("createdAt");


--
-- Name: Message_receiverId_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "Message_receiverId_idx" ON public."Message" USING btree ("receiverId");


--
-- Name: Message_senderId_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "Message_senderId_idx" ON public."Message" USING btree ("senderId");


--
-- Name: Notification_createdAt_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "Notification_createdAt_idx" ON public."Notification" USING btree ("createdAt");


--
-- Name: Notification_isRead_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "Notification_isRead_idx" ON public."Notification" USING btree ("isRead");


--
-- Name: Notification_userId_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "Notification_userId_idx" ON public."Notification" USING btree ("userId");


--
-- Name: Progress_lessonId_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "Progress_lessonId_idx" ON public."Progress" USING btree ("lessonId");


--
-- Name: Progress_userId_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "Progress_userId_idx" ON public."Progress" USING btree ("userId");


--
-- Name: Progress_userId_lessonId_key; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE UNIQUE INDEX "Progress_userId_lessonId_key" ON public."Progress" USING btree ("userId", "lessonId");


--
-- Name: Resource_lessonId_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "Resource_lessonId_idx" ON public."Resource" USING btree ("lessonId");


--
-- Name: StudyGroupMember_groupId_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "StudyGroupMember_groupId_idx" ON public."StudyGroupMember" USING btree ("groupId");


--
-- Name: StudyGroupMember_groupId_userId_key; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE UNIQUE INDEX "StudyGroupMember_groupId_userId_key" ON public."StudyGroupMember" USING btree ("groupId", "userId");


--
-- Name: StudyGroupMember_userId_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "StudyGroupMember_userId_idx" ON public."StudyGroupMember" USING btree ("userId");


--
-- Name: Submission_assignmentId_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "Submission_assignmentId_idx" ON public."Submission" USING btree ("assignmentId");


--
-- Name: Submission_assignmentId_userId_key; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE UNIQUE INDEX "Submission_assignmentId_userId_key" ON public."Submission" USING btree ("assignmentId", "userId");


--
-- Name: Submission_userId_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "Submission_userId_idx" ON public."Submission" USING btree ("userId");


--
-- Name: UniversityProgram_college_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "UniversityProgram_college_idx" ON public."UniversityProgram" USING btree (college);


--
-- Name: UniversityProgram_isActive_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "UniversityProgram_isActive_idx" ON public."UniversityProgram" USING btree ("isActive");


--
-- Name: UniversityProgram_title_key; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE UNIQUE INDEX "UniversityProgram_title_key" ON public."UniversityProgram" USING btree (title);


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: tisa_admin
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: AIInteraction AIInteraction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."AIInteraction"
    ADD CONSTRAINT "AIInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AccessibilitySettings AccessibilitySettings_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."AccessibilitySettings"
    ADD CONSTRAINT "AccessibilitySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Achievement Achievement_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."Achievement"
    ADD CONSTRAINT "Achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AssessmentResult AssessmentResult_assessmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."AssessmentResult"
    ADD CONSTRAINT "AssessmentResult_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES public."Assessment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AssessmentResult AssessmentResult_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."AssessmentResult"
    ADD CONSTRAINT "AssessmentResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatSession ChatSession_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."ChatSession"
    ADD CONSTRAINT "ChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CourseReview CourseReview_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."CourseReview"
    ADD CONSTRAINT "CourseReview_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CourseReview CourseReview_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."CourseReview"
    ADD CONSTRAINT "CourseReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Course Course_creatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Course Course_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CurriculumEntry CurriculumEntry_programId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."CurriculumEntry"
    ADD CONSTRAINT "CurriculumEntry_programId_fkey" FOREIGN KEY ("programId") REFERENCES public."UniversityProgram"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Enrollment Enrollment_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Enrollment Enrollment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."Enrollment"
    ADD CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FacultySubject FacultySubject_facultyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."FacultySubject"
    ADD CONSTRAINT "FacultySubject_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES public."Faculty"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FacultySubject FacultySubject_subjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."FacultySubject"
    ADD CONSTRAINT "FacultySubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES public."Subject"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: GroupMessage GroupMessage_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."GroupMessage"
    ADD CONSTRAINT "GroupMessage_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public."StudyGroup"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Lesson Lesson_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."Lesson"
    ADD CONSTRAINT "Lesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Message Message_receiverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Message Message_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Progress Progress_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."Progress"
    ADD CONSTRAINT "Progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public."Lesson"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Progress Progress_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."Progress"
    ADD CONSTRAINT "Progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Resource Resource_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."Resource"
    ADD CONSTRAINT "Resource_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public."Lesson"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StudyGroupMember StudyGroupMember_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."StudyGroupMember"
    ADD CONSTRAINT "StudyGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public."StudyGroup"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StudyGroupMember StudyGroupMember_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."StudyGroupMember"
    ADD CONSTRAINT "StudyGroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Submission Submission_assignmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."Submission"
    ADD CONSTRAINT "Submission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES public."Assignment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Submission Submission_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."Submission"
    ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: User User_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tisa_admin
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: tisa_admin
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict VXx4jIHQg7VytUTuqwBdhfW7YDuBF7E8DiiH8jY7L4x9JuIqXF06jg6PQOLmuVi

