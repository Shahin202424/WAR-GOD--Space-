const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('🧪 RUNNING NASA SCIENCE LAB RESPONSIVE & OVERFLOW TEST');
console.log('================================================================');

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
  }
}

const css = fs.readFileSync(path.join(__dirname, '../style.css'), 'utf8');

// 1. URL Overflow rules
assert(css.includes('overflow-wrap: anywhere;'), 'CSS includes overflow-wrap: anywhere;');
assert(css.includes('word-break: break-word;'), 'CSS includes word-break: break-word;');
assert(css.includes('.tel-card-endpoint code'), 'CSS styles .tel-card-endpoint code directly');

// 2. Card boundaries & min-width
const cardBlock = css.substring(css.indexOf('.telemetry-card {'), css.indexOf('.telemetry-card:hover'));
assert(cardBlock.includes('min-width: 0;'), '.telemetry-card has min-width: 0 to prevent grid column blowout');
assert(cardBlock.includes('max-width: 100%;'), '.telemetry-card has max-width: 100%');
assert(cardBlock.includes('box-sizing: border-box;'), '.telemetry-card has box-sizing: border-box');
assert(cardBlock.includes('overflow: hidden;'), '.telemetry-card has overflow: hidden for boundary safety');

// 3. Responsive Grid columns
const gridBlock = css.substring(css.indexOf('.telemetry-cards-grid {'), css.indexOf('.telemetry-card {'));
assert(gridBlock.includes('repeat(3, minmax(0, 1fr))'), 'Desktop grid has strictly 3 cards per row with minmax(0, 1fr)');
assert(gridBlock.includes('@media (max-width: 960px)'), 'Tablet breakpoint defined at <= 960px');
assert(gridBlock.includes('repeat(2, minmax(0, 1fr))'), 'Tablet grid has strictly 2 cards per row');
assert(gridBlock.includes('@media (max-width: 600px)'), 'Mobile breakpoint defined at <= 600px');
assert(gridBlock.includes('grid-template-columns: minmax(0, 1fr);'), 'Mobile grid has strictly 1 card per row');

// 4. Modal container overflow containment
const modalBlock = css.substring(css.indexOf('#nasa-telemetry-modal .modal-card'), css.indexOf('.telemetry-subtitle'));
assert(modalBlock.includes('overflow-x: hidden;'), 'Modal card has overflow-x: hidden to eliminate horizontal scrollbar');
assert(modalBlock.includes('overflow-y: auto;'), 'Modal card retains vertical scrolling (overflow-y: auto)');

console.log(`\n🎉 RESULTS: ${passed} / ${total} assertions passed (${(passed/total*100).toFixed(1)}%)`);
if (passed === total) process.exit(0); else process.exit(1);

