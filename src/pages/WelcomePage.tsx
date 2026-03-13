export default function WelcomePage() {
  return (
    <section className='panel'>
      <h2 className='panelTitle'>Welcome</h2>
      <div className='authActions'>
        <button
          type='button'
          onClick={() => {
            window.location.href = 'https://gethuecoin.com';
          }}
        >
          Go to gethuecoin.com
        </button>
      </div>
    </section>
  );
}
