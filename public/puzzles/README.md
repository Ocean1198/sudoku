# Puzzle Data
이 디렉토리는 Sudoku에서 사용되는 퍼즐 데이터를 json 형식으로 담고 있습니다.
실행 시점에서 퍼즐 생성에 소요되는 자원을 줄이는 것을 목표로 하고 있습니다.

## file name format
모든 파일은 json 형식으로 저장되며, 파일명에 퍼즐에 대한 내용이 포함됩니다.

파일명은 다음 형식을 따릅니다.
`{blockRow}x{blockCol}/{rules}/{difficulty}/{index}.json`

각각의 field에 대한 설명은 다음과 같습니다.
| field | description | 
| --- | --- |
| blockRow | 블록의 행 개수 |
| blockCol | 블록의 열 개수 |
| difficulty | 퍼즐의 난이도 |
| rules | 적용된 규칙 |
| index | 퍼즐의 번호이자 seed |

가령 `3x3/classic/0/0001.json`은 행열 3*3의 쉬운 classic 스도쿠 중 첫 번째를 의미합니다.

### rules
현재 사용 가능한 규칙은 3가지입니다.
| name | code | description | 
| --- | --- |
| classic | classic | 기본 스도쿠 규칙입니다. |
| X-Sudoku | x | 두 개의 대각선이 1~9로 이루어집니다. |
| Anti-knight | antiknight | knight의 이동 경로의 값이 모두 달라야 합니다. |

## JSON Structure
각 퍼즐 파일은 다음과 같은 데이터를 포함합니다.

id: Puzzle identifier
blockRows: Number of block rows
blockColumns: Number of block columns
rules: Applied Sudoku rules
difficulty: Puzzle difficulty
puzzle: Initial puzzle board
answer: Completed solution board

## Puzzle index
`index.json`은 퍼즐 파일을 빠르게 찾기 위한 인덱스이며, 직접 관리하는 파일이 아니라 아래 스크립트로 생성됩니다.

```bash
npm run puzzles:index
```

이 명령은 `scripts/build-puzzle-index.ts`를 실행합니다. 스크립트는 파일명 끝이 `_NNNN.json` 형식인 퍼즐 파일을 찾아, 앞부분의 퍼즐 키별로 번호를 모아 오름차순으로 정렬한 뒤 `index.json`에 기록합니다. 따라서 퍼즐 파일을 추가하거나 이름을 변경한 뒤에는 이 명령을 다시 실행해 인덱스를 갱신해야 합니다.
