import BentoBox from '../common/Bento';
import CategoryBar from './CategoryBar';

const HeroSection = () => {
  return (
    <div className="relative bg-green-900 overflow-hidden">
      {/* noise texture overlay */}
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />

      {/* category bar */}
      <div className="relative z-10">
        <CategoryBar />
      </div>

      {/* bento section  */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <BentoBox />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;