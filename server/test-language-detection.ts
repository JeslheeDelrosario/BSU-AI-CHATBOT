// Test script for language detection fixes
import { detectLanguage } from './src/utils/language-detector';

console.log('🧪 Testing Language Detection Fix\n');

const testCases = [
  {
    input: 'Tell me about Computer Science program',
    expected: 'English',
    shouldPass: true
  },
  {
    input: 'What are the prerequisites for courses?',
    expected: 'English',
    shouldPass: true
  },
  {
    input: 'How do I enroll in COS?',
    expected: 'English',
    shouldPass: true
  },
  {
    input: 'What careers can I pursue with Biology?',
    expected: 'English',
    shouldPass: true
  },
  {
    input: 'Tell me about Environmental Science',
    expected: 'English',
    shouldPass: true
  },
  {
    input: 'Ano ang Computer Science program?',
    expected: 'Filipino',
    shouldPass: true
  },
  {
    input: 'Paano ako mag-enroll sa COS?',
    expected: 'Filipino',
    shouldPass: true
  },
  {
    input: 'Sabihin mo sa akin tungkol sa Biology',
    expected: 'Filipino',
    shouldPass: true
  },
  {
    input: 'Ano ang mga kurso sa kolehiyo?',
    expected: 'Filipino',
    shouldPass: true
  },
  {
    input: 'Magtanong ako tungkol sa programa',
    expected: 'Filipino',
    shouldPass: true
  },
  {
    input: '你好，我想了解计算机科学',
    expected: 'Chinese',
    shouldPass: false
  },
  {
    input: 'Hola, quiero estudiar en la universidad',
    expected: 'Spanish',
    shouldPass: false
  },
  {
    input: 'Unsaon nako pag-enroll sa COS?',
    expected: 'Cebuano',
    shouldPass: false
  }
];

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = detectLanguage(test.input);
  const isCorrect = result.isEnglishOrFilipino === test.shouldPass;
  
  console.log(`Test ${index + 1}: ${isCorrect ? '✅' : '❌'}`);
  console.log(`  Input: "${test.input}"`);
  console.log(`  Expected: ${test.expected} (${test.shouldPass ? 'ALLOW' : 'REJECT'})`);
  console.log(`  Detected: ${result.detectedLanguage} (${result.isEnglishOrFilipino ? 'ALLOW' : 'REJECT'})`);
  console.log(`  Confidence: ${result.confidence}`);
  console.log(`  Reason: ${result.reason}`);
  
  if (isCorrect) {
    passed++;
    console.log('  ✅ PASS\n');
  } else {
    failed++;
    console.log('  ❌ FAIL\n');
  }
});

console.log('═══════════════════════════════════════');
console.log(`Results: ${passed}/${testCases.length} passed`);
console.log(`Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);
console.log('═══════════════════════════════════════\n');

if (failed === 0) {
  console.log('🎉 All tests passed! Language detection is working correctly.\n');
  process.exit(0);
} else {
  console.log(`⚠️  ${failed} test(s) failed. Please review the detection logic.\n`);
  process.exit(1);
}
