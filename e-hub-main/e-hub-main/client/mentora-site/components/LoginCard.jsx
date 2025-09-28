

const LoginCard = () => (
  <div className="login-card">
    <h3>Entrar</h3>
    <input type="email" placeholder="Email" />
    <input type="password" placeholder="Senha" />
    <button className="primary">Entrar</button>
    <div className="login-links">
      <a href="#">Esqueci minha senha</a>
      <a href="#">Criar conta</a>
    </div>
  </div>
);

export default LoginCard;
