import React, { useEffect } from 'react';
import { useSold } from '../../hooks/useSold';
import CountdownTimer from './CountDownTimer';
import { CompassOutlined } from '@ant-design/icons';

export const DepositWithdraw = ({ deposit, withdraw }: any) => {
  const sold = useSold();
  const [inputValue, setInputValue] = React.useState(0);

  const [isExecuteWindow, setIsExecuteWindow] = React.useState(false);
  const [withdrawExpired, setWithdrawExpired] = React.useState(false);

  useEffect(() => {
    checkTimeWindow();
    //const interval = setInterval(checkTimeWindow, 1000);
    // return () => clearInterval(interval);
  }, [sold]);

  const handleInputChange = (event: { target: { value: string } }) => {
    const value = event.target.value;
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setInputValue(numValue);
    }
  };

  const checkTimeWindow = () => {
    if (!sold.tokenManager) return;

    const { pendingWithdrawalAmount, withdrawExecutionWindow, withdrawTimeLock } = sold.tokenManager;
    if (pendingWithdrawalAmount <= 0) return;

    const now = Date.now();
    const withdrawInitiationTime = Number(sold.getWithdrawIntiationTime()) * 1000; // Convert to milliseconds
    const elapsed = now - withdrawInitiationTime;

    const withdrawTimeLockDuration = Number(withdrawTimeLock) * 1000;
    const withdrawExecutionWindowDuration = Number(withdrawExecutionWindow) * 1000;

    console.log(elapsed);
    console.log(withdrawTimeLockDuration);
    console.log(withdrawExecutionWindowDuration);
    if (elapsed < withdrawTimeLockDuration) {
      // Keep running the withdraw time lock timer
      console.log("running withfraw timer");
      setIsExecuteWindow(false);
      setWithdrawExpired(false);
    } else if (elapsed < (withdrawTimeLockDuration + withdrawExecutionWindowDuration)) {
      console.log("running execution timer");
      // Run withdraw execution timer
      setIsExecuteWindow(true);
      setWithdrawExpired(false);
    } else {
      console.log("both time has expired");
      // Both timers have expired
      setIsExecuteWindow(false);
      setWithdrawExpired(true);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center gap-2 p-8 bg-card-bg rounded-lg lg:rounded-xl text-center border border-white border-opacity-10">
      <span className="text-xl font-black -mt-2">Deposit/Withdraw</span>
      <div className="max-w-md mx-auto">
        <input
          type="number"
          placeholder="0"
          className="input input-bordered w-full bg-transparent"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={(e) => e.target.value === '0' && (e.target.value = '')}
        />
        <div className="w-full flex items-center justify-between gap-4 mt-4">
          <button
            className="mainCTA"
            onClick={() => sold.handleDeposit(inputValue)}
            disabled={inputValue <= 0}
          >
            Deposit
          </button>
          {((sold.tokenManager?.pendingWithdrawalAmount || 0 > 0) && !withdrawExpired) ? (
            !isExecuteWindow ? (
              <div className="flex items-center justify-center gap-1 flex-col">
                <button
                  className="secondaryCTA"
                  disabled={true}
                  onClick={() => sold.handleWithdraw(inputValue)}>Withdraw</button>
                <CountdownTimer
                  timerMsg={"opens in"}
                  onFinish={checkTimeWindow}
                  totalTime={Number(sold.getWithdrawTimeLock())}
                  targetTimestamp={Number(sold.getWithdrawIntiationTime())}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1 flex-col">
                <button
                  className="secondaryCTA"
                  onClick={() => sold.handleWithdraw(inputValue)}
                  disabled={withdrawExpired || inputValue <= 0}
                >
                  Withdraw
                </button>
                <CountdownTimer
                  timerMsg={"closes in"}
                  onFinish={checkTimeWindow}
                  totalTime={Number(sold.getWithdrawExecutionWindow())}
                  targetTimestamp={Number(sold.getWithdrawIntiationTime()) + Number(sold.getWithdrawTimeLock())}
                />
              </div>
            )
          ) : (
            <div className="flex items-center justify-center gap-1 flex-col">
              <button
                className="secondaryCTA"
                onClick={() => sold.handleInitiateWithdraw(inputValue)}
                disabled={withdrawExpired || inputValue <= 0}
              >
                Init Withdraw
              </button>
              {withdrawExpired && <span>Withdraw Expired!!</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
