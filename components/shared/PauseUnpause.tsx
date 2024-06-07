export const PauseUnpause = ({ active, setActive }: any) => {
  return (
    <>
      <div className="w-full flex flex-col items-center justify-center gap-2 p-8  bg-card-bg rounded-lg lg:rounded-xl text-center border border-white border-opacity-20">
        <span className='text-xl font-black -mt-2'>Pause/Unpause</span>
        <div className="w-full flex items-center justify-center">
          <div className="rounded-full bg-black p-4">
            {
              active ? <>
                {/* pause */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                </svg>
              </> : <>
                {/* start */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                </svg>
              </>
            }
          </div>
        </div>
        <div className="w-full flex items-center justify-center gap-4 mt-4">
          {
            active ?
              <button
                className='mainCTA'
                onClick={() => { setActive(false) }}

              >
                Unpause
              </button>
              :
              <button
                className='mainCTA'
                onClick={() => { setActive(true) }}
              >
                Pause
              </button>
          }

        </div>
      </div>
    </>
  )
}
