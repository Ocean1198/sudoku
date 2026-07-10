/*
generate.js를 옮깁니다.
findviolations, isCorrectAnswer 등 검증 로직은 sudokuRules.ts로 옮깁니다.
*/

export function generate(br: number, bc: number, level: number, seed = 42): { answer: number[][]; puzzle: number[][] } {

    const random: () => number = mulberry32(seed);

    const n = br * bc;

    const boardOri: number[][] = makeAns(br, bc, random);
    const board: number[][] = boardOri.map(row => row.slice());

    const minHint = Math.round(n*n * [0.4, 0.35, 0.3, 0.25][level]);
    const maxAtt = [1000, 10000, 50000, 100000][level];

    const randomIdx: [number, number][] = [];
    for (let r = 0; r < n; r++) 
        for (let c = 0; c < n; c++) 
            randomIdx.push([r, c]);
    shuffle(randomIdx, random);

    let hint = n * n;
    for (let i = 0; i < randomIdx.length; i++) {
        const [rr, rc] = randomIdx[i];
        const ori = board[rr][rc];
        board[rr][rc] = 0;
        hint -= 1;
        const [sol, att] = solver(board, br, bc);
        if (sol != 1) {
            board[rr][rc] = ori;
            hint += 1;
        }
        if (att > maxAtt || hint - 1 < minHint)
            break
    }

    return {
        answer: boardOri,
        puzzle: board,
    };

}

function makeAns(br: number, bc: number, random: () => number): number[][] {

    const n = br * bc;

    const board = array2d(n);
    const row = Array.from({length: n}, () => new Set());
    const col = Array.from({length: n}, () => new Set());
    const block = Array.from({length: n}, () => new Set());

    function dfs(r: number, c: number): boolean {
        if (c == n) return true;

        const blockIdx = Math.floor(r / br) * br + Math.floor(c / bc);
        const available: number[] = [];

        for (let i = 1; i <= n; i++) {
            if (!row[r].has(i) &&
                !col[c].has(i) &&
                !block[blockIdx].has(i)){
                available.push(i);
            }
        }

        if (available.length === 0) 
            return false;

        shuffle(available, random);

        for (let i = 0; i < available.length; i++) {
            const num = available[i];
            board[r][c] = num;
            row[r].add(num);
            col[c].add(num);
            block[blockIdx].add(num);

            const result = r == n-1
                ? dfs(0, c+1)
                : dfs(r+1, c);
            if (result)
                return true;

            board[r][c] = 0;
            row[r].delete(num);
            col[c].delete(num);
            block[blockIdx].delete(num);
        }

        return false;
    }

    dfs(0, 0);
    return board;
}

function solver(board: number[][], br: number, bc: number): [number, number] {
    const n = br * bc;
    let sol = 0;
    let backtrack = 0;
    
    const row = Array.from({length: n}, (_, i) => new Set(board[i]));
    const col = Array.from({length: n}, (_, i) => new Set(board.map(r => r[i])));
    const block = Array.from({length: n}, () => new Set());

    const blockIdx: number[] = [];
    
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            blockIdx.push(Math.floor(r / br) * br + Math.floor(c / bc));
        }
    }
    
    const emptyCells: [number, number][] = [];
    
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {

            if (board[i][j] === 0) {
                emptyCells.push([i, j]);
            }

            block[blockIdx[i*n + j]].add(board[i][j]);
        }
    }
    
    function dfs(index: number): number {
        backtrack += 1;
        if (sol >= 2) 
            return 2;
        if (index == emptyCells.length) {
            sol += 1
            return sol
        }
        
        const [r, c] = emptyCells[index];
        const b = Math.floor(r / br) * br + Math.floor(c / bc);
        
        const available: number[] = [];
        for (let i = 1; i <= n; i++) {
            if (!row[r].has(i) &&
                !col[c].has(i) &&
                !block[b].has(i)){
                available.push(i);
            }
        }
        
        for (let i = 0; i < available.length; i++) {
            const num = available[i];
            board[r][c] = num;
            row[r].add(num);
            col[c].add(num);
            block[b].add(num)
            
            dfs(index + 1);
            
            board[r][c] = 0;
            row[r].delete(num);
            col[c].delete(num);
            block[b].delete(num);
        }
        
        return sol;
    }
    
    dfs(0);
    return [sol, backtrack];
    
}

function array2d(size: number): number[][] {
    const arr = Array.from(
        { length: size },
        () => new Array<number>(size)
    );
    for (let i = 0; i < size; i++)
        arr[i] = new Array(size);
    return arr;
}
function shuffle<T>(arr: T[], random: () => number) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
}
function mulberry32(seed: number): () => number {
    return function() {
        seed |= 0;
        seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export default generate;