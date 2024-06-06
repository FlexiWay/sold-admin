import SecondRow from '../components/shared/SecondRow';
import StatsCards from '../components/shared/StatsCards';
import ThirdRow from '../components/shared/ThirdRow';


const Index: React.FC = () => {

  return (
    <>
      <section
        className='w-full flex flex-grow h-full flex-col items-center justify-center gap-20'

      >
        <div className="w-full flex flex-col items-center justify-center gap-4">
          <h1>Admin Dashboard</h1>
          <p className='opacity-50 text-center max-w-2xl'>
            Join us in redefining the Solana-based stablecoin space, with our unparalleled 20% yield Solana Dollar.
            Cast your vote and become an early supporter of Solana Dollar.
          </p>
        </div>

        <div className="w-full flex flex-col items-center justify-center gap-6">
          {/* first row */}
          <StatsCards />
          {/* second row */}
          <SecondRow />
          {/* third row */}
          <ThirdRow />
        </div>
      </section >
    </>
  );
};

export default Index;