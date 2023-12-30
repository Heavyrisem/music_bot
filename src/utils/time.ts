function padZero(value: number): string {
  return value.toString().padStart(2, '0');
}

export function formatSecondsToTime(seconds: number): string {
  if (seconds < 0) {
    return 'Invalid input'; // 음수 값에 대한 처리
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const timeArray: string[] = [];

  // 시간이 0보다 크면 표시
  if (hours > 0) {
    timeArray.push(`${hours}`);
  }

  // 분이 0보다 크면 표시
  if (minutes > 0 || timeArray.length > 0) {
    timeArray.push(hours > 0 ? padZero(minutes) : `${minutes}`);
  }

  // 초가 0이 아니면 표시
  if (remainingSeconds > 0 || timeArray.length === 0) {
    timeArray.push(minutes > 0 ? padZero(remainingSeconds) : `${remainingSeconds}`);
  }

  const formattedTime = timeArray.join(':');

  return formattedTime;
}
