import styles from './rodape.module.css';

function Rodape() {
  const quantAletas = 12;

  return (
    <div className={styles.rodape}>
      {Array.from({ length: quantAletas }).map((_, index) => (
        <div key={index} className={styles.ventilacao} />
      ))}
    </div>
  );
}

export default Rodape;