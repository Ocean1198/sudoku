import {jsontest} from './sudokuGenerator.js';

for (let i = 1; i <= 3; i++) {
    jsontest(3, 3, 0, ["classic", "Anti-Knight"], i);
}
