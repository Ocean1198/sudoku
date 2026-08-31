export interface GameConfig {
  br: number; // block rows
  bc: number; // block columns
  level: number; // difficulty level
}

type NewGameFormProps = {
  initialConfig: GameConfig;
  onStart: (config: GameConfig) => void;
};