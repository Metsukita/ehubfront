


const games = [
  { name: 'LoL Solo/Duo' },
  { name: 'LoL ARAM' },
  { name: 'TFT' },
  { name: 'CS2' },
  { name: 'Valorant' },
];

const GameGrid = () => (
  <div className="game-grid">
    {games.map((game, i) => (
      <div className="game-card" key={i}>
        <h4>{game.name}</h4>
        <button className="primary">Jogar valendo</button>
      </div>
    ))}
  </div>
);

export default GameGrid;
