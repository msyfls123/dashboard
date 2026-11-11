import { actions } from "astro:actions"
import { CHARGING_URL_PATTERN, DEFAULT_PREFIX, MAX_KEY_LENGTH, sortDates, type ChargingSpotRecord } from "consts/parking"
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp"
import { Button } from "./ui/button"
import { REGEXP_ONLY_DIGITS } from "input-otp"


export const ChargingSpot = () => {
  const [lastChargingSpots, setLastChargingSpots] = useState < Array<{ date: string, key: string }>>([])
  const [today] = useState(() => {
    const date = new Date()
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
  })
  const inputRef = useRef<HTMLInputElement>(null);
  const [otpKey, setOtpKey] = useState(DEFAULT_PREFIX)
  const [allowInput, setAllowInput] = useState(false)
  const todayHasKey = useMemo(() => lastChargingSpots[0]?.date === today, [today, lastChargingSpots])

  const focusToLast = useEffectEvent(() => {
    const el = inputRef.current;
    if (!el) return;
    const pos = Math.min(otpKey.length, MAX_KEY_LENGTH);
    el.focus();
    el.setSelectionRange(pos, pos);
  })

  const setSpots = useCallback((record: ChargingSpotRecord) => {
    const dates = sortDates(Object.keys(record))
    dates.reverse()
    setLastChargingSpots(dates.map((date) => ({
      date,
      key: record[date]
    })))
    const todayRecord = record[today]
    setAllowInput(!Boolean(todayRecord))
    if (todayRecord) {
      setOtpKey(todayRecord)
    }
  }, [today])

  useEffect(() => {
    if (!today) return
    actions.parking.getLastChargingSpots().then((res) => {
      if (res.data) {
        setSpots(res.data)
      }
    })
  }, [today])

  useEffect(() => {
    focusToLast()
  }, [])

  const setCurrentChargingSpots = useCallback(() => {
    if (otpKey.length < MAX_KEY_LENGTH) {
      return
    }
    actions.parking.setLastChargingSpot({
      date: today,
      key: otpKey
    }).then((res) => {
      if (res.data) setSpots(res.data)
    })
  }, [otpKey, setSpots])

  const toggleInput = useCallback(() => {
    setAllowInput(prev => !prev)
  }, [])

  return <div className="max-w-160">
    <InputOTP
      value={otpKey}
      onChange={(newVal) => setOtpKey(newVal)}
      minLength={12}
      maxLength={12}
      ref={inputRef}
      pattern={REGEXP_ONLY_DIGITS}
      disabled={!allowInput}
    >
      <InputOTPGroup  className="w-full md:w-auto my-5">
        {Array.from({ length: 12 }).map((v, i) => (
          <InputOTPSlot index={i} className="flex-1" key={i} />
        ))}
      </InputOTPGroup>
    </InputOTP>

    <div className="flex justify-end space-x-5">
      {allowInput && <Button onClick={setCurrentChargingSpots} disabled={otpKey.length < MAX_KEY_LENGTH}>Confirm</Button>}
      {!(allowInput && !todayHasKey) && (
        <Button onClick={toggleInput} variant="outline">{allowInput ? 'Cancel' : 'Change'}</Button>
      )}
    </div>

    <h2 className="mt-10 mb-5">History</h2>
    <ul>
      {lastChargingSpots.map((spot) => (
        <li key={spot.date} className="flex justify-between items-center border-b first:border-t border-emerald-600 p-3">
          <span>{spot.date}</span>
          <a href={CHARGING_URL_PATTERN.replace('{key}', spot.key)} target="_blank">
            <Button variant="outline">
                <span>{spot.key}</span>
            </Button>
          </a>
        </li>
      ))}
    </ul>
  </div>
}
