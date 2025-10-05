export default function SocialLoginButtons({ socialIcon, onClick }) {
  return (
    <div>
      <button className="btn btn-sm rounded-circle" style={{ width: 75, height: 75 }} onClick={onClick}>
        <img src={socialIcon} alt="social icon" style={{ width: 50 }} />
      </button>
    </div>
  );
}
