import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 倒计时 Hook
 */
export const useCountdown = (initialTime: number) => {
  const time = ref(initialTime)
  const isRunning = ref(false)
  let timer: number | null = null

  const start = () => {
    if (isRunning.value) return
    isRunning.value = true

    timer = window.setInterval(() => {
      if (time.value > 0) {
        time.value--
      } else {
        stop()
      }
    }, 1000)
  }

  const stop = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    isRunning.value = false
  }

  const reset = () => {
    stop()
    time.value = initialTime
  }

  onUnmounted(() => {
    stop()
  })

  return {
    time,
    isRunning,
    start,
    stop,
    reset,
  }
}
