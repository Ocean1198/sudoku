# Puzzle Data
이 디렉토리는 Sudoku에서 사용되는 퍼즐 데이터를 json 형식으로 담고 있습니다.
실행 시점에서 퍼즐 생성에 소요되는 자원을 줄이는 것을 목표로 하고 있습니다.

## file name format
모든 파일은 json 형식으로 저장되며, 파일명에 퍼즐에 대한 내용이 포함됩니다.

파일명은 다음 형식을 따릅니다.
`{blockRow}{blovkCol}_{difficulty}_{rules}_{index}.json`

각각의 field에 대한 설명은 다음과 같습니다.
| field | description | 
| --- | --- |
| blockRow | 블록의 행 개수 |
| blockCol | 블록의 열 개수 |
| difficulty | 퍼즐의 난이도 |
| rules | 적용된 규칙 |
| index | 퍼즐의 번호이자 seed |

가령 `33_0_100_0001.json`은 행열 3*3의 쉬운 classic 스도쿠 중 첫 번째를 의미합니다.

### rules
현재 사용 가능한 규칙은 3가지입니다.
| name | description | 
| --- | --- |
| classic | 기본 스도쿠 규칙입니다. |
| X-Sudoku | 두 개의 대각선이 1~9로 이루어집니다. |
| Anti-knight | knight의 이동 경로의 값이 모두 달라야 합니다. |

## JSON Structure
각 퍼즐 파일은 다음과 같은 데이터를 포함합니다.

id: Puzzle identifier
blockRows: Number of block rows
blockColumns: Number of block columns
rules: Applied Sudoku rules
difficulty: Puzzle difficulty
puzzle: Initial puzzle board
answer: Completed solution board
