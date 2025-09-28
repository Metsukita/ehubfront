

type TournamentCardProps = {
  title: string;
  prize: string;
  date: string;
  buyin: string;
};

const TournamentCard = ({ title, prize, date, buyin }: TournamentCardProps) => (
  <div className="tournament-card">
    <h4>{title}</h4>
    <p>Premiação: <strong>{prize}</strong></p>
    <p>Data: <strong>{date}</strong></p>
    <p>Buy-in: <strong>{buyin}</strong></p>
    <div className="tournament-buttons">
      <button className="primary">Participar</button>
      <button>Detalhes</button>
    </div>
  </div>
);

export default TournamentCard;
