

const spotlights = [
  { title: 'Evento 1', desc: 'Grande final!', date: '28/09' },
  { title: 'Evento 2', desc: 'Classificatória', date: '05/10' },
  { title: 'Evento 3', desc: 'Showmatch', date: '12/10' },
];

const SpotlightCarousel = () => (
  <div className="spotlight-carousel">
    {spotlights.map((s, i) => (
      <div className="spotlight-card" key={i}>
        <h3>{s.title}</h3>
        <p>{s.desc}</p>
        <span>{s.date}</span>
      </div>
    ))}
  </div>
);

export default SpotlightCarousel;
