// server/src/config/language-detection.config.ts
/**
 * Comprehensive Language Detection Configuration
 * Covers 100+ languages from Google Translate for fast detection
 */

export interface LanguagePattern {
  name: string;
  patterns: RegExp[];
  unicodeRanges?: RegExp[];
  confidence: number;
}

/**
 * Unicode Script Detection (Non-Latin Scripts)
 * Highest confidence - unique character sets
 */
export const UNICODE_SCRIPT_LANGUAGES: LanguagePattern[] = [
  {
    name: 'Japanese',
    unicodeRanges: [/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/],
    patterns: [],
    confidence: 1.0
  },
  {
    name: 'Chinese',
    unicodeRanges: [/[\u4E00-\u9FFF]/],
    patterns: [],
    confidence: 1.0
  },
  {
    name: 'Korean',
    unicodeRanges: [/[\uAC00-\uD7AF\u1100-\u11FF]/],
    patterns: [],
    confidence: 1.0
  },
  {
    name: 'Arabic',
    unicodeRanges: [/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/],
    patterns: [],
    confidence: 1.0
  },
  {
    name: 'Hebrew',
    unicodeRanges: [/[\u0590-\u05FF]/],
    patterns: [],
    confidence: 1.0
  },
  {
    name: 'Hindi/Devanagari',
    unicodeRanges: [/[\u0900-\u097F]/],
    patterns: [],
    confidence: 1.0
  },
  {
    name: 'Thai',
    unicodeRanges: [/[\u0E00-\u0E7F]/],
    patterns: [],
    confidence: 1.0
  },
  {
    name: 'Bengali',
    unicodeRanges: [/[\u0980-\u09FF]/],
    patterns: [],
    confidence: 1.0
  },
  {
    name: 'Tamil',
    unicodeRanges: [/[\u0B80-\u0BFF]/],
    patterns: [],
    confidence: 1.0
  },
  {
    name: 'Telugu',
    unicodeRanges: [/[\u0C00-\u0C7F]/],
    patterns: [],
    confidence: 1.0
  },
  {
    name: 'Gujarati',
    unicodeRanges: [/[\u0A80-\u0AFF]/],
    patterns: [],
    confidence: 1.0
  },
  {
    name: 'Kannada',
    unicodeRanges: [/[\u0C80-\u0CFF]/],
    patterns: [],
    confidence: 1.0
  },
  {
    name: 'Malayalam',
    unicodeRanges: [/[\u0D00-\u0D7F]/],
    patterns: [],
    confidence: 1.0
  },
  {
    name: 'Sinhala',
    unicodeRanges: [/[\u0D80-\u0DFF]/],
    patterns: [],
    confidence: 1.0
  },
  {
    name: 'Myanmar',
    unicodeRanges: [/[\u1000-\u109F]/],
    patterns: [],
    confidence: 1.0
  },
  {
    name: 'Khmer',
    unicodeRanges: [/[\u1780-\u17FF]/],
    patterns: [],
    confidence: 1.0
  },
  {
    name: 'Lao',
    unicodeRanges: [/[\u0E80-\u0EFF]/],
    patterns: [],
    confidence: 1.0
  },
  {
    name: 'Georgian',
    unicodeRanges: [/[\u10A0-\u10FF]/],
    patterns: [],
    confidence: 1.0
  },
  {
    name: 'Armenian',
    unicodeRanges: [/[\u0530-\u058F]/],
    patterns: [],
    confidence: 1.0
  },
  {
    name: 'Ethiopic',
    unicodeRanges: [/[\u1200-\u137F]/],
    patterns: [],
    confidence: 1.0
  },
  {
    name: 'Russian/Cyrillic',
    unicodeRanges: [/[\u0400-\u04FF]/],
    patterns: [],
    confidence: 1.0
  },
  {
    name: 'Greek',
    unicodeRanges: [/[\u0370-\u03FF]/],
    patterns: [],
    confidence: 1.0
  }
];

/**
 * Filipino/Tagalog Common Words
 * Used to identify and ALLOW Filipino queries
 */
export const FILIPINO_PATTERNS = /\b(ano|mga|ng|sa|ang|ay|ko|mo|siya|kami|kayo|sila|ba|na|pa|po|opo|hindi|oo|kumusta|magandang|araw|gabi|umaga|tanong|sagot|programa|kurso|paaralan|unibersidad|kolehiyo|agham|pag-aaral|estudyante|guro|propesyor|paano|saan|kailan|sino|bakit|ilan|mayroon|wala|gusto|kailangan|pwede|maaari)\b/i;

/**
 * Latin-Script Foreign Languages
 * Common words that indicate non-English/Filipino languages
 * Includes Philippine regional languages (NOT allowed - only English and Filipino/Tagalog)
 */
export const LATIN_SCRIPT_LANGUAGES: LanguagePattern[] = [
  // Philippine Regional Languages (NOT allowed)
  // Using UNIQUE keywords that don't overlap with Filipino/Tagalog
  {
    name: 'Cebuano/Bisaya',
    patterns: [/\b(unsaon|kanus-a|unsa|kinsa|ngano|gabii|buntag|tuon|kat-on|nganong|dili|wala)\b/i],
    confidence: 0.95
  },
  {
    name: 'Ilocano/Ilokano',
    patterns: [/\b(kasano|sadino|kaano|ania|siasino|apay|nasayaat|agyaman|pangngaasi|rabii|bigat|malem|adal|sursuro|saan|awan)\b/i],
    confidence: 0.95
  },
  {
    name: 'Kapampangan/Pampango',
    patterns: [/\b(makananu|nokarin|kapilan|nanu|ninu|mayap|pakilugi|aldo|bengi|abak|gatpanapun|mag-iral|alang|atin)\b/i],
    confidence: 0.95
  },
  {
    name: 'Hiligaynon/Ilonggo',
    patterns: [/\b(diin|san-o|sin-o|ngaa|gab-i|tun-an|tudlo|indi|wara)\b/i],
    confidence: 0.95
  },
  {
    name: 'Waray',
    patterns: [/\b(hain|kakan-o|hin-o|ngain|maupay|kulop|tun-on|waray|diri)\b/i],
    confidence: 0.95
  },
  {
    name: 'Bicolano/Bikol',
    patterns: [/\b(sain|siisay|ta-ano|marhay|tabi|banggi|magtukdo|dai|mayo)\b/i],
    confidence: 0.95
  },
  {
    name: 'Pangasinan',
    patterns: [/\b(pansianno|iner|anto|siopa|akin|mabiskeg|siyempre|agew|bukas|listo|eskuelaan|manursuro|ituro)\b/i],
    confidence: 0.95
  },
  {
    name: 'Maranao',
    patterns: [/\b(piyaano|kapiya|onopa|sinopa|ngata|madait|tima kasih|tolong|gawi|kapipitaan|eskuyla|pagtudtod)\b/i],
    confidence: 0.95
  },
  {
    name: 'Tausug',
    patterns: [/\b(maunu|kaunu|unu|hisiyu|mayta|marayaw|dūm|subu|iskul|magtutultul|magtudju)\b/i],
    confidence: 0.95
  },
  {
    name: 'Maguindanao',
    patterns: [/\b(paanu|kapiya|ngin|sinopa|ngata|mapia|pakilabi|delem|gagawi|iskul|pagtudtu)\b/i],
    confidence: 0.95
  },
  {
    name: 'Chavacano',
    patterns: [/\b(como|donde|cuando|quien|porque|bueno|dia|noche|mañana|tarde|escuela|estudia|enseña)\b/i],
    confidence: 0.95
  },
  
  // European Languages
  {
    name: 'Spanish',
    patterns: [/\b(universidad|curso|mejor|estudiar|ciencia|carrera|hola|gracias|por favor|buenos días|buenas noches|cómo|dónde|cuándo|qué|quién|por qué)\b/i],
    confidence: 0.95
  },
  {
    name: 'French',
    patterns: [/\b(université|cours|meilleur|étudier|science|carrière|bonjour|merci|s'il vous plaît|bonne journée|bonne nuit|comment|où|quand|quoi|qui|pourquoi)\b/i],
    confidence: 0.95
  },
  {
    name: 'German',
    patterns: [/\b(universität|kurs|beste|studieren|wissenschaft|karriere|hallo|danke|bitte|guten tag|gute nacht|wie|wo|wann|was|wer|warum)\b/i],
    confidence: 0.95
  },
  {
    name: 'Italian',
    patterns: [/\b(università|corso|migliore|studiare|scienza|carriera|ciao|grazie|per favore|buongiorno|buonanotte|come|dove|quando|cosa|chi|perché)\b/i],
    confidence: 0.95
  },
  {
    name: 'Portuguese',
    patterns: [/\b(universidade|melhor|estudar|ciência|carreira|olá|obrigado|por favor|bom dia|boa noite|como|onde|quando|o que|quem|por que)\b/i],
    confidence: 0.95
  },
  {
    name: 'Dutch',
    patterns: [/\b(universiteit|cursus|beste|studeren|wetenschap|carrière|hallo|dank je|alstublieft|goedendag|goedenacht|hoe|waar|wanneer|wat|wie|waarom)\b/i],
    confidence: 0.95
  },
  {
    name: 'Polish',
    patterns: [/\b(uniwersytet|kurs|najlepszy|studiować|nauka|kariera|cześć|dziękuję|proszę|dzień dobry|dobranoc|jak|gdzie|kiedy|co|kto|dlaczego)\b/i],
    confidence: 0.95
  },
  {
    name: 'Swedish',
    patterns: [/\b(universitet|bästa|studera|vetenskap|karriär|hej|tack|snälla|god dag|god natt|hur|var|när|vad|vem|varför)\b/i],
    confidence: 0.95
  },
  {
    name: 'Norwegian',
    patterns: [/\b(universitet|beste|studere|vitenskap|karriere|hei|takk|vennligst|god dag|god natt|hvordan|hvor|når|hva|hvem|hvorfor)\b/i],
    confidence: 0.95
  },
  {
    name: 'Danish',
    patterns: [/\b(universitet|bedste|studere|videnskab|karriere|hej|tak|venligst|god dag|god nat|hvordan|hvor|hvornår|hvad|hvem|hvorfor)\b/i],
    confidence: 0.95
  },
  {
    name: 'Finnish',
    patterns: [/\b(yliopisto|paras|opiskella|tiede|ura|hei|kiitos|ole hyvä|hyvää päivää|hyvää yötä|miten|missä|milloin|mitä|kuka|miksi)\b/i],
    confidence: 0.95
  },
  {
    name: 'Hungarian',
    patterns: [/\b(legjobb|tanfolyam|tanulás|egyetem|tudományos|képzés|kurzus|szia|köszönöm|kérem|jó napot|jó éjszakát|hogyan|hol|mikor|mi|ki|miért)\b/i],
    confidence: 0.95
  },
  {
    name: 'Czech',
    patterns: [/\b(univerzita|kurz|nejlepší|studovat|věda|kariéra|ahoj|děkuji|prosím|dobrý den|dobrou noc|jak|kde|kdy|co|kdo|proč)\b/i],
    confidence: 0.95
  },
  {
    name: 'Romanian',
    patterns: [/\b(universitate|curs|cel mai bun|studia|știință|carieră|salut|mulțumesc|vă rog|bună ziua|noapte bună|cum|unde|când|ce|cine|de ce)\b/i],
    confidence: 0.95
  },
  {
    name: 'Turkish',
    patterns: [/\b(üniversite|kurs|en iyi|çalışmak|bilim|kariyer|merhaba|teşekkürler|lütfen|iyi günler|iyi geceler|nasıl|nerede|ne zaman|ne|kim|neden)\b/i],
    confidence: 0.95
  },
  
  // Asian Languages (Latin script)
  {
    name: 'Indonesian/Malay',
    patterns: [/\b(universitas|kursus|terbaik|belajar|sains|karir|halo|terima kasih|tolong|selamat pagi|selamat malam|bagaimana|di mana|kapan|apa|siapa|mengapa)\b/i],
    confidence: 0.95
  },
  {
    name: 'Vietnamese',
    patterns: [/\b(đại học|khóa học|tốt nhất|học|khoa học|nghề nghiệp|xin chào|cảm ơn|làm ơn|chào buổi sáng|chúc ngủ ngon|như thế nào|ở đâu|khi nào|cái gì|ai|tại sao)\b/i],
    confidence: 0.95
  },
  
  // African Languages
  {
    name: 'Swahili',
    patterns: [/\b(chuo kikuu|kozi|bora|kusoma|sayansi|kazi|habari|asante|tafadhali|habari za asubuhi|usiku mwema|vipi|wapi|lini|nini|nani|kwa nini)\b/i],
    confidence: 0.95
  },
  {
    name: 'Zulu',
    patterns: [/\b(inyuvesi|isifundo|okuhle|ukufunda|isayensi|umsebenzi|sawubona|ngiyabonga|ngicela|sawubona ekuseni|ulale kahle|kanjani|kuphi|nini|yini|ubani|kungani)\b/i],
    confidence: 0.95
  },
  
  // Other Languages
  {
    name: 'Esperanto',
    patterns: [/\b(universitato|kurso|plej bona|studi|scienco|kariero|saluton|dankon|bonvolu|bonan tagon|bonan nokton|kiel|kie|kiam|kio|kiu|kial)\b/i],
    confidence: 0.95
  },
  {
    name: 'Latin',
    patterns: [/\b(universitas|cursus|optimus|studere|scientia|curriculum|salve|gratias|quaeso|bonum diem|bonam noctem|quomodo|ubi|quando|quid|quis|cur)\b/i],
    confidence: 0.95
  }
];

/**
 * Accented Character Detection
 * For European languages that use Latin script with diacritics
 */
export const ACCENTED_CHARS_PATTERN = /[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/i;
export const ACCENTED_CHARS_THRESHOLD = 0.3; // 30% of words with accents
export const ACCENTED_CHARS_CONFIDENCE = 0.85;
