// client/src/pages/RoomSchedules.tsx
// Room Schedules for College of Science

import { useState } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { 
  Building2, Search, Calendar, Clock, Users, MapPin, 
  ChevronLeft, ChevronRight, CheckCircle,
  Activity,
  Grid3X3, List, Download, School, DoorOpen, X
} from 'lucide-react';
// ─── Types ───────────────────────────────────────────────
interface ScheduleEntry {
  day: string;
  time: string;
  courseCode: string;
  courseTitle: string;
  section: string;
  instructor: string;
}

interface Room {
  id: string;
  name: string;
  building: string;
  floor?: number;
  capacity: number;
  type: string;
  facilities: string[];
  schedules: ScheduleEntry[];
}

// ─── Static Room Data ───────────────────────────────────
const ROOMS: Room[] = [
  // FH 106
  {
    id: 'fh-106',
    name: 'FH 106',
    building: 'Federizo Hall',
    floor: 1,
    capacity: 50,
    type: 'CLASSROOM',
    facilities: ['Projector', 'Whiteboard', 'Aircon'],
    schedules: [
      { day: 'Monday', time: '7:00AM-10:00AM', courseCode: 'ECO 105', courseTitle: 'Economics', section: 'BSB 1A', instructor: 'CARPIO, ALFREDO' },
      { day: 'Monday', time: '10:00AM-1:00PM', courseCode: 'ECO 105', courseTitle: 'Economics', section: 'BSB 1B', instructor: 'CARPIO, ALFREDO' },
      { day: 'Monday', time: '1:00PM-4:00PM', courseCode: 'ECB 405', courseTitle: 'Environmental Biology', section: 'BSB 2B', instructor: 'JAVIER, RAYMUNDO' },
      { day: 'Monday', time: '4:00PM-7:00PM', courseCode: 'ECB 405', courseTitle: 'Environmental Biology', section: 'BSB 2A', instructor: 'JAVIER, RAYMUNDO' },
      { day: 'Tuesday', time: '7:00AM-10:00AM', courseCode: 'STS 101', courseTitle: 'Science, Technology & Society', section: 'BSB 1B', instructor: 'CARPIO, ALFREDO' },
      { day: 'Tuesday', time: '10:00AM-1:00PM', courseCode: 'ECO 105L', courseTitle: 'Economics Laboratory', section: 'BSB 1A', instructor: 'CARPIO, ALFREDO' },
      { day: 'Tuesday', time: '1:00PM-4:00PM', courseCode: 'ECB 405L', courseTitle: 'Environmental Biology Lab', section: 'BSB 2A', instructor: 'JAVIER, RAYMUNDO' },
      { day: 'Tuesday', time: '4:00PM-7:00PM', courseCode: 'ECB 405', courseTitle: 'Environmental Biology', section: 'BSB 2B', instructor: 'JAVIER, RAYMUNDO' },
      { day: 'Wednesday', time: '7:00AM-10:00AM', courseCode: 'ZOO 103L', courseTitle: 'Zoology Laboratory', section: 'ZOO 103Lab', instructor: 'VITUG, LAWRENCE V.' },
      { day: 'Wednesday', time: '10:00AM-1:00PM', courseCode: 'ECO 105L', courseTitle: 'Economics Laboratory', section: 'BSB 1C', instructor: 'ARRIETA, THELMA' },
      { day: 'Wednesday', time: '1:00PM-4:00PM', courseCode: 'ECO 105L', courseTitle: 'Economics Laboratory', section: 'BSB 1B', instructor: 'CARPIO, ALFREDO' },
      { day: 'Wednesday', time: '4:00PM-7:00PM', courseCode: 'ECB 405L', courseTitle: 'Environmental Biology Lab', section: 'BSB 2A', instructor: 'JAVIER, RAYMUNDO' },
      { day: 'Thursday', time: '7:00AM-10:00AM', courseCode: 'ZOO 103L', courseTitle: 'Zoology Laboratory', section: 'ZOO 103Lab', instructor: 'VITUG, LAWRENCE V.' },
      { day: 'Thursday', time: '10:00AM-1:00PM', courseCode: 'CB 405 L', courseTitle: 'Cell Biology', section: 'BSB 4B', instructor: 'TADIOSA, EDWIN R.' },
      { day: 'Thursday', time: '1:00PM-4:00PM', courseCode: 'EVO 303 L', courseTitle: 'Evolution', section: 'BSB 3B', instructor: 'CLEMENTE, RICHARD FRANC' },
      { day: 'Thursday', time: '4:00PM-7:00PM', courseCode: 'STS 101', courseTitle: 'Science, Technology & Society', section: 'BSB 1C', instructor: 'CARPIO, ALFREDO' },
      { day: 'Friday', time: '7:00AM-10:00AM', courseCode: 'CHE 207/207L', courseTitle: 'Chemistry', section: 'BSFT 2B', instructor: 'BASILIO, ELEONOR' },
      { day: 'Friday', time: '10:00AM-11:30AM', courseCode: 'AAH 101a', courseTitle: 'Art Appreciation', section: '', instructor: 'LEON, SHEILA MARIE' },
      { day: 'Friday', time: '11:30AM-1:00PM', courseCode: 'RLW 101', courseTitle: 'Reading and Writing', section: '', instructor: 'MONTEMAYOR, LUZVIMINDA' },
      { day: 'Friday', time: '1:00PM-4:00PM', courseCode: 'ECO 105L', courseTitle: 'Economics Laboratory', section: 'BSB 1C', instructor: 'ARRIETA, THELMA' },
      { day: 'Saturday', time: '7:00AM-10:00AM', courseCode: 'NSTP 11', courseTitle: 'NSTP', section: 'BSB 1A', instructor: 'BERNARDO, EMIL' },
      { day: 'Saturday', time: '10:00AM-1:00PM', courseCode: 'NSTP 11', courseTitle: 'NSTP', section: 'BSB 1B', instructor: 'DELA CRUZ, CHESALON' },
    ]
  },
  // FH 107 (Physics lab)
  {
    id: 'fh-107',
    name: 'FH 107 (Physics Lab)',
    building: 'Federizo Hall',
    floor: 1,
    capacity: 40,
    type: 'LABORATORY',
    facilities: ['Microscopes', 'Lab Equipment', 'Projector'],
    schedules: [
      { day: 'Monday', time: '7:00AM-10:00AM', courseCode: 'EVO 303', courseTitle: 'Evolution', section: 'BSB 3B', instructor: 'CLEMENTE, RICHARD FRANC' },
      { day: 'Monday', time: '10:00AM-1:00PM', courseCode: 'ECB 405', courseTitle: 'Environmental Biology', section: 'BSB 4B', instructor: 'TADIOSA, EDWIN R.' },
      { day: 'Monday', time: '1:00PM-4:00PM', courseCode: 'PHY 202a', courseTitle: 'Physics', section: 'BSM BA 2B', instructor: 'PEÑADO, ROSARIO' },
      { day: 'Monday', time: '3:00PM-4:30PM', courseCode: 'UTS 101', courseTitle: 'Understanding the Self', section: '', instructor: 'Rotaquio, Marionne' },
      { day: 'Monday', time: '4:30PM-6:00PM', courseCode: 'BST 305', courseTitle: 'Business Statistics', section: '', instructor: 'Mandap, Marco' },
      { day: 'Tuesday', time: '7:00AM-10:00AM', courseCode: 'PHY 202a', courseTitle: 'Physics', section: 'BSM AS 2B', instructor: 'PEÑADO, ROSARIO' },
      { day: 'Tuesday', time: '10:00AM-1:00PM', courseCode: 'ErS 102L', courseTitle: 'Earth Science Lab', section: 'BSES 1A PCM', instructor: 'ARRIETA, THELMA' },
      { day: 'Tuesday', time: '1:00PM-4:00PM', courseCode: 'PHY 202a', courseTitle: 'Physics', section: 'BSM BA 2A', instructor: 'PEÑADO, ROSARIO' },
      { day: 'Tuesday', time: '4:00PM-5:00PM', courseCode: 'PHY 202a', courseTitle: 'Physics', section: '', instructor: 'REYES, MA THERESA F.' },
      { day: 'Tuesday', time: '5:00PM-8:00PM', courseCode: 'PHY 202a', courseTitle: 'Physics', section: '', instructor: 'REYES, MA THERESA F.' },
      { day: 'Wednesday', time: '7:00AM-10:00AM', courseCode: 'CHE 105/105L', courseTitle: 'Chemistry', section: 'BSFT 1A', instructor: 'TUAZON, DEBBIE ANN S.' },
      { day: 'Wednesday', time: '10:00AM-1:00PM', courseCode: 'ErS 102L', courseTitle: 'Earth Science Lab', section: 'BSES 1A CCDM', instructor: 'SANTOS, KARL KENNETH' },
      { day: 'Wednesday', time: '1:00PM-4:00PM', courseCode: 'GIS 201', courseTitle: 'Geographic Information Systems', section: 'BSES PCM 2A', instructor: 'SANTOS, KARL KENNETH' },
      { day: 'Wednesday', time: '4:00PM-7:00PM', courseCode: 'GIS 201', courseTitle: 'Geographic Information Systems', section: 'BSES CCDM 2A', instructor: 'SANTOS, KARL KENNETH' },
      { day: 'Thursday', time: '7:00AM-10:00AM', courseCode: 'CHE 306/306L', courseTitle: 'Chemistry', section: 'BSFT 2A', instructor: 'BARRE, ATHEENA CAMMARA T.' },
      { day: 'Thursday', time: '10:00AM-1:00PM', courseCode: 'ErS 102L', courseTitle: 'Earth Science Lab', section: 'BSES 1A CCDM', instructor: 'SANTOS, KARL KENNETH' },
      { day: 'Thursday', time: '1:00PM-4:00PM', courseCode: 'ErS 102L', courseTitle: 'Earth Science Lab', section: 'BSES 1A PCM', instructor: 'ARRIETA, THELMA' },
      { day: 'Thursday', time: '4:00PM-7:00PM', courseCode: 'PHY 202a', courseTitle: 'Physics', section: 'BSM AS 2A', instructor: 'REYES, MA THERESA F.' },
      { day: 'Friday', time: '7:00AM-9:00AM', courseCode: 'MAT 103', courseTitle: 'Mathematics', section: '', instructor: 'REYES, JO ANN' },
      { day: 'Friday', time: '10:00AM-1:00PM', courseCode: 'PHY 202a', courseTitle: 'Physics', section: '', instructor: 'PEÑADO, ROSARIO' },
      { day: 'Friday', time: '1:00PM-4:00PM', courseCode: 'PHY 202a', courseTitle: 'Physics', section: 'BSM BA 2B', instructor: 'PEÑADO, ROSARIO' },
      { day: 'Friday', time: '4:00PM-7:00PM', courseCode: 'CHE 306/306L', courseTitle: 'Chemistry', section: 'BSFT 2B', instructor: 'BARRE, ATHEENA CAMMARA T.' },
    ]
  },
  // FH 108
  {
    id: 'fh-108',
    name: 'FH 108',
    building: 'Federizo Hall',
    floor: 1,
    capacity: 45,
    type: 'CLASSROOM',
    facilities: ['Projector', 'Whiteboard'],
    schedules: [
      { day: 'Monday', time: '8:00AM-10:00AM', courseCode: 'MAT 204', courseTitle: 'Mathematics', section: '', instructor: 'ARELLANO, MA C.' },
      { day: 'Monday', time: '10:00AM-12:00PM', courseCode: 'MAT 204', courseTitle: 'Mathematics', section: '', instructor: 'ARELLANO, MA C.' },
      { day: 'Monday', time: '10:00AM-12:00PM', courseCode: 'FST 408', courseTitle: 'Food Science', section: '', instructor: 'SALUNGA, ANNA DOMINIQUE' },
      { day: 'Monday', time: '1:00PM-2:30PM', courseCode: 'UTS 101', courseTitle: 'Understanding the Self', section: '', instructor: 'ANG, MARIA CELINA' },
      { day: 'Monday', time: '3:00PM-5:00PM', courseCode: 'PHY 101', courseTitle: 'Physics', section: '', instructor: 'INGCO, FREYA G.' },
      { day: 'Monday', time: '5:00PM-6:30PM', courseCode: 'FST 408', courseTitle: 'Food Science', section: '', instructor: 'NICOLAS, JOSIE' },
      { day: 'Monday', time: '6:30PM-8:00PM', courseCode: 'FBT 405', courseTitle: 'Food Biotechnology', section: '', instructor: 'NICOLAS, JOSIE' },
      { day: 'Tuesday', time: '8:30AM-10:00AM', courseCode: 'THE 301', courseTitle: 'Theology', section: '', instructor: 'TUAZON, DEBBIE ANN S.' },
      { day: 'Tuesday', time: '10:00AM-1:00PM', courseCode: 'FFP 310', courseTitle: 'Food Processing', section: '', instructor: 'SALUNGA' },
      { day: 'Tuesday', time: '2:30PM-4:00PM', courseCode: 'SSP 101d', courseTitle: 'Social Science', section: '', instructor: 'JENNET, NATIVIDAD' },
      { day: 'Tuesday', time: '5:00PM-6:30PM', courseCode: 'SSP 101c', courseTitle: 'Social Science', section: '', instructor: 'AGUSTIN, ALSON' },
      { day: 'Wednesday', time: '7:00AM-10:00AM', courseCode: 'FCH 208/208L', courseTitle: 'Food Chemistry', section: 'BSFT 2B', instructor: 'BARRE, ATHEENA CAMMARA T.' },
      { day: 'Wednesday', time: '10:00AM-1:00PM', courseCode: 'STS 101', courseTitle: 'Science, Technology & Society', section: '', instructor: 'DELA CRUZ, MARISSA D.' },
      { day: 'Wednesday', time: '1:00PM-4:00PM', courseCode: 'MAT 204', courseTitle: 'Mathematics', section: '', instructor: 'ARELLANO, MA C.' },
      { day: 'Wednesday', time: '4:00PM-6:00PM', courseCode: 'STS 101', courseTitle: 'Science, Technology & Society', section: '', instructor: 'SANTIAGO, LEO' },
      { day: 'Thursday', time: '8:30AM-10:00AM', courseCode: 'TCW 101', courseTitle: 'The Contemporary World', section: '', instructor: 'JOSE, DENMARK Q.' },
      { day: 'Thursday', time: '10:00AM-1:00PM', courseCode: 'MAT 204', courseTitle: 'Mathematics', section: '', instructor: 'ARELLANO, MA C.' },
      { day: 'Thursday', time: '1:00PM-4:00PM', courseCode: 'STS 101', courseTitle: 'Science, Technology & Society', section: '', instructor: 'DELA CRUZ, MARISSA D.' },
      { day: 'Thursday', time: '6:30PM-8:00PM', courseCode: 'UTS 101', courseTitle: 'Understanding the Self', section: '', instructor: 'ANG, MARIA CELINA' },
      { day: 'Friday', time: '7:00AM-10:00AM', courseCode: 'FES 408', courseTitle: 'Food Entrepreneurship', section: 'BSFT 4B', instructor: 'DE GUZMAN, MARICEL' },
      { day: 'Friday', time: '10:00AM-12:00PM', courseCode: 'FES 408', courseTitle: 'Food Entrepreneurship', section: '', instructor: 'DE GUZMAN, MARICEL' },
      { day: 'Friday', time: '1:00PM-2:30PM', courseCode: 'SSP 101d', courseTitle: 'Social Science', section: '', instructor: 'JENNET, NATIVIDAD' },
      { day: 'Friday', time: '2:30PM-3:30PM', courseCode: 'PID 101', courseTitle: 'Personal Development', section: '', instructor: 'SOTIO, JAMIE M.' },
    ]
  },
  {
    id: 'fh-110',
    name: 'FH 110',
    building: 'Federizo Hall',
    floor: 1,
    capacity: 50,
    type: 'CLASSROOM',
    facilities: ['Projector', 'Aircon', 'Whiteboard'],
    schedules: [
      // Monday
      { day: 'Monday', time: '7:00AM-10:00AM', courseCode: 'INV 204', courseTitle: 'Investment Management', section: 'BSB 3A', instructor: 'LEE, MARY YLANE S.' },
      { day: 'Monday', time: '10:00AM-1:00PM', courseCode: 'INV 204', courseTitle: 'Investment Management', section: 'BSB 3B', instructor: 'LEE, MARY YLANE S.' },
      { day: 'Monday', time: '1:00PM-4:00PM', courseCode: 'PAR 404', courseTitle: 'Parasitology', section: 'BSB 4B', instructor: 'TAN, JUDITH CLARISSE' },
      { day: 'Monday', time: '4:00PM-8:00PM', courseCode: 'ECB 405', courseTitle: 'Economic Botany', section: 'BSB 4A', instructor: 'TADIOSA, EDWIN R.' },
      
      // Tuesday
      { day: 'Tuesday', time: '7:00AM-10:00AM', courseCode: 'PAR 404', courseTitle: 'Parasitology', section: 'BSB 4A', instructor: 'TAN, JUDITH CLARISSE' },
      { day: 'Tuesday', time: '10:00AM-1:00PM', courseCode: 'ECB 405', courseTitle: 'Economic Botany', section: 'BSB 4A', instructor: 'TADIOSA, EDWIN R.' },
      { day: 'Tuesday', time: '1:00PM-2:30PM', courseCode: 'CHE 301L', courseTitle: 'Chemistry Laboratory', section: '', instructor: 'TUAZON, DEBBIE ANN S.' },
      { day: 'Tuesday', time: '2:30PM-4:00PM', courseCode: 'FedAAN H 101', courseTitle: 'Food and Nutrition', section: '', instructor: 'DE LEON, SHIELA MARIE' },
      { day: 'Tuesday', time: '4:00PM-5:30PM', courseCode: 'PID 101', courseTitle: 'Principles of Infectious Diseases', section: '', instructor: 'RAMOS, DANTE B.' },
      
      // Wednesday
      { day: 'Wednesday', time: '7:00AM-10:00AM', courseCode: 'STS 101', courseTitle: 'Science, Technology and Society', section: 'BSB 1A', instructor: 'CARPIO, ALFREDO' },
      { day: 'Wednesday', time: '10:00AM-1:00PM', courseCode: 'PAR 404', courseTitle: 'Parasitology', section: 'BSB 4A', instructor: 'TAN, JUDITH CLARISSE' },
      { day: 'Wednesday', time: '1:00PM-4:00PM', courseCode: 'PAR 404', courseTitle: 'Parasitology', section: 'BSB 4B', instructor: 'TAN, JUDITH CLARISSE' },
      { day: 'Wednesday', time: '4:00PM-8:00PM', courseCode: 'CHE 105/105L', courseTitle: 'General Chemistry', section: 'BSFT 1B', instructor: 'TUAZON, DEBBIE ANN S.' },
      
      // Thursday
      { day: 'Thursday', time: '7:00AM-10:00AM', courseCode: 'EVO 303', courseTitle: 'Evolutionary Biology', section: 'BSB 3A', instructor: 'CLEMENTE, RICHARD FRANC' },
      { day: 'Thursday', time: '10:00AM-1:00PM', courseCode: 'MIC 205L', courseTitle: 'Microbiology Laboratory', section: 'BSB 2A', instructor: 'VITUG, LAWRENCE V.' },
      { day: 'Thursday', time: '1:00PM-4:00PM', courseCode: 'ECO 105L', courseTitle: 'Ecology Laboratory', section: 'BSB 1B', instructor: 'CARPIO, ALFREDO' },
      { day: 'Thursday', time: '5:00PM-8:00PM', courseCode: 'UTS 101', courseTitle: 'Understanding the Self', section: '', instructor: 'CATACUTAN, PAULA ANGELICA H.' },
      
      // Friday
      { day: 'Friday', time: '7:00AM-10:00AM', courseCode: 'ECO 105L', courseTitle: 'Ecology Laboratory', section: 'BSB 1A', instructor: 'CARPIO, ALFREDO' },
      { day: 'Friday', time: '10:00AM-1:00PM', courseCode: 'MIC 205', courseTitle: 'Microbiology', section: 'BSB 2B', instructor: 'DIZON, SARAH JOY' },
      { day: 'Friday', time: '1:00PM-4:00PM', courseCode: 'MIC 205L', courseTitle: 'Microbiology Laboratory', section: 'BSB 2A', instructor: 'VITUG, LAWRENCE V.' },
      { day: 'Friday', time: '5:00PM-8:00PM', courseCode: 'UTS 101', courseTitle: 'Understanding the Self', section: '', instructor: 'CATACUTAN, PAULA ANGELICA H.' },
      
      // Saturday
      { day: 'Saturday', time: '7:00AM-10:00AM', courseCode: 'MIC 205L', courseTitle: 'Microbiology Laboratory', section: 'BSB 2B', instructor: 'DIZON, SARAH JOY' },
      { day: 'Saturday', time: '2:00PM-8:00PM', courseCode: 'GEN 301 L', courseTitle: 'Genetics Laboratory', section: '', instructor: 'DIZON, SARAH JOY' },
      { day: 'Saturday', time: '4:00PM-8:00PM', courseCode: 'GEN 301L', courseTitle: 'Genetics Laboratory', section: '', instructor: '' }
    ]
  },
  // FH CS-AR
  {
    id: 'fh-csar',
    name: 'FH CS-AR',
    building: 'Federizo Hall',
    floor: 2,
    capacity: 60,
    type: 'LECTURE_HALL',
    facilities: ['Projector', 'Sound System', 'Aircon'],
    schedules: [
      { day: 'Monday', time: '7:00AM-10:00AM', courseCode: 'BSM C 107', courseTitle: 'Computer Science', section: '', instructor: 'Michael Santos' },
      { day: 'Monday', time: '10:00AM-1:00PM', courseCode: 'BSM AS 1A', courseTitle: 'Applied Statistics', section: '', instructor: 'MARCELINO, LYCAD D.' },
      { day: 'Monday', time: '1:00PM-4:00PM', courseCode: 'MAT 107', courseTitle: 'Mathematics', section: '', instructor: 'Michael Santos' },
      { day: 'Monday', time: '4:00PM-7:00PM', courseCode: 'BSM BA 2A', courseTitle: 'Business Applications', section: '', instructor: 'Ortiguero, Freddie' },
      { day: 'Tuesday', time: '7:00AM-10:00AM', courseCode: 'BSM BA 2A', courseTitle: 'Business Applications', section: '', instructor: 'CAMARA, EVELYN' },
      { day: 'Tuesday', time: '10:00AM-1:00PM', courseCode: 'UTS 101', courseTitle: 'Understanding the Self', section: '', instructor: 'Rotaquio, Marionne' },
      { day: 'Tuesday', time: '10:00AM-1:00PM', courseCode: 'BSM AS 2B', courseTitle: 'Applied Statistics', section: '', instructor: 'CAMARA, EVELYN' },
      { day: 'Tuesday', time: '1:00PM-4:00PM', courseCode: 'MAT 104', courseTitle: 'Mathematics', section: '', instructor: 'Regalado, Chereilyn' },
      { day: 'Tuesday', time: '4:00PM-7:00PM', courseCode: 'NSTP 11', courseTitle: 'NSTP', section: 'BSM CS 1A G2', instructor: 'Marcelino, Jon Jon' },
      { day: 'Wednesday', time: '7:00AM-10:00AM', courseCode: 'MAT 302', courseTitle: 'Mathematics', section: 'Petition class', instructor: 'Geronimo, Paul' },
      { day: 'Wednesday', time: '10:00AM-1:00PM', courseCode: 'NSTP 11', courseTitle: 'NSTP', section: '', instructor: 'Dela Cruz, Julieta' },
      { day: 'Wednesday', time: '1:00PM-4:00PM', courseCode: 'MAT 403', courseTitle: 'Mathematics', section: '', instructor: 'ROBERTO, YOLANDA C.' },
      { day: 'Wednesday', time: '4:00PM-7:00PM', courseCode: 'BSM BA 4B', courseTitle: 'Business Applications', section: '', instructor: 'YOLANDA C. ROBERTO' },
      { day: 'Thursday', time: '7:00AM-10:00AM', courseCode: 'BSM AS 3A', courseTitle: 'Applied Statistics', section: '', instructor: 'CARCOSIA, IMELDA' },
      { day: 'Thursday', time: '10:00AM-1:00PM', courseCode: 'MAT 105', courseTitle: 'Mathematics', section: 'BSM AS 1A', instructor: 'CARCOSIA, IMELDA' },
      { day: 'Thursday', time: '1:00PM-4:00PM', courseCode: 'MAT 104', courseTitle: 'Mathematics', section: '', instructor: 'Regalado, CHERIELYN' },
      { day: 'Thursday', time: '4:00PM-7:00PM', courseCode: 'NSTP 11', courseTitle: 'NSTP', section: 'FSM 1C', instructor: 'Marcelino, Jon Jon' },
      { day: 'Friday', time: '7:00AM-10:00AM', courseCode: 'ELEC II', courseTitle: 'Elective', section: 'BSB 4B', instructor: 'CARCOSIA, IMELDA' },
      { day: 'Friday', time: '10:00AM-1:00PM', courseCode: 'MAT 205', courseTitle: 'Mathematics', section: 'BSM AS 2A/2B', instructor: 'VIOLA, JOSELITO' },
      { day: 'Friday', time: '1:00PM-4:00PM', courseCode: 'MAT 206', courseTitle: 'Mathematics', section: '', instructor: 'CAMARA, EVELYN' },
      { day: 'Friday', time: '4:00PM-7:00PM', courseCode: 'UTS 101', courseTitle: 'Understanding the Self', section: 'BSES 1A', instructor: 'Lodrigito, Mark Anthony' },
    ]
  },
  // FS CS R&E
  {
    id: 'fs-csre',
    name: 'FS CS R&E',
    building: 'Federizo Hall',
    floor: 2,
    capacity: 40,
    type: 'COMPUTER_LAB',
    facilities: ['Desktop Computers', 'Projector', 'WiFi'],
    schedules: [
      { day: 'Monday', time: '7:00AM-10:00AM', courseCode: 'PID 101', courseTitle: 'Personal Development', section: 'BSM AS 1B', instructor: 'RAMOS, DANTE B.' },
      { day: 'Monday', time: '10:00AM-1:00PM', courseCode: 'MAT 405', courseTitle: 'Mathematics', section: 'BSM AS 4B', instructor: 'CLEMENTE, CARLA M.' },
      { day: 'Monday', time: '1:00PM-4:00PM', courseCode: 'MAT 405', courseTitle: 'Mathematics', section: 'BSM AS 4A', instructor: 'CLEMENTE, CARLA M.' },
      { day: 'Monday', time: '4:00PM-7:00PM', courseCode: 'BSM CS 4A - G2', courseTitle: 'Computer Science', section: '', instructor: 'DUQUE, RAINILYN' },
      { day: 'Tuesday', time: '7:00AM-10:00AM', courseCode: 'RPH 101', courseTitle: 'Reading in Philippine History', section: 'BSM BA 2B', instructor: 'ORTIGUERO, FREDDIE' },
      { day: 'Tuesday', time: '10:00AM-1:00PM', courseCode: 'MAT 405', courseTitle: 'Mathematics', section: 'BSM BA 4B', instructor: 'ROBERTO, YOLANDA C.' },
      { day: 'Tuesday', time: '1:00PM-4:00PM', courseCode: 'MBA 204', courseTitle: 'Business Administration', section: 'BSM BA 2B', instructor: 'AURE, BENEDICT' },
      { day: 'Wednesday', time: '7:00AM-8:30AM', courseCode: 'BSM AS 2B', courseTitle: 'Applied Statistics', section: '', instructor: 'MACALISI NG, AARON' },
      { day: 'Wednesday', time: '8:30AM-10:00AM', courseCode: 'RLW', courseTitle: 'Reading and Writing', section: 'BSES 3A 2S 25-26', instructor: 'CRUZ, TEODULO' },
      { day: 'Wednesday', time: '10:00AM-1:00PM', courseCode: 'BSM AS 2A', courseTitle: 'Applied Statistics', section: '', instructor: 'CAMARA, EVELYN' },
      { day: 'Wednesday', time: '1:00PM-4:00PM', courseCode: 'MAT 205', courseTitle: 'Mathematics', section: 'BSM BA 2B', instructor: 'VIOLA, JOSELITO' },
      { day: 'Wednesday', time: '4:00PM-7:00PM', courseCode: 'BSM AS 1B', courseTitle: 'Applied Statistics', section: '', instructor: 'ROTAQUIO, MARIONNE' },
      { day: 'Thursday', time: '7:00AM-10:00AM', courseCode: 'NSTP 11', courseTitle: 'NSTP', section: 'BSM AS 1A', instructor: 'CAMPITA, ELJAY' },
      { day: 'Thursday', time: '10:00AM-1:00PM', courseCode: 'MAT 206', courseTitle: 'Mathematics', section: 'BSM BA 2A', instructor: 'CAMARA, EVELYN' },
      { day: 'Thursday', time: '1:00PM-4:00PM', courseCode: 'TCW 101', courseTitle: 'The Contemporary World', section: 'BSFT 3A', instructor: 'CERVANTES, NICOLE' },
      { day: 'Thursday', time: '4:00PM-7:00PM', courseCode: 'FCS 401', courseTitle: 'Food Science', section: 'BSFT 1B', instructor: 'MARTINEZ, MARIBETH' },
      { day: 'Friday', time: '7:00AM-10:00AM', courseCode: 'GEN 301', courseTitle: 'Genetics', section: '', instructor: 'DIZON, SARAH JOY' },
      { day: 'Friday', time: '10:00AM-1:00PM', courseCode: 'BSFT 4A', courseTitle: 'Food Technology', section: '', instructor: 'CAMARA, EVELYN' },
    ]
  },
  // FH 202
  {
    id: 'fh-202',
    name: 'FH 202',
    building: 'Federizo Hall',
    floor: 2,
    capacity: 45,
    type: 'CLASSROOM',
    facilities: ['Projector', 'Whiteboard'],
    schedules: [
      { day: 'Monday', time: '7:00AM-10:00AM', courseCode: 'MAT 201', courseTitle: 'Mathematics', section: 'BSES CCDM 2A', instructor: '' },
      { day: 'Monday', time: '10:00AM-1:00PM', courseCode: 'PAL 101', courseTitle: 'Philippine Literature', section: 'BSM CS 1A-G', instructor: '' },
      { day: 'Monday', time: '1:00PM-4:00PM', courseCode: 'PAL 101', courseTitle: 'Philippine Literature', section: 'BSM CS 1B-G', instructor: '' },
      { day: 'Monday', time: '4:00PM-7:00PM', courseCode: 'STS 101', courseTitle: 'Science, Technology & Society', section: 'BSM CS 3B-G2', instructor: '' },
      { day: 'Tuesday', time: '7:00AM-10:00AM', courseCode: 'PAL 101', courseTitle: 'Philippine Literature', section: 'BSM CS 1B-G2', instructor: '' },
      { day: 'Tuesday', time: '10:00AM-1:00PM', courseCode: 'MST 101a', courseTitle: 'Mathematics in the Modern World', section: 'BSM CS 3A-G', instructor: '' },
      { day: 'Tuesday', time: '1:00PM-4:00PM', courseCode: 'PCM 101', courseTitle: 'Purposive Communication', section: 'BSM CS 1B-G', instructor: '' },
      { day: 'Wednesday', time: '7:00AM-10:00AM', courseCode: 'MAT 402', courseTitle: 'Mathematics', section: 'BSM CS 4B-G', instructor: '' },
      { day: 'Wednesday', time: '10:00AM-1:00PM', courseCode: 'SSP 101d', courseTitle: 'Social Science', section: 'BSM AS 4B', instructor: '' },
      { day: 'Wednesday', time: '1:00PM-4:00PM', courseCode: 'RLW 101', courseTitle: 'Reading and Writing', section: 'BSM BA 4B', instructor: '' },
      { day: 'Wednesday', time: '4:00PM-7:00PM', courseCode: 'MST 101a', courseTitle: 'Mathematics in the Modern World', section: 'BSM BA 2A', instructor: '' },
      { day: 'Thursday', time: '7:00AM-10:00AM', courseCode: 'MAT 101a', courseTitle: 'Mathematics', section: 'BSM AS 3B', instructor: '' },
      { day: 'Thursday', time: '10:00AM-1:00PM', courseCode: 'MST 101a', courseTitle: 'Mathematics in the Modern World', section: 'BSM BA 3B', instructor: '' },
      { day: 'Thursday', time: '1:00PM-4:00PM', courseCode: 'PAL 101', courseTitle: 'Philippine Literature', section: 'BSM CS 1B-G', instructor: '' },
      { day: 'Thursday', time: '4:00PM-7:00PM', courseCode: 'MST 101a', courseTitle: 'Mathematics in the Modern World', section: 'BSM BA 2B', instructor: '' },
      { day: 'Friday', time: '7:00AM-10:00AM', courseCode: 'BSB 1B N', courseTitle: 'Biology', section: '', instructor: '' },
      { day: 'Friday', time: '10:00AM-1:00PM', courseCode: 'BSM CS 4A-G2 N', courseTitle: 'Computer Science', section: '', instructor: '' },
      { day: 'Friday', time: '1:00PM-4:00PM', courseCode: 'BSM CS 1A-G2 N', courseTitle: 'Computer Science', section: '', instructor: '' },
    ]
  },
  // FH AVR A
  {
    id: 'fh-avra',
    name: 'FH AVR A',
    building: 'Federizo Hall',
    floor: 2,
    capacity: 80,
    type: 'LECTURE_HALL',
    facilities: ['Projector', 'Sound System', 'Aircon', 'Microphone'],
    schedules: [
      // Monday
      { day: 'Monday', time: '7:00AM-10:00AM', courseCode: 'BSM AS 2A', courseTitle: 'Applied Statistics', section: 'No info', instructor: 'MACALASIANG, AARON' },
      { day: 'Monday', time: '8:30AM-10:00AM', courseCode: 'MAT 307', courseTitle: 'Mathematics', section: 'BSM AS 3B', instructor: 'ROBERTO, YOLANDA C.' },
      { day: 'Monday', time: '10:00AM-11:30AM', courseCode: 'MAT 403', courseTitle: 'Mathematics', section: 'BSM BA 4A', instructor: 'ROBERTO, YOLANDA C.' },
      { day: 'Monday', time: '11:30AM-1:00PM', courseCode: 'MAT 403', courseTitle: 'Mathematics', section: 'BSM AS 4A', instructor: 'ROBERTO, YOLANDA C.' },
      { day: 'Monday', time: '2:00PM-3:30PM', courseCode: 'MAT 403', courseTitle: 'Mathematics', section: 'BSM AS 4B', instructor: 'ROBERTO, YOLANDA C.' },
      { day: 'Monday', time: '3:30PM-5:00PM', courseCode: 'MAT 403', courseTitle: 'Mathematics', section: 'BSM BA 4B', instructor: 'ROBERTO, YOLANDA C.' },
      { day: 'Monday', time: '5:30PM-6:30PM', courseCode: 'STS 101', courseTitle: 'Science, Technology and Society', section: 'BSBA 1C', instructor: 'ANTONIO, ELYSSA GRACE A.' },
      
      // Tuesday
      { day: 'Tuesday', time: '8:30AM-10:00AM', courseCode: 'RPH 101', courseTitle: 'Readings in Philippine History', section: 'BSM BA 3B', instructor: 'MANAHAN, INAH MARIFAYE B.' },
      { day: 'Tuesday', time: '10:00AM-11:30AM', courseCode: 'MAT 205', courseTitle: 'Mathematics', section: 'BSM BA 2A', instructor: 'VIOLA, JOSELITO' },
      { day: 'Tuesday', time: '11:30AM-1:00PM', courseCode: 'MAT 205', courseTitle: 'Mathematics', section: 'BSM BA 2B', instructor: 'VIOLA, JOSELITO' },
      { day: 'Tuesday', time: '2:00PM-3:30PM', courseCode: 'MAT 205', courseTitle: 'Mathematics', section: 'BSM CS 2A G1', instructor: 'VIOLA, JOSELITO' },
      { day: 'Tuesday', time: '2:00PM-3:30PM', courseCode: 'MAT 205', courseTitle: 'Mathematics', section: 'BSM CS 2A G2', instructor: 'VIOLA, JOSELITO' },
      { day: 'Tuesday', time: '3:30PM-5:00PM', courseCode: 'MAT 307', courseTitle: 'Mathematics', section: 'BSM AS 3A', instructor: 'ROBERTO, YOLANDA C.' },
      { day: 'Tuesday', time: '5:00PM-6:30PM', courseCode: 'MAT 307', courseTitle: 'Mathematics', section: 'BSM AS 3B', instructor: 'ROBERTO, YOLANDA C.' },
      
      // Wednesday
      { day: 'Wednesday', time: '7:00AM-8:30AM', courseCode: 'MAT 206', courseTitle: 'Mathematics', section: 'BSM CS 2B G1', instructor: 'CAMARA, EVELYN' },
      { day: 'Wednesday', time: '7:00AM-8:30AM', courseCode: 'MAT 206', courseTitle: 'Mathematics', section: 'BSM CS 2B G2', instructor: 'CAMARA, EVELYN' },
      { day: 'Wednesday', time: '8:30AM-10:00AM', courseCode: 'MAT 206', courseTitle: 'Mathematics', section: 'BSM CS 2A G1', instructor: 'CAMARA, EVELYN' },
      { day: 'Wednesday', time: '8:30AM-10:00AM', courseCode: 'MAT 206', courseTitle: 'Mathematics', section: 'BSM CS 2A G2', instructor: 'CAMARA, EVELYN' },
      { day: 'Wednesday', time: '10:00AM-11:30AM', courseCode: 'MAT 307', courseTitle: 'Mathematics', section: 'BSM AS 3A', instructor: 'ROBERTO, YOLANDA C.' },
      { day: 'Wednesday', time: '11:30AM-1:00PM', courseCode: 'MAT 403', courseTitle: 'Mathematics', section: 'BSM BA 4A', instructor: 'ROBERTO, YOLANDA C.' },
      { day: 'Wednesday', time: '2:00PM-3:30PM', courseCode: 'MAT 206', courseTitle: 'Mathematics', section: 'BSM BA 2A', instructor: 'CAMARA, EVELYN' },
      { day: 'Wednesday', time: '3:30PM-5:00PM', courseCode: 'MAT 107', courseTitle: 'Mathematics', section: 'BSM CS 1A G1', instructor: 'MARCELINO, LYCA D.' },
      { day: 'Wednesday', time: '3:30PM-5:00PM', courseCode: 'MAT 107', courseTitle: 'Mathematics', section: 'BSM CS 1A G2', instructor: 'MARCELINO, LYCA D.' },
      { day: 'Wednesday', time: '5:00PM-7:00PM', courseCode: 'MAT 105', courseTitle: 'Mathematics', section: 'BSM AS 1B', instructor: 'MARCELINO, LYCA D.' },
      
      // Thursday
      { day: 'Thursday', time: '7:30AM-8:30AM', courseCode: 'No info', courseTitle: 'No info', section: 'BSM AS 3B', instructor: 'MANAHAN, INAH MARIFAYE B.' },
      { day: 'Thursday', time: '8:30AM-10:00AM', courseCode: 'MAT 205', courseTitle: 'Mathematics', section: 'BSM CS 2A G1', instructor: 'VIOLA, JOSELITO' },
      { day: 'Thursday', time: '8:30AM-10:00AM', courseCode: 'MAT 205', courseTitle: 'Mathematics', section: 'BSM CS 2A G2', instructor: 'VIOLA, JOSELITO' },
      { day: 'Thursday', time: '10:00AM-11:30AM', courseCode: 'MAT 205', courseTitle: 'Mathematics', section: 'BSM AS 2B', instructor: 'VIOLA, JOSELITO' },
      { day: 'Thursday', time: '11:30AM-1:00PM', courseCode: 'MAT 205', courseTitle: 'Mathematics', section: 'BSM AS 2A', instructor: 'VIOLA, JOSELITO' },
      { day: 'Thursday', time: '1:00PM-4:00PM', courseCode: 'FEL 301', courseTitle: 'English as a Foreign Language', section: 'BSM BA 3B', instructor: 'DELA CRUZ, BERNADETTE' },
      { day: 'Thursday', time: '5:00PM-6:30PM', courseCode: 'MBA 207', courseTitle: 'Business Administration', section: 'BSM BA 2B', instructor: 'DELA CRUZ, BERNADETTE' },
      { day: 'Thursday', time: '6:30PM-8:00PM', courseCode: 'MBA 207', courseTitle: 'Business Administration', section: 'BSM BA 2A', instructor: 'DELA CRUZ, BERNADETTE' },
      
      // Friday
      { day: 'Friday', time: '7:00AM-9:00AM', courseCode: 'MAT 105', courseTitle: 'Mathematics', section: 'BSM CS 1B G1', instructor: 'VIOLA, JOSELITO' },
      { day: 'Friday', time: '7:00AM-9:00AM', courseCode: 'MAT 105', courseTitle: 'Mathematics', section: 'BSM CS 1B G2', instructor: 'VIOLA, JOSELITO' },
      { day: 'Friday', time: '10:00AM-11:30AM', courseCode: 'MAT 306', courseTitle: 'Mathematics', section: 'BSM CS 3B G1', instructor: 'DELA CRUZ, HARRIS' },
      { day: 'Friday', time: '10:00AM-11:30AM', courseCode: 'MAT 306', courseTitle: 'Mathematics', section: 'BSM CS 3B G2', instructor: 'DELA CRUZ, HARRIS' },
      { day: 'Friday', time: '11:30AM-1:00PM', courseCode: 'MAT 206', courseTitle: 'Mathematics', section: 'BSM CS 2B G1', instructor: 'CAMARA, EVELYN' },
      { day: 'Friday', time: '11:30AM-1:00PM', courseCode: 'MAT 206', courseTitle: 'Mathematics', section: 'BSM CS 2B G2', instructor: 'CAMARA, EVELYN' },
      { day: 'Friday', time: '1:00PM-2:30PM', courseCode: 'MAT 205', courseTitle: 'Mathematics', section: 'BSM CS 2B G1', instructor: 'VIOLA, JOSELITO' },
      { day: 'Friday', time: '1:00PM-2:30PM', courseCode: 'MAT 205', courseTitle: 'Mathematics', section: 'BSM CS 2B G2', instructor: 'VIOLA, JOSELITO' },
      { day: 'Friday', time: '3:00PM-5:00PM', courseCode: 'MAS 307', courseTitle: 'Advanced Statistics', section: 'BSM AS 3B', instructor: 'GALVEZ, ARCEL F.' },
      { day: 'Friday', time: '5:00PM-8:00PM', courseCode: 'PHY 202a', courseTitle: 'Physics', section: 'BSM CS 2A G1', instructor: 'POÑADO, ROSARIO' },
      { day: 'Friday', time: '5:00PM-8:00PM', courseCode: 'PHY 202a', courseTitle: 'Physics', section: 'BSM CS 2A G2', instructor: 'POÑADO, ROSARIO' }
    ]
  },
  {
    id: 'fh-avrb',
    name: 'FH AVR B',
    building: 'Federizo Hall',
    floor: 2,
    capacity: 80,
    type: 'LECTURE_HALL',
    facilities: ['Projector', 'Sound System', 'Aircon', 'Microphone'],
    schedules: [
      // Monday
      { day: 'Monday', time: '7:00AM-9:00AM', courseCode: 'MLSAP 402', courseTitle: 'Medical Laboratory Science Aptitude', section: 'BSMT 4A', instructor: 'SANTOS, MARIA SALOME C.' },
      { day: 'Monday', time: '9:00AM-12:00PM', courseCode: 'MLSS 402', courseTitle: 'Medical Laboratory Science Skills', section: 'BSMT 4A', instructor: 'SANTOS, MARIA SALOME C.' },
      { day: 'Monday', time: '1:00PM-3:00PM', courseCode: 'MLSAP 402', courseTitle: 'Medical Laboratory Science Aptitude', section: 'BSMT 4B', instructor: 'SANTOS, MARIA SALOME C.' },
      { day: 'Monday', time: '3:00PM-6:00PM', courseCode: 'MLSS 402', courseTitle: 'Medical Laboratory Science Skills', section: 'BSMT 4B', instructor: 'SANTOS, MARIA SALOME C.' },
      
      // Tuesday
      { day: 'Tuesday', time: '7:00AM-10:00AM', courseCode: 'AAP 101', courseTitle: 'Anatomy and Physiology', section: 'BSMT 2', instructor: 'DE JESUS, BENEDICT' },
      { day: 'Tuesday', time: '10:00AM-12:00PM', courseCode: 'MLSCPH 201', courseTitle: 'Clinical Parasitology', section: 'BSMT 2', instructor: 'TOBIAS, JOHN RHIL D.' },
      { day: 'Tuesday', time: '12:00PM-1:30PM', courseCode: 'ESC 302', courseTitle: 'Environmental Science', section: 'BSES 3A 2S 25-26', instructor: 'BASILIO, ELEONOR' },
      { day: 'Tuesday', time: '2:00PM-5:00PM', courseCode: 'MLSCH 103', courseTitle: 'Clinical Chemistry', section: 'BSMT 1A', instructor: 'RONQUILLO, EDEN' },
      { day: 'Tuesday', time: '5:00PM-6:30PM', courseCode: 'ESM 302', courseTitle: 'Environmental Science Management', section: 'BSES 3B 2S 25-26', instructor: 'VITUG, LAWRENCE V.' },
      
      // Wednesday
      { day: 'Wednesday', time: '7:30AM-9:00AM', courseCode: 'MLSMTL 201', courseTitle: 'Medical Technology Laws', section: 'BSMT 2', instructor: 'SINGIAN, ELOISA Q.' },
      { day: 'Wednesday', time: '9:00AM-10:00AM', courseCode: 'MLSPST 201', courseTitle: 'Professional Skills Training', section: 'BSMT 2', instructor: 'SINGIAN, ELOISA Q.' },
      { day: 'Wednesday', time: '10:00AM-11:00AM', courseCode: 'MLSMBD 301', courseTitle: 'Medical Bacteriology', section: 'BSMT 3', instructor: 'SINGIAN, ELOISA Q.' },
      { day: 'Wednesday', time: '12:30PM-2:00PM', courseCode: 'MLSHEMA 302', courseTitle: 'Hematology', section: 'BSMT 3', instructor: 'SOTTO, JAMIE M.' },
      { day: 'Wednesday', time: '2:00PM-5:00PM', courseCode: 'PID 101', courseTitle: 'Principles of Infectious Diseases', section: 'BSMT 2', instructor: 'NEO, MERYDAY' },
      { day: 'Wednesday', time: '5:00PM-8:00PM', courseCode: 'ECS 404', courseTitle: 'Environmental Chemistry', section: 'BSES 4A 2S 25-26', instructor: 'ARRIETA, THELMA' },
      
      // Thursday
      { day: 'Thursday', time: '7:30AM-9:00AM', courseCode: 'MLSMTL 201', courseTitle: 'Medical Technology Laws', section: 'BSMT 2', instructor: 'SINGIAN, ELOISA Q.' },
      { day: 'Thursday', time: '9:00AM-10:00AM', courseCode: 'MLSPST 201', courseTitle: 'Professional Skills Training', section: 'BSMT 2', instructor: 'SINGIAN, ELOISA Q.' },
      { day: 'Thursday', time: '10:00AM-11:00AM', courseCode: 'MLSMBD 301', courseTitle: 'Medical Bacteriology', section: 'BSMT 3', instructor: 'SINGIAN, ELOISA Q.' },
      { day: 'Thursday', time: '11:00AM-12:00PM', courseCode: 'MLSHEMA 302', courseTitle: 'Hematology', section: 'BSMT 3', instructor: 'CRUZ, MERLYN C.' },
      { day: 'Thursday', time: '2:00PM-5:00PM', courseCode: 'MAT 305', courseTitle: 'Mathematics', section: 'BSFT 2A', instructor: 'DUENAS, REYMOND B.' },
      { day: 'Thursday', time: '5:00PM-8:00PM', courseCode: 'UTS 101', courseTitle: 'Understanding the Self', section: 'BSES 1A CCDM 2S 25-26', instructor: 'LODRIGITO, MARK ANTHONY' },
      
      // Friday
      { day: 'Friday', time: '7:00AM-10:00AM', courseCode: 'NSTP 11', courseTitle: 'National Service Training Program', section: 'BSMT 1B', instructor: 'TABASURAEZ, GLIEZA' },
      { day: 'Friday', time: '10:00AM-1:00PM', courseCode: 'NSTP 11', courseTitle: 'National Service Training Program', section: 'BSMT 1A', instructor: 'TABASURAEZ, GLIEZA' },
      { day: 'Friday', time: '1:00PM-2:00PM', courseCode: 'FES 408', courseTitle: 'Food Entrepreneurship', section: 'BSFT 4A', instructor: 'DE GUZMAN, MARICEL' },
      { day: 'Friday', time: '2:00PM-5:00PM', courseCode: 'FCS 401', courseTitle: 'Food Chemistry', section: 'BSFT 1A', instructor: 'DE GUZMAN, MARICEL' }
    ]
  },
  // FH 205
  {
    id: 'fh-205',
    name: 'FH 205',
    building: 'Federizo Hall',
    floor: 2,
    capacity: 40,
    type: 'CLASSROOM',
    facilities: ['Projector', 'Whiteboard'],
    schedules: [
      { day: 'Monday', time: '10:00AM-1:00PM', courseCode: 'MCS 206', courseTitle: 'Computer Science', section: 'BSM CS 2A G1', instructor: 'GALVEZ, ARCEL F.' },
      { day: 'Monday', time: '1:00PM-4:00PM', courseCode: 'MCS 206', courseTitle: 'Computer Science', section: 'BSM CS 2B G2', instructor: 'GALVEZ, ARCEL F.' },
      { day: 'Monday', time: '4:00PM-7:00PM', courseCode: 'MCS 206', courseTitle: 'Computer Science', section: 'BSM CS 2B G1', instructor: 'GALVEZ, ARCEL F.' },
      { day: 'Tuesday', time: '7:00AM-10:00AM', courseCode: 'BSM AS 4B G', courseTitle: 'Applied Statistics', section: '', instructor: 'DELA CRUZ, AARHUS M.' },
      { day: 'Tuesday', time: '10:00AM-1:00PM', courseCode: 'MCS 206', courseTitle: 'Computer Science', section: 'BSM CS 2A G2', instructor: 'GALVEZ, ARCEL F.' },
      { day: 'Tuesday', time: '1:00PM-4:00PM', courseCode: 'MAS 304', courseTitle: 'Advanced Statistics', section: 'BSM AS 3B', instructor: 'VALEROSO, JOSHUA' },
      { day: 'Tuesday', time: '4:00PM-7:00PM', courseCode: 'MAS 304', courseTitle: 'Advanced Statistics', section: 'BSM AS 3A', instructor: 'VALEROSO, JOSHUA' },
      { day: 'Wednesday', time: '7:00AM-10:00AM', courseCode: 'BSM CS 4B G2', courseTitle: 'Computer Science', section: '', instructor: 'DELA CRUZ, AARHUS' },
      { day: 'Wednesday', time: '10:00AM-1:00PM', courseCode: 'MCS 206', courseTitle: 'Computer Science', section: 'BSM CS 2A G1', instructor: 'GALVEZ, ARCEL F.' },
      { day: 'Wednesday', time: '1:00PM-4:00PM', courseCode: 'MAS 307', courseTitle: 'Advanced Statistics', section: 'BSM AS 3A', instructor: 'GALVEZ, ARCEL F.' },
      { day: 'Wednesday', time: '4:00PM-7:00PM', courseCode: 'MAS 307', courseTitle: 'Advanced Statistics', section: 'BSM AS 3B', instructor: 'GALVEZ, ARCEL F.' },
      { day: 'Thursday', time: '7:00AM-8:30AM', courseCode: 'BSM CS 3B', courseTitle: 'Computer Science', section: '', instructor: 'DELA CRUZ, HARRIS' },
      { day: 'Thursday', time: '8:30AM-11:30AM', courseCode: 'BSM CS 3A G2', courseTitle: 'Computer Science', section: '', instructor: 'DELA CRUZ, HARRIS' },
      { day: 'Thursday', time: '10:00AM-11:30AM', courseCode: 'BSM CS 3A', courseTitle: 'Computer Science', section: '', instructor: 'DELA CRUZ, HARRIS' },
      { day: 'Thursday', time: '11:30AM-1:00PM', courseCode: 'BSM AS 3B', courseTitle: 'Applied Statistics', section: '', instructor: 'DELA CRUZ, HARRIS' },
      { day: 'Thursday', time: '1:00PM-4:00PM', courseCode: 'MCS 206', courseTitle: 'Computer Science', section: 'BSM CS 2B G1', instructor: 'GALVEZ, ARCEL F.' },
      { day: 'Thursday', time: '4:00PM-7:00PM', courseCode: 'MCS 206', courseTitle: 'Computer Science', section: 'BSM CS 2B G2', instructor: 'GALVEZ, ARCEL F.' },
      { day: 'Friday', time: '7:00AM-8:30AM', courseCode: 'BSM AS 3B', courseTitle: 'Applied Statistics', section: '', instructor: 'DELA CRUZ, HARRIS' },
      { day: 'Friday', time: '10:00AM-1:00PM', courseCode: 'BSM AS 3A', courseTitle: 'Applied Statistics', section: '', instructor: 'CLEMENTE, CARLA M.' },
      { day: 'Friday', time: '10:00AM-1:00PM', courseCode: 'MAT 306', courseTitle: 'Mathematics', section: '', instructor: 'CLEMENTE, CARLA M.' },
      { day: 'Friday', time: '2:00PM-5:00PM', courseCode: 'BST 305L', courseTitle: 'Business Statistics Lab', section: 'BSM 3B', instructor: 'MANDAP, MARCO' },
      { day: 'Friday', time: '4:00PM-7:00PM', courseCode: 'MAS 203a', courseTitle: 'Statistics', section: 'BSM AS 2B', instructor: 'MAGTULIS Mary Ann C' },
      { day: 'Saturday', time: '7:00AM-10:00AM', courseCode: 'MAT 306', courseTitle: 'Mathematics', section: 'BSM BA 3A', instructor: 'DELA CRUZ, HARRIS' },
      { day: 'Saturday', time: '10:00AM-1:00PM', courseCode: 'MAT 306', courseTitle: 'Mathematics', section: 'BSM BA 3B', instructor: 'DELA CRUZ, HARRIS' },
    ]
  },
  // FH 206
  {
    id: 'fh-206',
    name: 'FH 206',
    building: 'Federizo Hall',
    floor: 2,
    capacity: 40,
    type: 'CLASSROOM',
    facilities: ['Projector', 'Whiteboard'],
    schedules: [
      { day: 'Monday', time: '7:00AM-8:30AM', courseCode: 'BSM AS 4B', courseTitle: 'Applied Statistics', section: '', instructor: 'VALEROSO, JOSHUA' },
      { day: 'Monday', time: '8:30AM-10:00AM', courseCode: 'AAH 101a', courseTitle: 'Art Appreciation', section: '', instructor: 'VALEROSO, JOSHUA' },
      { day: 'Monday', time: '10:00AM-11:30AM', courseCode: 'BSM AS 4A', courseTitle: 'Applied Statistics', section: '', instructor: 'VALEROSO, JOSHUA' },
      { day: 'Monday', time: '11:30AM-1:00PM', courseCode: 'BSM CS 4A G2', courseTitle: 'Computer Science', section: '', instructor: 'VALEROSO, JOSHUA' },
      { day: 'Monday', time: '1:00PM-2:30PM', courseCode: 'BSM CS 4B', courseTitle: 'Computer Science', section: '', instructor: 'DUQUE, RAINILYN' },
      { day: 'Monday', time: '2:30PM-4:00PM', courseCode: 'BSM BA 4B', courseTitle: 'Business Applications', section: '', instructor: 'VALEROSO, JOSHUA' },
      { day: 'Monday', time: '4:00PM-5:30PM', courseCode: 'BSM CS 2A G2', courseTitle: 'Computer Science', section: '', instructor: 'Ellenita Manalaysay' },
      { day: 'Tuesday', time: '8:30AM-10:00AM', courseCode: 'AAH 101a', courseTitle: 'Art Appreciation', section: '', instructor: 'DE LEON, SHIELA' },
      { day: 'Tuesday', time: '10:00AM-1:00PM', courseCode: 'BSM CS 2B', courseTitle: 'Computer Science', section: '', instructor: 'Manalaysay Ellenita' },
      { day: 'Tuesday', time: '1:00PM-2:30PM', courseCode: 'MAS 307', courseTitle: 'Advanced Statistics', section: '', instructor: 'GALVEZ, ARCEL' },
      { day: 'Tuesday', time: '2:30PM-4:00PM', courseCode: 'MAS 204a', courseTitle: 'Statistics', section: '', instructor: 'CLEMENTE, CARLA' },
      { day: 'Tuesday', time: '4:00PM-5:30PM', courseCode: 'MAT 204a', courseTitle: 'Mathematics', section: '', instructor: 'ESTRELLA, BENEDICT' },
      { day: 'Wednesday', time: '7:00AM-8:30AM', courseCode: 'BSM CS 2A', courseTitle: 'Computer Science', section: '', instructor: 'CAMARA, EVELYN' },
      { day: 'Wednesday', time: '8:30AM-10:00AM', courseCode: 'MAT 306', courseTitle: 'Mathematics', section: '', instructor: 'DELA CRUZ, HARRIS' },
      { day: 'Wednesday', time: '11:30AM-1:00PM', courseCode: 'BSM CS 4A', courseTitle: 'Computer Science', section: '', instructor: 'Valeroso Joshua' },
      { day: 'Wednesday', time: '1:00PM-2:30PM', courseCode: 'MAT 206', courseTitle: 'Mathematics', section: '', instructor: 'VALEROSO, JOSHUA' },
      { day: 'Wednesday', time: '2:30PM-4:00PM', courseCode: 'BSM BA 4A', courseTitle: 'Business Applications', section: '', instructor: 'VALEROSO, JOSHUA' },
      { day: 'Wednesday', time: '4:00PM-5:30PM', courseCode: 'BSM AS 4A', courseTitle: 'Applied Statistics', section: '', instructor: 'VALEROSO, JOSHUA' },
      { day: 'Wednesday', time: '5:30PM-8:00PM', courseCode: 'BSM AS 4B', courseTitle: 'Applied Statistics', section: '', instructor: 'VALEROSO, JOSHUA' },
      { day: 'Thursday', time: '11:30AM-1:00PM', courseCode: 'BSM CS 3A', courseTitle: 'Computer Science', section: '', instructor: 'SANTOS, EDGARDO' },
      { day: 'Thursday', time: '1:00PM-2:30PM', courseCode: 'ESM 206', courseTitle: 'Environmental Science', section: '', instructor: 'VITUG, LAWRENCE' },
      { day: 'Thursday', time: '4:00PM-5:30PM', courseCode: 'MAT 204a', courseTitle: 'Mathematics', section: '', instructor: 'ESTRELLA, BENEDICT' },
      { day: 'Friday', time: '10:00AM-11:30AM', courseCode: 'MAT 307', courseTitle: 'Mathematics', section: '', instructor: 'SANTOS, DR. EDGARDO' },
      { day: 'Friday', time: '11:30AM-1:00PM', courseCode: 'CPE-3C', courseTitle: 'Computer Engineering', section: '', instructor: 'EUSEBIO, AGAPE' },
      { day: 'Friday', time: '1:00PM-2:30PM', courseCode: 'MAT 307', courseTitle: 'Mathematics', section: '', instructor: 'ROBERTO, YOLANDA' },
      { day: 'Friday', time: '2:30PM-4:00PM', courseCode: 'BSM CS 3B G2', courseTitle: 'Computer Science', section: '', instructor: 'ROBERTO, YOLANDA' },
      { day: 'Friday', time: '4:00PM-5:30PM', courseCode: 'MAT 204a', courseTitle: 'Mathematics', section: '', instructor: 'ESTRELLA, BENEDICT' },
    ]
  },
  // FH 207
  {
    id: 'fh-207',
    name: 'FH 207',
    building: 'Federizo Hall',
    floor: 2,
    capacity: 40,
    type: 'CLASSROOM',
    facilities: ['Projector', 'Whiteboard'],
    schedules: [
      { day: 'Monday', time: '7:00AM-9:00AM', courseCode: 'MCS 103a', courseTitle: 'Computer Science', section: 'BSM CS 1A G2', instructor: 'ANGELES, DEO STEPHANIE' },
      { day: 'Monday', time: '9:00AM-11:00AM', courseCode: 'MCS 103a', courseTitle: 'Computer Science', section: 'BSM CS 1A G1', instructor: 'ANGELES, DEO STEPHANIE' },
      { day: 'Monday', time: '11:00AM-1:00PM', courseCode: 'MCS 103a', courseTitle: 'Computer Science', section: 'BSM CS 1B G1', instructor: 'ANGELES, DEO STEPHANIE' },
      { day: 'Monday', time: '1:00PM-3:00PM', courseCode: 'MAS 203a', courseTitle: 'Statistics', section: 'BSM AS 2B', instructor: 'MAGTULIS, MARYANN C' },
      { day: 'Monday', time: '3:00PM-4:00PM', courseCode: 'MAT 405', courseTitle: 'Mathematics', section: 'BSM CS 4B G1', instructor: 'DUQUE, RAINILYN' },
      { day: 'Monday', time: '4:00PM-6:00PM', courseCode: 'MAS 203a', courseTitle: 'Statistics', section: 'BSM AS 2A', instructor: 'MAGTULIS, MARYANN C' },
      { day: 'Tuesday', time: '7:00AM-10:00AM', courseCode: 'MCS 103a', courseTitle: 'Computer Science', section: 'BSM CS 1B G1', instructor: 'ANGELES, DEO STEPHANIE' },
      { day: 'Tuesday', time: '10:00AM-1:00PM', courseCode: 'MCS 103a', courseTitle: 'Computer Science', section: 'BSM CS 1B G2', instructor: 'ANGELES, DEO STEPHANIE' },
      { day: 'Tuesday', time: '2:00PM-5:00PM', courseCode: 'MAS 203a', courseTitle: 'Statistics', section: 'BSM AS 2A', instructor: 'MAGTULIS, MARYANN C' },
      { day: 'Tuesday', time: '5:00PM-8:00PM', courseCode: 'FEL 401', courseTitle: 'Elective', section: 'BSM AS 4A', instructor: 'GALVEZ, ARCEL F' },
      { day: 'Wednesday', time: '7:00AM-10:00AM', courseCode: 'MCS 103a', courseTitle: 'Computer Science', section: 'BSM CS 1A G1', instructor: 'ANGELES, DEO STEPHANIE' },
      { day: 'Wednesday', time: '10:00AM-1:00PM', courseCode: 'MAS 204a', courseTitle: 'Statistics', section: 'BSM AS 2B', instructor: 'CLEMENTE, CARLA M' },
      { day: 'Wednesday', time: '2:00PM-5:00PM', courseCode: 'MAS 204a', courseTitle: 'Statistics', section: 'BSM AS 2A', instructor: 'CLEMENTE, CARLA M' },
      { day: 'Wednesday', time: '5:00PM-8:00PM', courseCode: 'MAS 103', courseTitle: 'Basic Statistics', section: 'BSM AS 1A', instructor: 'MAGTULIS, MARYANN C' },
      { day: 'Thursday', time: '7:00AM-8:30AM', courseCode: 'BSM CS 3A G1', courseTitle: 'Computer Science', section: '', instructor: 'DELA CRUZ, AARHUS M M' },
      { day: 'Thursday', time: '8:30AM-10:00AM', courseCode: 'MAT 305', courseTitle: 'Mathematics', section: 'BSM CS 3B G1', instructor: 'DELA CRUZ, AARHUS M M' },
      { day: 'Thursday', time: '10:00AM-1:00PM', courseCode: 'MAS 305', courseTitle: 'Advanced Statistics', section: 'BSM AS 3A', instructor: 'MANGARAN, ARMELE' },
      { day: 'Thursday', time: '2:00PM-5:00PM', courseCode: 'MAS 305', courseTitle: 'Advanced Statistics', section: 'BSM AS 3B', instructor: 'MANGARAN, ARMELE' },
      { day: 'Thursday', time: '5:00PM-8:00PM', courseCode: 'MAS 103', courseTitle: 'Basic Statistics', section: 'BSM AS 1B', instructor: 'MAGTULIS, MARYANN C' },
      { day: 'Friday', time: '7:00AM-8:30AM', courseCode: 'BSM AS 3A', courseTitle: 'Applied Statistics', section: '', instructor: 'DELA CRUZ, AARHUS M M' },
      { day: 'Friday', time: '8:30AM-10:00AM', courseCode: 'MAT 305', courseTitle: 'Mathematics', section: 'BSM AS 3B', instructor: 'DELA CRUZ, AARHUS M M' },
      { day: 'Friday', time: '10:00AM-1:00PM', courseCode: 'MCS 103a', courseTitle: 'Computer Science', section: 'BSM CS 1A G2', instructor: 'ANGELES, DEO STEPHANIE' },
      { day: 'Friday', time: '2:00PM-5:00PM', courseCode: 'MAS 306', courseTitle: 'Advanced Statistics', section: 'BSM AS 3A', instructor: 'CLEMENTE, CARLA M' },
      { day: 'Friday', time: '5:00PM-8:00PM', courseCode: 'FEL 401', courseTitle: 'Elective', section: 'BSM AS 4B', instructor: 'GALVEZ, ARCEL F' },
      { day: 'Saturday', time: '10:00AM-1:00PM', courseCode: 'MBA 306', courseTitle: 'Business Administration', section: 'BSM BA 3A', instructor: 'MANDAP, MARCO' },
      { day: 'Saturday', time: '1:00PM-4:00PM', courseCode: 'MBA 306', courseTitle: 'Business Administration', section: 'BSM BA 3B', instructor: 'MANDAP, MARCO' },
    ]
  },

];

// Helper functions
const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Replace the existing getTodaySchedule function
function getTodaySchedule(room: Room, selectedDate: Date): ScheduleEntry[] {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = dayNames[selectedDate.getDay()];
  return room.schedules.filter(s => s.day === today).sort((a, b) => {
    const timeA = timeToMinutes(a.time);
    const timeB = timeToMinutes(b.time);
    return timeA - timeB;
  });
}

// Replace the existing isRoomOccupied function
function isRoomOccupied(room: Room, selectedDate: Date): boolean {
  const todaySchedule = getTodaySchedule(room, selectedDate);
  const currentMinutes = getCurrentTimeInMinutes();
  
  return todaySchedule.some(schedule => {
    const [startStr, endStr] = schedule.time.split('-');
    const startMinutes = timeToMinutes(startStr);
    const endMinutes = timeToMinutes(endStr);
    return isTimeInRange(currentMinutes, startMinutes, endMinutes);
  });
}

// Replace the existing getCurrentMeeting function
function getCurrentMeeting(room: Room, selectedDate: Date): ScheduleEntry | null {
  const todaySchedule = getTodaySchedule(room, selectedDate);
  const currentMinutes = getCurrentTimeInMinutes();
  
  return todaySchedule.find(schedule => {
    const [startStr, endStr] = schedule.time.split('-');
    const startMinutes = timeToMinutes(startStr);
    const endMinutes = timeToMinutes(endStr);
    return isTimeInRange(currentMinutes, startMinutes, endMinutes);
  }) || null;
}
// Add these new helper functions
function timeToMinutes(timeStr: string): number {
  const startTime = timeStr.split('-')[0];
  const match = startTime.match(/(\d+):(\d+)([AP]M)/i);
  if (!match) return 0;
  
  let hour = parseInt(match[1]);
  const minute = parseInt(match[2]);
  const period = match[3].toUpperCase();
  
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  
  return hour * 60 + minute;
}

function isTimeInRange(currentMinutes: number, startMinutes: number, endMinutes: number): boolean {
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

function getCurrentTimeInMinutes(): number {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  return hours * 60 + minutes;
}

function getRoomStatusDetails(room: Room, selectedDate: Date): { status: string; message: string; color: string } {
  const currentMeeting = getCurrentMeeting(room, selectedDate);
  
  if (currentMeeting) {
    return {
      status: 'occupied',
      message: `Occupied: ${currentMeeting.courseCode} until ${currentMeeting.time.split('-')[1]}`,
      color: 'red'
    };
  }
  
  const todaySchedule = getTodaySchedule(room, selectedDate);
  const currentMinutes = getCurrentTimeInMinutes();
  
  const nextClass = todaySchedule.find(schedule => {
    const startMinutes = timeToMinutes(schedule.time);
    return startMinutes > currentMinutes;
  });
  
  if (nextClass) {
    const nextStart = nextClass.time.split('-')[0];
    return {
      status: 'available',
      message: `Available until ${nextStart}`,
      color: 'green'
    };
  }
  
  return {
    status: 'available',
    message: 'No more classes today',
    color: 'green'
  };
}


// ─── Main Page Component ─────────────────────────────────
export default function RoomSchedules() {
  const { settings } = useAccessibility();
  const fil = settings.language === 'fil';

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('');
  const [filterType, setFilterType] = useState('');
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const buildings = Array.from(new Set(ROOMS.map(r => r.building)));
  const roomTypes = Array.from(new Set(ROOMS.map(r => r.type)));

  const toggleExpanded = (roomId: string) => {
    setExpandedRooms(prev => {
      const newSet = new Set(prev);
      
      if (newSet.has(roomId)) {
        // Close this room
        newSet.delete(roomId);
      } else {
        // Close all others and open this one (exclusive behavior)
        newSet.clear();
        newSet.add(roomId);
      }
      
      return newSet;
    });
  };

  const filteredRooms = ROOMS.filter(room => {
    if (filterBuilding && room.building !== filterBuilding) return false;
    if (filterType && room.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return room.name.toLowerCase().includes(q) ||
             room.building.toLowerCase().includes(q) ||
             room.type.toLowerCase().includes(q);
    }
    return true;
  });

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d);
  };

  const formatDateDisplay = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return fil ? 'Ngayon' : 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return fil ? 'Bukas' : 'Tomorrow';
    return date.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const exportSchedules = () => {
    const headers = ['Room', 'Building', 'Day', 'Time', 'Course Code', 'Course Title', 'Section', 'Instructor'];
    const rows: string[][] = [];
    
    filteredRooms.forEach(room => {
      room.schedules.forEach(schedule => {
        rows.push([
          room.name,
          room.building,
          schedule.day,
          schedule.time,
          schedule.courseCode,
          schedule.courseTitle,
          schedule.section,
          schedule.instructor
        ]);
      });
    });

    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `room-schedules-${selectedDate.toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const getRoomTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CLASSROOM: fil ? 'Silid-aralan' : 'Classroom',
      LABORATORY: fil ? 'Laboratoryo' : 'Laboratory',
      LECTURE_HALL: fil ? 'Lecture Hall' : 'Lecture Hall',
      COMPUTER_LAB: fil ? 'Computer Lab' : 'Computer Lab',
    };
    return labels[type] || type;
  };

  return (
  <div className="min-h-screen py-6 px-4 lg:px-8  from-gray-50 via-white to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-500 dark:to-purple-500 bg-clip-text text-transparent flex items-center gap-3">
            <School className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
            {fil ? 'Room Schedules' : 'Room Schedules'}
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">
            {fil ? 'College of Science room schedules' : 'College of Science room schedules'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportSchedules}
            className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-400 hover:bg-purple-100 dark:hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            title={fil ? 'I-export ang schedules' : 'Export Schedules (CSV)'}
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-4 shadow-sm dark:shadow-none">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Date */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800/50 rounded-xl p-1">
            <button onClick={() => changeDate(-1)} className="p-2.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-slate-300" />
            </button>
            <div className="px-4 py-2 min-w-[130px] text-center">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{formatDateDisplay(selectedDate)}</p>
              <p className="text-[10px] text-gray-500 dark:text-slate-500">{selectedDate.toLocaleDateString('en-PH')}</p>
            </div>
            <button onClick={() => changeDate(1)} className="p-2.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-slate-300" />
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={fil ? 'Maghanap ng silid o building...' : 'Search rooms or buildings...'}
              className="w-full pl-12 pr-10 py-3 bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                <X className="w-4 h-4 text-gray-400 dark:text-slate-400" />
              </button>
            )}
          </div>

          {/* Building */}
          <div className="relative">
            <select value={filterBuilding} onChange={e => setFilterBuilding(e.target.value)}
              className="appearance-none px-4 py-3 pr-8 bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 cursor-pointer min-w-[150px]">
              <option value="">{fil ? 'Lahat ng Building' : 'All Buildings'}</option>
              {buildings.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            
          </div>

          {/* Type */}
          <div className="relative">
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="appearance-none px-4 py-3 pr-8 bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 cursor-pointer min-w-[130px]">
              <option value="">{fil ? 'Lahat ng Uri' : 'All Types'}</option>
              {roomTypes.map(t => <option key={t} value={t}>{getRoomTypeLabel(t)}</option>)}
            </select>
            
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800/50 rounded-xl p-1">
            <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-cyan-500 text-white' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-white/10'}`}>
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-cyan-500 text-white' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-white/10'}`}>
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
        {searchQuery && (
          <div className="mt-2 text-[10px] text-cyan-600 dark:text-cyan-400">
            {filteredRooms.length} result{filteredRooms.length !== 1 ? 's' : ''} found
          </div>
        )}
      </div>

      {/* Content */}
      {filteredRooms.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm">
          <Building2 className="w-16 h-16 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-200 mb-2">{fil ? 'Walang nahanap na silid' : 'No rooms found'}</h3>
          <button onClick={() => { setSearchQuery(''); setFilterBuilding(''); setFilterType(''); }}
            className="px-4 py-2 bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 rounded-xl hover:bg-cyan-100 dark:hover:bg-cyan-500/30 transition-colors font-medium">
            {fil ? 'I-clear lahat ng filter' : 'Clear all filters'}
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="space-y-3">
          {filteredRooms.map(room => {
            const todaySchedule = getTodaySchedule(room, selectedDate);
            const isOccupied = isRoomOccupied(room, selectedDate);
            const currentMeeting = getCurrentMeeting(room, selectedDate);
            
            // Sort schedules by time (earliest first)
            const sortedTodaySchedule = [...todaySchedule].sort((a, b) => {
              const getTimeValue = (timeStr: string) => {
                const [start] = timeStr.split('-');
                const [hour, minute, period] = start.match(/(\d+):(\d+)([AP]M)/)?.slice(1) || [];
                let hourNum = parseInt(hour);
                if (period === 'PM' && hourNum !== 12) hourNum += 12;
                if (period === 'AM' && hourNum === 12) hourNum = 0;
                return hourNum * 60 + (parseInt(minute) || 0);
              };
              return getTimeValue(a.time) - getTimeValue(b.time);
            });
            
            // Sort full schedules by day order and time
            const sortedFullSchedules = [...room.schedules].sort((a, b) => {
              const dayOrder = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7 };
              const dayDiff = (dayOrder[a.day as keyof typeof dayOrder] || 0) - (dayOrder[b.day as keyof typeof dayOrder] || 0);
              if (dayDiff !== 0) return dayDiff;
              
              const getTimeValue = (timeStr: string) => {
                const [start] = timeStr.split('-');
                const [hour, minute, period] = start.match(/(\d+):(\d+)([AP]M)/)?.slice(1) || [];
                let hourNum = parseInt(hour);
                if (period === 'PM' && hourNum !== 12) hourNum += 12;
                if (period === 'AM' && hourNum === 12) hourNum = 0;
                return hourNum * 60 + (parseInt(minute) || 0);
              };
              return getTimeValue(a.time) - getTimeValue(b.time);
            });
            
            return (
              <div key={room.id} className="group flex flex-wrap items-center gap-4 p-5 bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-lg transition-all shadow-sm">
                {/* Room Info - Larger */}
                <div className="flex items-center gap-4 flex-1 min-w-[240px]">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <DoorOpen className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{room.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />{room.building} • Floor {room.floor} • {getRoomTypeLabel(room.type)}
                    </p>
                  </div>
                </div>
                
              {/* Status and Actions */}
<div className="flex items-center gap-3">
  <div className="flex items-center gap-2">
    <span className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-700/50 rounded-xl">
      <Users className="w-5 h-5 text-gray-600 dark:text-slate-400" />
      <span className="text-sm font-semibold text-gray-900 dark:text-white">{room.capacity}</span>
    </span>
    <span className={`px-4 py-2 text-sm font-semibold rounded-xl flex items-center gap-2 ${
      isOccupied
        ? 'bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30'
        : 'bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30'
    }`}>
      <span className={`w-2 h-2 rounded-full ${isOccupied ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
      {isOccupied ? (fil ? 'Occupied' : 'Occupied') : (fil ? 'Available' : 'Available')}
    </span>
  </div>

  <button
    onClick={() => toggleExpanded(room.id)}
    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
  >
    <Calendar className="w-5 h-5" />
    {expandedRooms.has(room.id) 
      ? (fil ? 'Isara' : 'Close') 
      : (fil ? 'Tingnan Schedule' : 'View Schedule')
    }
  </button>
</div>

{/* Expanded Schedule - List View */}
{expandedRooms.has(room.id) && (
  <div className="w-full mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
    {/* Today's Schedule */}
    <h4 className="text-base font-semibold text-gray-800 dark:text-slate-300 mb-3 flex items-center gap-2">
      <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
      {formatDateDisplay(selectedDate)} Schedule
      <span className="text-xs text-cyan-600 dark:text-cyan-400">({sortedTodaySchedule.length})</span>
    </h4>
    
    {sortedTodaySchedule.length > 0 ? (
      <div className="space-y-3 max-h-[400px] overflow-y-auto mb-6">
        {sortedTodaySchedule.map((schedule, idx) => (
          <div key={idx} className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors">
            <span className="text-sm font-mono text-cyan-600 dark:text-cyan-400 min-w-[100px] font-semibold">{schedule.time}</span>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-gray-900 dark:text-white">{schedule.courseCode} - {schedule.courseTitle}</p>
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-0.5">Instructor: {schedule.instructor || 'TBA'}</p>
              {schedule.section && (
                <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">Section: {schedule.section}</p>
              )}
            </div>
            {currentMeeting?.time === schedule.time && (
              <span className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-bold animate-pulse shadow-md">NOW</span>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-6 mb-6 bg-gray-50 dark:bg-slate-800/30 rounded-xl">
        <p className="text-base text-gray-500 dark:text-slate-400">No classes scheduled for this day</p>
      </div>
    )}

    {/* Full Weekly Schedule */}
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-slate-300 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
        {fil ? 'Buong Weekly Schedule' : 'Full Weekly Schedule'}
      </h4>
      {sortedFullSchedules.length > 0 ? (
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {DAYS_ORDER.map(day => {
            const daySchedules = sortedFullSchedules.filter(s => s.day === day);
            if (daySchedules.length === 0) return null;
            return (
              <div key={day} className="mb-4">
                <p className="text-base font-bold text-cyan-600 dark:text-cyan-400 mb-2 pb-1 border-b border-cyan-200 dark:border-cyan-500/30">{day}</p>
                <div className="space-y-2">
                  {daySchedules.map((schedule, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/30 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors">
                      <span className="text-sm font-mono text-cyan-600 dark:text-cyan-400 min-w-[100px] font-semibold">{schedule.time}</span>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900 dark:text-white">{schedule.courseCode} - {schedule.courseTitle}</p>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-0.5">Instructor: {schedule.instructor || 'TBA'}</p>
                      </div>
                      {schedule.section && (
                        <span className="text-xs px-2 py-1 bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 rounded-lg whitespace-nowrap font-medium">
                          {schedule.section}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-base text-gray-500 dark:text-slate-500 text-center py-6">No schedules available</p>
      )}
    </div>
  </div>
)}
              </div>
            );
          })}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
          {filteredRooms.map(room => {
            const todaySchedule = getTodaySchedule(room, selectedDate);
            
            const currentMeeting = getCurrentMeeting(room, selectedDate);
            
            // Sort schedules by time (earliest first)
            const sortedTodaySchedule = [...todaySchedule].sort((a, b) => {
              const getTimeValue = (timeStr: string) => {
                const [start] = timeStr.split('-');
                const [hour, minute, period] = start.match(/(\d+):(\d+)([AP]M)/)?.slice(1) || [];
                let hourNum = parseInt(hour);
                if (period === 'PM' && hourNum !== 12) hourNum += 12;
                if (period === 'AM' && hourNum === 12) hourNum = 0;
                return hourNum * 60 + (parseInt(minute) || 0);
              };
              return getTimeValue(a.time) - getTimeValue(b.time);
            });
            
            // Sort full schedules by day order and time
            const sortedFullSchedules = [...room.schedules].sort((a, b) => {
              const dayOrder = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7 };
              const dayDiff = (dayOrder[a.day as keyof typeof dayOrder] || 0) - (dayOrder[b.day as keyof typeof dayOrder] || 0);
              if (dayDiff !== 0) return dayDiff;
              
              const getTimeValue = (timeStr: string) => {
                const [start] = timeStr.split('-');
                const [hour, minute, period] = start.match(/(\d+):(\d+)([AP]M)/)?.slice(1) || [];
                let hourNum = parseInt(hour);
                if (period === 'PM' && hourNum !== 12) hourNum += 12;
                if (period === 'AM' && hourNum === 12) hourNum = 0;
                return hourNum * 60 + (parseInt(minute) || 0);
              };
              return getTimeValue(a.time) - getTimeValue(b.time);
            });
            
            return (
              <div key={room.id} className="group relative self-start bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden transition-all duration-300 hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-xl hover:-translate-y-1 shadow-sm">
                {/* Header - Larger */}
                <div className="p-5 border-b border-gray-100 dark:border-slate-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-md">
                        <DoorOpen className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{room.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-slate-400 flex items-center gap-1 mt-1"><MapPin className="w-4 h-4" />{room.building} • Floor {room.floor}</p>
                      </div>
                    </div>
                    {(() => {
                      const isOccupied = isRoomOccupied(room, selectedDate);
                      return (
                        <span className={`px-4 py-2 text-sm font-semibold rounded-xl flex items-center gap-2 border ${
                          isOccupied
                            ? 'bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30'
                            : 'bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30'
                        }`}>
                          <span className={`w-2.5 h-2.5 rounded-full ${isOccupied ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
                          {isOccupied ? (fil ? 'Occupied' : 'Occupied') : (fil ? 'Available' : 'Available')}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Info Section - Larger */}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-slate-700/50 rounded-xl text-gray-700 dark:text-slate-300">
                      <Users className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                      <span className="font-semibold">{room.capacity}</span>
                      <span className="text-xs text-gray-500 dark:text-slate-500">capacity</span>
                    </span>
                    <span className="px-3 py-1.5 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 rounded-xl text-sm font-medium border border-cyan-200 dark:border-cyan-500/20">
                      {getRoomTypeLabel(room.type)}
                    </span>
                  </div>

                  {/* Current Meeting - Larger */}
                  {currentMeeting && (
                    <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/20 mb-4">
                      <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> IN SESSION NOW
                      </p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{currentMeeting.courseCode} - {currentMeeting.courseTitle}</p>
                      <p className="text-sm text-gray-700 dark:text-slate-300 mt-1">{currentMeeting.instructor}</p>
                      <p className="text-xs text-gray-600 dark:text-slate-400 flex items-center gap-1 mt-2"><Clock className="w-3.5 h-3.5" />{currentMeeting.time}</p>
                    </div>
                  )}

                  {/* Today's Schedule - Sorted by time (earliest first) */}
                  {sortedTodaySchedule.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                      <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> 
                        {fil ? 'Schedule Ngayon' : "Today's Schedule"} 
                        <span className="text-xs text-cyan-600 dark:text-cyan-400">({sortedTodaySchedule.length})</span>
                      </p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {sortedTodaySchedule.slice(0, 4).map((schedule, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors">
                            <span className="font-mono text-sm text-cyan-600 dark:text-cyan-400 min-w-[90px] font-semibold">{schedule.time}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{schedule.courseCode}</p>
                              <p className="text-xs text-gray-600 dark:text-slate-400 truncate">{schedule.courseTitle}</p>
                            </div>
                          </div>
                        ))}
                        {sortedTodaySchedule.length > 4 && (
                          <p className="text-xs text-gray-500 dark:text-slate-500 text-center py-1">+{sortedTodaySchedule.length - 4} more schedules</p>
                        )}
                      </div>
                    </div>
                  )}

                  {sortedTodaySchedule.length === 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                      <p className="text-base text-green-600 dark:text-green-400 font-medium flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        {fil ? 'Walang klase ngayong araw' : 'No classes today'}
                      </p>
                    </div>
                  )}
                </div>

                
                {/* Button */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => toggleExpanded(room.id)}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold text-base hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    {expandedRooms.has(room.id) 
                      ? (fil ? 'Isara' : 'Close') 
                      : (fil ? 'Buong Schedule' : 'Full Schedule')
                    }
                  </button>
                </div>

                {/* Expanded Full Schedule */}
                {expandedRooms.has(room.id) && (
                  <div className="border-t border-gray-100 dark:border-slate-700 p-5 bg-gray-50 dark:bg-slate-900/30">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-slate-300 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      {fil ? 'Buong Schedule' : 'Full Schedule'}
                    </h4>
                    
                    {sortedFullSchedules.length > 0 ? (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {DAYS_ORDER.map(day => {
                          const daySchedules = sortedFullSchedules.filter(s => s.day === day);
                          if (daySchedules.length === 0) return null;
                          return (
                            <div key={day} className="mb-4">
                              <p className="text-base font-bold text-cyan-600 dark:text-cyan-400 mb-2 pb-1 border-b border-cyan-200 dark:border-cyan-500/30">
                                {day}
                              </p>
                              <div className="space-y-2">
                                {daySchedules.map((schedule, idx) => (
                                  <div 
                                    key={idx} 
                                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-white dark:bg-slate-800/30 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
                                  >
                                    <span className="text-sm font-mono text-cyan-600 dark:text-cyan-400 min-w-[100px] font-semibold">
                                      {schedule.time}
                                    </span>
                                    <div className="flex-1">
                                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                                        {schedule.courseCode} - {schedule.courseTitle}
                                      </p>
                                      <p className="text-sm text-gray-600 dark:text-slate-400 mt-0.5">
                                        Instructor: {schedule.instructor || 'TBA'}
                                      </p>
                                    </div>
                                    {schedule.section && (
                                      <span className="text-xs px-2 py-1 bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 rounded-lg whitespace-nowrap font-medium">
                                        {schedule.section}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-base text-gray-500 dark:text-slate-500 text-center py-6">
                        No schedules available
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
);
}